# 모아차트

AI 기반 투자 데이터 대시보드입니다. 더미 금융 데이터와 사용자가 업로드한 Raw 데이터를 분석해 카테고리별 요약, 상세 차트, 인사이트, 최근 열람 기록, 업로드 데이터 관리를 제공합니다.

## 주요 기능

- 투자 데이터 홈 대시보드
- 주식, ETF, 포트폴리오, 재무 지표, 시장 지표 등 카테고리별 데이터 탐색
- 파일 또는 텍스트 기반 AI 분석
- 업로드한 분석 결과 카드형 관리, 삭제, 상세 보기
- 분석 진행/완료 전역 알림
- 즐겨찾기, 최근 열람 기록, 목표가 알림
- IndexedDB 기반 브라우저 로컬 캐시

## 기술 스택

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4 및 custom CSS
- Recharts
- lucide-react
- idb
- Google Generative AI

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 엽니다.

## 환경 변수

AI 분석 API를 사용하려면 프로젝트 루트에 `.env.local`을 만들고 아래 값을 설정합니다.

```bash
GEMINI_API_KEY=your_api_key_here
```

환경 변수 파일은 커밋하지 않습니다.

## 자주 쓰는 명령어

```bash
npm run dev      # 개발 서버 실행
npm run build    # 프로덕션 빌드 확인
npm run start    # 빌드 결과 실행
npm run lint     # ESLint 실행
```

## 프로젝트 구조

```text
src/app
  page.tsx                    # 대시보드 상태와 화면 전환
  api/process/route.ts         # 업로드 데이터 AI 분석 API
  api/dummy/...                # 더미 데이터 API

src/components
  HomeDashboard.tsx            # 홈 화면
  UploadPanel.tsx              # 데이터 불러오기
  UploadedDataDashboard.tsx    # 내가 올린 데이터
  DataViewer.tsx               # 상세 화면
  charts/                      # 상세 차트 컴포넌트

src/lib
  cache.ts                     # IndexedDB 캐시
  prompts.ts                   # AI 분석 프롬프트
  types.ts                     # 데이터 타입

src/data/dummy                 # 카테고리별 더미 데이터
```

## 배포

Vercel 배포를 기본으로 권장합니다.

1. GitHub 저장소에 push합니다.
2. Vercel에서 프로젝트를 Import합니다.
3. Framework Preset은 Next.js로 둡니다.
4. Environment Variables에 `GEMINI_API_KEY`를 추가합니다.
5. Deploy를 실행합니다.

AI 분석 시간이 길어 Vercel 서버리스 제한에 걸리면 `/api/process`만 Render 같은 별도 백엔드로 분리할 수 있습니다.

## 참고

- 사용자가 업로드한 데이터와 사용자 상태는 브라우저 로컬 저장소 및 IndexedDB에 저장됩니다.
- 더미 데이터는 앱 시작 시 로컬 캐시에 자동으로 적재됩니다.
- `skills.md`는 AI 분석 스키마와 카테고리 규칙으로 사용되므로 삭제하지 않습니다.
