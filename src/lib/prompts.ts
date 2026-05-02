import { readFileSync } from 'fs';
import path from 'path';

let cachedSkills: string | null = null;

export function getSkillsContent(): string {
  if (cachedSkills) return cachedSkills;
  const skillsPath = path.join(process.cwd(), 'skills.md');
  cachedSkills = readFileSync(skillsPath, 'utf-8');
  return cachedSkills;
}

export function buildSystemPrompt(skillsContent: string): string {
  return `당신은 금융 데이터 분석 전문가입니다.
아래 Skills.md 문서에 정의된 규칙에 따라 입력 데이터를 분석하고, 반드시 JSON 형식으로만 응답하세요.

중요 규칙:
1. 답변은 반드시 유효한 JSON 객체 하나여야 합니다.
2. JSON 외부에는 어떤 텍스트, 설명, 인사말도 포함하지 마세요. (예: "네, 분석해 드리겠습니다" 등 금지)
3. 마크다운 코드 블록(\`\`\`json ... \`\`\`)은 사용해도 좋지만, 그 외의 텍스트는 절대 금지합니다.
4. 데이터를 여러 시각화 요소로 나누어 보여주는 'dynamic' 카테고리를 적극 활용하세요.

=== Skills.md ===
${skillsContent}
=================

중요: 반드시 Skills.md에 정의된 출력 JSON 스키마를 정확히 따르세요.`;
}

export function buildUserPrompt(rawData: string, filename?: string): string {
  return `다음 금융 데이터를 분석하여 최적의 시각화 대시보드를 구성하세요.

파일명: ${filename ?? '알 수 없음'}

데이터 내용 (최대 8000자):
${rawData.slice(0, 8000)}

분석 가이드:
1. 데이터가 복잡하거나 여러 주제를 담고 있다면 반드시 'dynamic' 카테고리를 사용하세요.
2. 'dynamic' 카테고리 사용 시, 'data' 객체 안에 'blocks' 배열을 만드세요.
   예시:
   {
     "category": "dynamic",
     "title": "종합 분석 보고서",
     "data": {
       "blocks": [
         { "id": "m1", "type": "metrics", "title": "핵심 성과", "layout": "full", "data": [{ "label": "수익률", "value": "15.2", "unit": "%", "change": "+2.1" }] },
         { "id": "c1", "type": "chart", "title": "월별 추이", "layout": "half", "data": [...], "config": { "chartType": "line" } },
         { "id": "t1", "type": "table", "title": "세부 내역", "layout": "full", "data": [...] }
       ]
     }
   }
3. 데이터가 단순하다면 Skills.md의 특정 카테고리(stock, etf 등)를 사용해도 좋습니다.
4. 어떤 경우에도 'data' 객체 내부에 실제 분석된 수치와 리포트 내용이 반드시 포함되어야 합니다. 빈 객체를 반환하지 마세요.

분석을 시작하세요.`;
}
