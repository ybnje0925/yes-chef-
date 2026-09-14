# 예셰프 · YES CHEF

> 레시피를 보는 앱이 아니라, 셰프가 사용자를 끝까지 끌고 가는 앱.

가입, 결제, 서버 DB 없이 동작하는 한국어 모바일 웹앱/PWA입니다. Next.js App Router, TypeScript, React, Tailwind CSS 4를 사용합니다. 검정·크림·레드 UI, 자체 SVG 셰프와 CSS 음식 일러스트를 포함합니다. 외부 이미지나 폰트 요청 없이 실행됩니다.

## 실행 방법

Node.js 20.9 이상이 필요합니다. Node.js 22 또는 24 LTS를 권장합니다.

```bash
npm ci
npm run dev
```

브라우저에서 http://localhost:3000 을 엽니다.

배포와 같은 환경 및 PWA 확인:

```bash
npm run build
npm start
```

PWA 서비스 워커는 개발 캐시 혼선을 막기 위해 **프로덕션 모드에서만** 등록합니다. 홈 화면 설치와 음성 인식은 HTTPS 또는 localhost에서 확인하세요. 같은 Wi-Fi의 휴대폰에서는 개발 PC의 IP:3000으로 UI를 볼 수 있지만, 일반 HTTP에서는 설치·마이크 등 브라우저 기능이 제한됩니다.

## 사용 흐름

1. ‘예, 셰프!’ → 메뉴 선택 (알리오 올리오 / 김치볶음밥 / 계란볶음밥 / 라면).
2. 재료 체크리스트를 완료하고 요리 시작. 알리오 올리오는 면 포장지를 참고해 삶기 시간을 설정합니다.
3. 한 단계씩 지시를 수행하고 ‘예, 셰프!’로 대답합니다.
4. 최소 시간 이전에 누르면 경고 → ‘죄송합니다 셰프’ → 타이머 복귀. 이후 작은 ‘그래도 넘어가기’ 버튼으로 감점을 받고 진행할 수 있습니다.
5. 최대 시간 초과 시 단계당 한 번만 초과 횟수를 기록하며, 음식 상태 확인과 다음 단계 진행을 권합니다.
6. 마지막 단계에서 평가 영수증을 확인하고 공유합니다.

‘빠른 체험 모드’는 일반 단계 최소 2초, 타이머 단계 최소 6초 / 권장 10초 / 초과 18초로 동작합니다. 실제 조리에 사용하지 마세요. 체험은 기록에 반영되지 않습니다.

## 주요 파일 구조

```text
src/
  app/
    layout.tsx                 # 메타데이터, 한국어, PWA 아이콘
    page.tsx                   # App Router 진입점
    globals.css                # 반응형 UI, 디자인 토큰, 음식 일러스트
  components/
    Kitchen.tsx                # 홈 / 메뉴 / 재료 / 진행 / 평가 화면 연결
    ChefPortrait.tsx           # 오리지널 SVG 셰프
    FoodArt.tsx                # 외부 요청 없는 음식 일러스트
    Brand.tsx                  # 로고
    Dialog.tsx                 # 키보드 포커스가 유지되는 모달
    VoiceButton.tsx            # 음성 보조 UI
  data/recipes.ts              # 4개 로컬 레시피, 단계 생성 헬퍼
  hooks/
    useCookingSession.ts       # 단계 진행, 경고, 일시정지, 완료 상태
    useVoice.ts                # Web Speech API, 권한/지원 오류 처리
  lib/
    types.ts                   # Recipe, Step, Session, Stats 타입
    timer.ts                   # 절대 시각 기반 경과시간, 일시정지 계산
    scoring.ts                 # 감점, 등급, 중복 없는 결과 기록
    chef.ts                    # 랜덤 셰프 대사 선택
    storage.ts                 # 버전이 있는 LocalStorage 읽기/쓰기
public/
  manifest.webmanifest         # 홈 화면 설치 메타데이터
  sw.js                        # 프로덕션 오프라인 앱 캐시
  icon-192.png
  icon-512.png
  icon-maskable.png
tests/
  core.test.ts                 # 시간/등급/데이터/중복 기록 단위 테스트
  e2e/kitchen.spec.ts          # 실제 브라우저 전체 조리 흐름
playwright.config.ts
```

## 새로운 레시피 추가

`src/data/recipes.ts`의 `recipes` 배열에 `Recipe` 객체를 추가하면 메뉴 카드와 조리 흐름에 자동으로 나타납니다. 단계 ID는 각 레시피 안에서 유일해야 합니다. 모든 시간 단위는 **초**입니다.

```ts
{
  id: 'new-dish',
  name: '새 요리',
  englishName: 'NEW DISH',
  description: '요리에 대한 짧은 설명',
  estimatedMinutes: 10,
  difficulty: 2, // 1~5
  thumbnail: 'egg', // pasta | kimchi | egg | ramen: CSS 일러스트 이름
  chefIntro: '오늘은 이것부터 해 보자.',
  ingredients: ['재료 1', '재료 2'],
  steps: [{
    id: 'stir',
    title: '볶기',
    instruction: '중불에서 볶아.',
    detail: '눌어붙지 않도록 저어 가며 익혀.',
    minimumDuration: 30,
    recommendedDuration: 60,
    maximumDuration: 90, // 0이면 시간 초과 경고 없음
    timerRequired: true,
    chefStartMessage: '팬을 봐. 나 말고.',
    earlyWarningMessages: ['아직이다. 조금 더 볶아.'],
    lateWarningMessages: ['불 줄이고 상태 확인해.'],
    successMessages: ['좋아. 다음으로.'],
  }],
}
```

`minimumDuration <= recommendedDuration < maximumDuration`을 유지하세요 (maximumDuration=0 제외). 타이머 없는 준비 단계도 최소 시간이 적용됩니다. 예외적으로 알리오 올리오의 `pasta` 단계는 재료 화면에서 지정한 면 삶기 시간으로 조정합니다. 다른 레시피의 같은 ID에 영향이 없도록 이 조건은 레시피 ID까지 확인합니다.

새 음식 일러스트는 `globals.css`에 `.food-art.새이름` 스타일을 추가합니다. 현재 방식은 썸네일 URL을 다운로드하지 않으므로, 사진을 쓰려면 `FoodArt.tsx`를 `next/image` 기반으로 교체하세요.

## 시간과 점수 규칙

- 경과 시간 = `(일시정지 시각 또는 현재 시각) - 시작 시각 - 누적 일시정지 시간`.
- setInterval은 화면 갱신만 담당합니다. 탭 복귀/화면 켜짐 시 Date.now()로 보정합니다.
- 일시정지 중에는 다음 단계 버튼과 음성 진행이 막힙니다. ‘다시 시작’은 남은 시간부터 재개합니다.
- 최소 수행 시간보다 일찍 시도할 때마다 ‘너무 빨리 넘기기 +1’, ‘혼난 횟수 +1’.
- 경고 이후 최소 시간 전에 강제 진행할 때 ‘지시 불이행 +1’.
- 최대 시간 초과는 단계당 ‘타이머 초과 +1’, ‘혼난 횟수 +1’. 알림이 중복 기록되지 않습니다.
- 점수: `max(0, 100 - 지시불이행×15 - 빠른시도×3 - 시간초과×8)`.
- 등급: S ≥95 / A ≥85 / B ≥70 / C ≥55 / D ≥40 / F <40.
- 평가의 총 조리시간은 실제 시작부터 완료까지이며 일시정지도 포함합니다.
- 등급은 앱 지시 준수에 대한 재미용 평가입니다. 음식 맛이나 익힘을 감지하지 않습니다.

## PWA와 브라우저 지원

- Android: 브라우저 메뉴 → 앱 설치 / 홈 화면에 추가. 지원 브라우저에서는 상단 설치 버튼을 사용할 수 있습니다.
- iPhone: Safari 공유 → 홈 화면에 추가.
- 최초 온라인 방문 및 서비스 워커 준비 후 앱과 정적 리소스를 캐시해 오프라인에서 요리할 수 있습니다. 레시피는 앱 번들에 포함됩니다.
- 새 버전을 배포할 때 `public/sw.js`의 CACHE 이름을 올립니다. 기존 앱 창을 모두 닫았다 다시 열면 새 워커가 활성화됩니다.
- 브라우저가 백그라운드 실행을 중지한 동안에는 소리·진동이 정확한 시각에 울린다고 보장할 수 없습니다. 복귀 즉시 실제 경과시간과 초과 여부를 반영합니다. 별도 푸시 서버는 없습니다.
- 음성 인식은 사용자가 ‘말로 대답하기’를 누를 때만 시작합니다. ‘예 셰프’, ‘네 셰프’, ‘예 쉐프’를 인식합니다. 미지원/권한 거부/네트워크 오류 시 버튼을 계속 사용할 수 있습니다.
- 브라우저에 따라 음성 인식은 브라우저 제공 서버로 음성을 보냅니다. 앱 자체 서버에는 전송하지 않습니다. 오프라인 음성 인식은 보장하지 않습니다.
- 셰프 말 읽기는 조리 화면 오른쪽 스피커 버튼으로 켭니다. 기본은 꺼짐입니다. 설치된 한국어 음성에 따라 목소리가 달라집니다.
- 완료 알림은 화면 상태 메시지와 지원 기기의 진동입니다. 셰프 음성을 켜면 완료 메시지도 읽습니다.
- Web Share API로 제목, 성적, 앱 URL을 공유합니다. 이미지 파일 생성 기능은 없으며, 미지원/실패 시 스크린샷 안내를 표시합니다.

## 저장 범위

`yes-chef:stats:v1`에 누적 요리 횟수, 최고 등급, 최근 레시피 ID, 마지막 기록 세션 ID만 저장합니다. 기기/브라우저별 기록이며 앱 데이터 삭제 시 사라집니다. 저장소를 쓸 수 없어도 조리는 가능합니다. 진행 중인 요리는 메모리에만 있으며 **새로고침/브라우저 종료 시 복구되지 않습니다**. 조리 중 새로고침에는 브라우저 확인을 요청합니다. 다른 탭을 잠깐 보는 것은 요리를 초기화하지 않습니다.

## 검증

```bash
npm test             # 핵심 로직 5개
npm run typecheck
npm run build
npm run test:e2e     # Chrome 설치 필요; 빌드 후 실행
```

E2E는 로컬 서버를 자동 실행하거나 이미 실행 중인 localhost:3000에 연결합니다. 타이머 검증에는 가상 브라우저 시계를 사용하므로 실제로 20분을 기다리지 않습니다. 4개 실제 레시피 완료, 기록 지속, 빠른 경고/강제 진행/일시정지/초과, 모바일 가로 넘침 및 콘솔 오류, 오프라인 실행을 검증합니다. 마이크 권한·실제 음성·모바일 진동·iOS 홈 화면 설치는 기기에서 별도로 확인해야 합니다.

## GitHub와 배포

ZIP의 압축을 푼 폴더에서:

```bash
git init
git add .
git commit -m "Build YES CHEF MVP"
```

GitHub에 빈 저장소를 만든 후 안내에 따라 원격 저장소를 연결하고 push하세요. Vercel에서 저장소를 Import하면 Next.js를 자동 감지합니다. 환경변수, DB, API 키는 필요 없습니다. 빌드 명령은 `npm run build`, 설치는 `npm ci`입니다.

CLI 배포:

```bash
npx vercel           # 로그인 후 미리보기
npx vercel --prod    # 공개 배포
```

`node_modules`, `.next`, `.vercel`, `.env*`, 테스트 캡처, ZIP은 Git에 넣지 않습니다. ZIP에는 소스·잠금 파일·README·테스트만 포함합니다.

## 추후 AI 레시피 변환 기능을 붙일 위치

1. `src/app/api/recipes/convert/route.ts`를 만들고 사용자 텍스트/URL을 받아 AI 호출을 서버에서 수행합니다. 키는 환경변수에만 둡니다.
2. `src/lib/recipe-converter.ts`에서 AI 출력을 `Recipe`로 검증·정규화합니다. Zod 같은 스키마를 추가해 양수 시간, 최소/권장/최대 순서, 필수 대사, 식품 조리 지시를 검사하세요.
3. `recipes.ts` 배열을 받는 작은 레시피 목록 상태로 확장하고, `useCookingSession.ts`의 로컬 배열 조회를 전달받은 Recipe 조회로 바꿉니다. 현재 MVP는 임의의 외부 AI 데이터를 받아들이지 않습니다.
4. 사용자가 생성된 재료와 단계를 검토한 뒤 요리를 시작하게 합니다. 초기에는 로컬 저장만 추가해도 충분합니다.
5. 셰프 성격 확장은 `lib/chef.ts`와 Step의 대사 배열에서, 평가 변경은 `lib/scoring.ts`에서 독립적으로 할 수 있습니다.

참고: [Next.js 공식 문서](https://nextjs.org/docs), [MDN 음성 인식](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition), [MDN Web Share](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share).

### 정적 호스팅 (선택)

```bash
npm run build:static
```

생성된 `out/` 폴더를 정적 호스팅에 올릴 수도 있습니다. `next.config.ts`는 이 명령에서만 `output: 'export'`를 사용합니다. 기본 `npm run build`/`npm start`는 일반 Next.js 방식입니다. AI 변환 API를 추가하면 정적 내보내기 대신 일반 Next.js 배포를 사용하세요.
