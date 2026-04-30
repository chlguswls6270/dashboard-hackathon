import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getSkillsContent, buildSystemPrompt, buildUserPrompt } from '@/lib/prompts';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const rawText = formData.get('text') as string | null;
    const filename = formData.get('filename') as string | null;

    let dataText: string;
    if (file) {
      dataText = await file.text();
    } else if (rawText) {
      dataText = rawText;
    } else {
      return NextResponse.json({ error: '데이터가 없습니다.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY가 설정되지 않았습니다.' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const skillsContent = getSkillsContent();
    const systemPrompt = buildSystemPrompt(skillsContent);
    const userPrompt = buildUserPrompt(dataText, filename ?? undefined);

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: userPrompt },
    ]);

    const responseText = result.response.text().trim();

    // Strip markdown code blocks if present
    const cleaned = responseText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const parsed = JSON.parse(cleaned);
    parsed.metadata = parsed.metadata ?? {};
    parsed.metadata.processedAt = new Date().toISOString();
    parsed.metadata.dataSource = filename ?? 'upload';

    return NextResponse.json(parsed);
  } catch (err) {
    console.error('[/api/process]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
