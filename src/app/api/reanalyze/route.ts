import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getSkillsContent, buildSystemPrompt, buildReanalyzePrompt } from '@/lib/prompts';

export async function POST(req: NextRequest) {
  try {
    const { currentData, prompt } = await req.json();

    if (!currentData || !prompt) {
      return NextResponse.json({ error: '현재 데이터 상태와 프롬프트가 필요합니다.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY가 설정되지 않았습니다.' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const skillsContent = getSkillsContent();
    const systemPrompt = buildSystemPrompt(skillsContent);
    const userPrompt = buildReanalyzePrompt(JSON.stringify(currentData, null, 2), prompt);

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: userPrompt },
    ]);

    const responseText = result.response.text().trim();
    console.log('[/api/reanalyze] AI Response Length:', responseText.length);

    const firstBrace = responseText.indexOf('{');
    const lastBrace = responseText.lastIndexOf('}');
    
    if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
      console.error('[/api/reanalyze] Invalid AI Response:', responseText);
      throw new Error('AI가 유효한 JSON 형식을 반환하지 않았습니다.');
    }
    
    const cleaned = responseText.substring(firstBrace, lastBrace + 1);
    const parsed = JSON.parse(cleaned);

    const systemFields = ['category', 'categoryKo', 'title', 'chartType', 'subChartType', 'summary', 'insights', 'riskLevel', 'timeRange', 'metadata', 'data', 'omittedData'];
    const dataObj = parsed.data && typeof parsed.data === 'object' ? { ...parsed.data } : {};
    
    Object.keys(parsed).forEach(key => {
      if (!systemFields.includes(key)) {
        dataObj[key] = parsed[key];
      }
    });
    parsed.data = dataObj;

    parsed.metadata = parsed.metadata ?? currentData.metadata ?? {};
    parsed.metadata.processedAt = new Date().toISOString();
    parsed.metadata.reanalyzed = true;

    return NextResponse.json(parsed);
  } catch (err) {
    console.error('[/api/reanalyze]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
