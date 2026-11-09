import { createHash, timingSafeEqual } from 'node:crypto';

export class RequestError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const attempts: number[] = [];
export const MAX_BODY_BYTES = 1024 * 1024;

export function authorizeAI(req: Request): Response | null {
  const token = process.env.DEMO_ACCESS_TOKEN ?? '';
  const origin = req.headers.get('origin');
  const localHosts = ['localhost', '127.0.0.1', '[::1]'];
  let localOrigin = !origin;
  try { localOrigin ||= localHosts.includes(new URL(origin!).hostname); } catch { /* Invalid origin. */ }
  const localDemo = process.env.NODE_ENV !== 'production'
    && process.env.ALLOW_LOCAL_DEMO === 'true'
    && localHosts.includes(new URL(req.url).hostname) && localOrigin
    && !req.headers.has('x-forwarded-for') && !req.headers.has('forwarded');
  if (!localDemo) {
    if (token.length < 32) return Response.json({ error: 'AI 분석은 현재 비활성화되어 있습니다.' }, { status: 503 });
    const auth = req.headers.get('authorization') ?? '';
    const supplied = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    const hash = (value: string) => createHash('sha256').update(value).digest();
    if (!timingSafeEqual(hash(supplied), hash(token))) {
      return Response.json({ error: '분석 접근 코드가 필요합니다.' }, { status: 401 });
    }
  }
  // A local safety cap, not a distributed billing quota. See SECURITY.md.
  const now = Date.now();
  while (attempts.length && attempts[0] <= now - 60_000) attempts.shift();
  if (attempts.length >= 6) {
    return Response.json({ error: '요청이 많습니다. 잠시 후 다시 시도해주세요.' },
      { status: 429, headers: { 'Retry-After': '60' } });
  }
  attempts.push(now);
  return null;
}

/** Count streamed bytes before parsing; Content-Length is not trusted. */
export async function boundedRequest(req: Request): Promise<Request> {
  if (!req.body) throw new RequestError(400, '데이터가 없습니다.');
  const reader = req.body.getReader();
  const buffer = new Uint8Array(MAX_BODY_BYTES);
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new RequestError(413, '요청은 1 MiB 이하여야 합니다.');
      }
      buffer.set(value, size - value.byteLength);
    }
  } finally {
    reader.releaseLock();
  }
  return new Request(req.url, { method: req.method, headers: req.headers, body: buffer.slice(0, size) });
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseModelResponse(text: string): Record<string, unknown> {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end < start || text.length > 200_000) throw new RequestError(502, '분석 결과 형식이 올바르지 않습니다.');
  let parsed: unknown;
  try {
    parsed = JSON.parse(text.slice(start, end + 1), (key, value: unknown) => {
      if (['__proto__', 'constructor', 'prototype'].includes(key)) throw new Error('Unsafe property');
      return value;
    });
  } catch {
    throw new RequestError(502, '분석 결과 형식이 올바르지 않습니다.');
  }
  const categories = ['stock', 'etf', 'portfolio', 'financial_metrics', 'market_indicators',
    'bonds', 'commodities', 'forex', 'crypto', 'macro', 'trade', 'dividend', 'derivatives', 'funds', 'reits', 'dynamic'];
  if (!isRecord(parsed) || typeof parsed.title !== 'string' || !parsed.title.trim()
      || typeof parsed.category !== 'string' || !categories.includes(parsed.category)
      || (parsed.data !== undefined && !isRecord(parsed.data))
      || (parsed.metadata !== undefined && !isRecord(parsed.metadata))
      || (parsed.insights !== undefined && (!Array.isArray(parsed.insights) || !parsed.insights.every(x => typeof x === 'string')))) {
    throw new RequestError(502, '분석 결과 형식이 올바르지 않습니다.');
  }
  const systemFields = ['category', 'categoryKo', 'title', 'chartType', 'subChartType', 'summary',
    'insights', 'riskLevel', 'timeRange', 'metadata', 'data', 'omittedData'];
  const data: Record<string, unknown> = isRecord(parsed.data) ? { ...parsed.data } : {};
  for (const [key, value] of Object.entries(parsed)) {
    if (!systemFields.includes(key)) data[key] = value;
  }
  parsed.data = data;
  return parsed;
}

export function errorResponse(error: unknown): Response {
  // Never return provider errors or log raw uploads / model output / credentials.
  return Response.json(
    { error: error instanceof RequestError ? error.message : '분석을 완료하지 못했습니다. 잠시 후 다시 시도해주세요.' },
    { status: error instanceof RequestError ? error.status : 502 },
  );
}

