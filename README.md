현재 프로젝트 구조를 분석해보았습니다. 다음과 같은 특징을 가지고 있습니다:

## 📁 현재 프로젝트 구조

```
my-blog/
├── src/
│   ├── components/          # 재사용 컴포넌트 (Error, Loading, Sidebar)
│   ├── core/               # DDD(Domain-Driven Design) 구조
│   │   ├── app/           # 애플리케이션 레이어 (상태, 설정, 부팅)
│   │   ├── domain/        # 도메인 레이어 (auth, posts)
│   │   ├── infra/         # 인프라 레이어 (API 클라이언트)
│   │   └── shared/        # 공유 유틸리티와 타입
│   ├── routes/            # 라우트 컴포넌트 (Home, Post, Admin)
│   ├── App.svelte         # 메인 앱 컴포넌트 (간단한 클라이언트 라우팅)
│   ├── app.css            # (비어있음)
│   └── main.ts            # 앱 진입점
├── docs/                  # 빌드 출력 (GitHub Pages용)
├── scripts/              # 빌드/배포 스크립트
└── 설정 파일들
    ├── package.json      # Svelte 5 + Vite
    ├── vite.config.ts    # 프록시 설정, docs 출력
    ├── wrangler.toml     # Cloudflare Workers 설정
    ├── schema.sql        # SQLite/D1 데이터베이스 스키마
    └── tsconfig.json     # 타입스크립트 설정
```

## 🔧 기술 스택

- **프론트엔드**: Svelte 5 + Vite (SvelteKit 아님)
- **상태 관리**: Svelte 스토어 (`writable`)
- **백엔드**: Cloudflare Workers (D1 데이터베이스)
- **인증**: Cloudflare Access
- **빌드 출력**: `docs/` 폴더 (GitHub Pages)
- **마크다운**: `marked`, `dompurify`, `sanitize-html` (설치됨)

## ✅ 장점

1. **체계적인 구조**: DDD 패턴으로 깔끔하게 레이어 분리
2. **클라우드 네이티브**: Cloudflare Workers + D1로 서버리스 아키텍처
3. **타입 안전성**: TypeScript 전반적 사용
4. **간단한 배포**: GitHub Pages로 정적 호스팅

## 💡 개선 사항

### 1. **SvelteKit 마이그레이션 (권장)**

- **현재**: 직접 구현한 클라이언트 라우팅 (`window.location.pathname`)
- **제안**: SvelteKit의 파일 기반 라우팅으로 전환
- **장점**:
  - SSR/SSG 지원 (SEO 향상)
  - 내장 라우팅, 로딩 상태, 에러 처리
  - `+page.svelte`, `+layout.svelte` 표준 패턴
  - Cloudflare Workers 어댑터로 기존 백엔드 유지 가능

### 2. **Svelte 5 Runes 도입**

- **현재**: `writable` 스토어 사용
- **제안**: `$state`, `$derived`, `$effect` runes 사용
- **예시**:

```my-blog/src/core/app/states/posts.ts#L1-10
// 현재
import { writable } from 'svelte/store';
export const posts = writable<Post[]>([]);

// 개선 후
import { state } from 'svelte';
export let posts = $state<Post[]>([]);
```

### 3. **마크다운 편집기 구현 (할 일 완료)**

- README에 "글 쓰기를 마크다운 형식으로 만들기"가 미완료
- `marked` + `dompurify`를 활용한 실시간 미리보기 편집기 구현
- Admin 페이지에 WYSIWYG 마크다운 에디터 추가

### 4. **스타일링 시스템 도입**

- **현재**: 기본 CSS만 존재 (`app.css` 빈 파일)
- **제안**: Tailwind CSS 또는 UnoCSS 도입
- **장점**: 일관된 디자인 시스템, 빠른 UI 개발

### 5. **테스트 환경 구축**

- **현재**: 테스트 파일 없음
- **제안**: Vitest + Testing Library로 컴포넌트 테스트 추가
- 예: `npm install -D vitest @testing-library/svelte`

### 6. **개발 경험 개선**

- **HMR 설정 강화**: 현재 Vite 기본 설정
- **코드 품질 도구**: ESLint, Prettier 설정 추가
- **타입 안전성 강화**: `tsconfig.json`에서 `strict: true` 설정

### 7. **배포 프로세스 자동화**

- **현재**: 수동 빌드 및 배포
- **제안**: GitHub Actions로 CI/CD 파이프라인 구축
- 빌드 → 테스트 → Cloudflare Workers 배포 자동화

### 8. **성능 최적화**

- **코드 분할**: 라우트 기반 코드 스플리팅
- **이미지 최적화**: Cloudflare Images 연동 고려
- **캐싱 전략**: 서비스 워커 도입

## 🎯 우선순위별 개선안

1. **즉시 가능**: 마크다운 편집기 구현 (할 일 완료)
2. **중기 개선**: Svelte 5 Runes 도입
3. **장기 개선**: SvelteKit 마이그레이션
4. **부가적**: 스타일링 시스템, 테스트 환경

어떤 개선 사항부터 시작하시겠습니까? 제가 도와드릴 수 있는 부분이 있다면 알려주세요!
