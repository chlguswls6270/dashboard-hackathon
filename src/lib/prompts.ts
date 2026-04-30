import { readFileSync } from 'fs';
import path from 'path';

export function getSkillsContent(): string {
  const skillsPath = path.join(process.cwd(), 'skills.md');
  return readFileSync(skillsPath, 'utf-8');
}

export function buildSystemPrompt(skillsContent: string): string {
  return `당신은 금융 데이터 분석 전문가입니다.
아래 Skills.md 문서에 정의된 규칙에 따라 입력 데이터를 분석하고, 반드시 JSON 형식으로만 응답하세요.
다른 텍스트나 마크다운 코드블록 없이 순수 JSON만 반환하세요.

=== Skills.md ===
${skillsContent}
=================

중요: 반드시 Skills.md에 정의된 출력 JSON 스키마를 정확히 따르세요.`;
}

export function buildUserPrompt(rawData: string, filename?: string): string {
  return `다음 금융 데이터를 분석하고 Skills.md 규칙에 따라 분류 및 변환하세요.

파일명: ${filename ?? '알 수 없음'}

데이터:
${rawData.slice(0, 8000)}

위 데이터를 분석하여 적절한 카테고리로 분류하고, 해당 카테고리의 JSON 스키마에 맞게 변환한 후,
인사이트와 차트 타입, 리스크 레벨을 포함한 완전한 JSON을 반환하세요.`;
}
