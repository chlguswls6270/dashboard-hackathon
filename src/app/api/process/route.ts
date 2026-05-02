import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getSkillsContent, buildSystemPrompt, buildUserPrompt } from '@/lib/prompts';

let cachedSkills: string | null = null;
// We'll move the actual caching logic to getSkillsContent in lib/prompts.ts instead of here
// to keep it cleaner.

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
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const skillsContent = getSkillsContent();
    const systemPrompt = buildSystemPrompt(skillsContent);
    const userPrompt = buildUserPrompt(dataText, filename ?? undefined);

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: userPrompt },
    ]);

    const responseText = result.response.text().trim();
    console.log('[/api/process] AI Response Length:', responseText.length);

    // More robust JSON extraction: Find the first { and the last }
    const firstBrace = responseText.indexOf('{');
    const lastBrace = responseText.lastIndexOf('}');
    
    if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
      console.error('[/api/process] Invalid AI Response:', responseText);
      throw new Error('AI가 유효한 JSON 형식을 반환하지 않았습니다.');
    }
    
    const cleaned = responseText.substring(firstBrace, lastBrace + 1);

    const parsed = JSON.parse(cleaned);

    // --- Enhanced Data Merging ---
    // If AI returns visualization fields (like holdings, priceHistory) at root level,
    // move them into the 'data' object where ChartPanel expects them.
    const systemFields = ['category', 'categoryKo', 'title', 'chartType', 'subChartType', 'summary', 'insights', 'riskLevel', 'timeRange', 'metadata', 'data'];
    const dataObj = parsed.data && typeof parsed.data === 'object' ? { ...parsed.data } : {};
    
    Object.keys(parsed).forEach(key => {
      if (!systemFields.includes(key)) {
        dataObj[key] = parsed[key];
      }
    });
    parsed.data = dataObj;
    // ----------------------------

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
