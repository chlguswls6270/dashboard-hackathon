import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getSkillsContent, buildSystemPrompt, buildUserPrompt } from '@/lib/prompts';
import { authorizeAI, boundedRequest, errorResponse, isRecord, parseModelResponse, RequestError } from '@/lib/ai-security';

export async function POST(req: NextRequest) {
  const rejected = authorizeAI(req);
  if (rejected) return rejected;
  try {
    const bounded = await boundedRequest(req);
    let formData: FormData;
    try { formData = await bounded.formData(); }
    catch { throw new RequestError(400, '올바른 업로드 형식이 아닙니다.'); }
    const file = formData.get('file');
    const rawText = formData.get('text');
    const filename = formData.get('filename');
    if (filename !== null && (typeof filename !== 'string' || filename.length > 255)) {
      throw new RequestError(400, '파일명이 올바르지 않습니다.');
    }
    let dataText: string;
    if (file !== null) {
      if (typeof file === 'string') throw new RequestError(400, '파일 형식이 올바르지 않습니다.');
      dataText = await file.text();
    } else if (typeof rawText === 'string') {
      dataText = rawText;
    } else {
      throw new RequestError(400, '데이터가 없습니다.');
    }
    if (!dataText.trim()) throw new RequestError(400, '데이터가 없습니다.');
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new RequestError(503, 'AI 분석은 현재 비활성화되어 있습니다.');
    const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({
      model: 'gemini-2.5-flash', generationConfig: { maxOutputTokens: 8192 },
    }, { timeout: 30_000 });
    const result = await model.generateContent([
      { text: buildSystemPrompt(getSkillsContent()) },
      { text: buildUserPrompt(dataText, filename ?? undefined) },
    ]);
    const parsed = parseModelResponse(result.response.text());
    parsed.metadata = {
      ...(isRecord(parsed.metadata) ? parsed.metadata : {}),
      processedAt: new Date().toISOString(),
      dataSource: filename ?? 'upload',
    };
    return NextResponse.json(parsed);
  } catch (error) {
    return errorResponse(error);
  }
}

