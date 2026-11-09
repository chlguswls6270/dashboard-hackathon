const assert = require('node:assert/strict');
const { test } = require('node:test');
const { authorizeAI, boundedRequest, parseModelResponse, errorResponse, MAX_BODY_BYTES } =
  require('../.test-build/ai-security.js');
const token = 'test-access-code-'.repeat(3);
const request = (headers = {}) => new Request('https://demo.example/api/process', { headers });

test('production fails closed and enforces the access code', () => {
  process.env.NODE_ENV = 'production';
  process.env.ALLOW_LOCAL_DEMO = 'true';
  delete process.env.DEMO_ACCESS_TOKEN;
  assert.equal(authorizeAI(request()).status, 503);
  process.env.DEMO_ACCESS_TOKEN = token;
  assert.equal(authorizeAI(request()).status, 401);
  assert.equal(authorizeAI(request({ authorization: 'Bearer invalid' })).status, 401);
  assert.equal(authorizeAI(new Request('http://localhost/api/process')).status, 401);
});

test('valid requests share a bounded rate limit', () => {
  process.env.DEMO_ACCESS_TOKEN = token;
  for (let i = 0; i < 6; i++) assert.equal(authorizeAI(request({ authorization: 'Bearer ' + token })), null);
  assert.equal(authorizeAI(request({ authorization: 'Bearer ' + token })).status, 429);
});

test('body limit counts actual bytes even with a forged Content-Length', async () => {
  const req = new Request('https://demo.example/api/process', {
    method: 'POST', body: 'x'.repeat(MAX_BODY_BYTES + 1), headers: { 'Content-Length': '1' },
  });
  await assert.rejects(boundedRequest(req), error => error.status === 413);
});

test('bounded bodies preserve form data and JSON', async () => {
  const form = new FormData();
  form.set('file', new Blob(['amount\n10']), 'report.csv');
  const req = await boundedRequest(new Request('https://demo.example/api/process', { method: 'POST', body: form }));
  assert.equal(await (await req.formData()).get('file').text(), 'amount\n10');
  const json = await boundedRequest(new Request('https://demo.example/api/reanalyze', { method: 'POST', body: '{"ok":true}' }));
  assert.deepEqual(await json.json(), { ok: true });
});

test('valid model fields are preserved and legacy chart fields are merged', () => {
  const parsed = parseModelResponse('{"category":"stock","title":"Demo","data":{},"priceHistory":[{"close":1}]}');
  assert.equal(parsed.data.priceHistory[0].close, 1);
});

test('rejects invalid model structures and prototype properties', () => {
  for (const value of ['[]', 'null', '{"title":"Demo","category":"unknown"}',
    '{"title":"Demo","category":"stock","data":[]}',
    '{"title":"Demo","category":"stock","__proto__":{"polluted":true}}',
    '{"title":"Demo","category":"stock","data":{"constructor":{}}}']) {
    assert.throws(() => parseModelResponse(value), error => error.status === 502);
  }
  assert.equal({}.polluted, undefined);
});

test('provider error details never reach clients', async () => {
  const response = errorResponse(new Error('fake-provider-credential'));
  assert.equal(response.status, 502);
  assert.equal((await response.text()).includes('fake-provider-credential'), false);
});

