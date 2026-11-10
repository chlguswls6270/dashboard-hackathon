# MoaChart · 모아차트

**개인 프로젝트** — 샘플 금융 데이터를 탐색하고 업로드한 데이터를 AI로 분석해 차트·요약·인사이트로 보여주는 대시보드입니다.

- Next.js App Router·React·TypeScript·Recharts를 사용합니다.
- 분석 결과는 IndexedDB, 가벼운 사용자 설정은 localStorage에 저장합니다.
- AI 분석과 후속 요청은 서버의 Gemini API를 사용합니다. 기본 데이터는 실시간 시세가 아닌 샘플입니다.
- AI API에는 접근 코드, 요청 크기·속도 제한, 응답 구조 검증과 보안 회귀 테스트를 적용했습니다.

샘플 화면은 API 키 없이 볼 수 있습니다. AI 기능에는 서버의 `GEMINI_API_KEY`와 32자 이상의 무작위 `DEMO_ACCESS_TOKEN` 설정이 필요합니다. 브라우저에는 제공업체 키가 아닌 데모 접근 코드만 입력합니다.

[데모](https://dashboard-hackathon-inky.vercel.app) · [실행 방법·구조·검증 방법](README.md) · [보안 및 배포 안내](SECURITY.md)
