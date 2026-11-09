import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getSkillsContent, buildSystemPrompt, buildReanalyzePrompt } from '@/lib/prompts';
import { authorizeAI, boundedRequest, errorResponse, isRecord, parseModelResponse, RequestError } from '@/lib/ai-security';

export async function POST(req: NextRequest) {
  const rejected = authorizeAI(req);
  if (rejected) return rejected;
  try {
    const bounded = await boundedRequest(req);
    let body: unknown;
    try { body = await bounded.json(); }
    catch { throw new RequestError(400, '올바른 JSON 형식이 아닙니다.'); }
    if (!isRecord(body) || !isRecord(body.currentData) || typeof body.prompt !== 'string'
        || !body.prompt.trim() || body.prompt.length > 2000) {
      throw new RequestError(400, '분석 데이터와 2,000자 이하의 요청이 필요합니다.');
    }
    const { currentData, prompt } = body;
    const currentJSON = JSON.stringify(currentData);
    if (currentJSON.length > 200_000) throw new RequestError(413, '재분석 데이터가 너무 큽니다.');
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new RequestError(503, 'AI 분석은 현재 비활성화되어 있습니다.');
    const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({
      model: 'gemini-2.5-flash', generationConfig: { maxOutputTokens: 8192 },
    }, { timeout: 30_000 });
    const result = await model.generateContent([
      { text: buildSystemPrompt(getSkillsContent()) },
      { text: buildReanalyzePrompt(currentJSON, prompt) },
    ]);
    const parsed = parseModelResponse(result.response.text());
    parsed.metadata = {
      ...(isRecord(currentData.metadata) ? currentData.metadata : {}),
      ...(isRecord(parsed.metadata) ? parsed.metadata : {}),
      processedAt: new Date().toISOString(), reanalyzed: true,
    };
    return NextResponse.json(parsed);
  } catch (error) {
    return errorResponse(error);
  }
}

