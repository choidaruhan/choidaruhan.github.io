# 배포 명세 (Deployment Specification)

이 프로젝트는 최신 CI/CD 환경에 최적화된 배포 프로세스를 따릅니다. 프론트엔드는 정적 사이트(Static Site)로 빌드되어 배포되며, 백엔드는 Cloudflare Workers로 구성됩니다.

## 1. 빌드 프로세스

프론트엔드 빌드는 SvelteKit의 `@sveltejs/adapter-static`을 사용합니다.

- **명령어**: `make build` (내부적으로 `vite build` 실행)
- **결과물**: `dist/` 디렉터리에 정적 HTML/JS/CSS 파일 생성

## 2. 배포 프로세스

빌드된 정적 파일과 Worker 코드를 Cloudflare 인프라에 배포합니다.

- **명령어**: `make deploy` (내부적으로 `wrangler deploy` 실행)
- **주요 구성**:
  - `wrangler.toml`: Worker 이름, 바인딩(D1, KV), 환경 변수 설정
  - 정적 자산 배포: Cloudflare Pages 또는 Worker의 정적 자산 호스팅 기능을 통해 배포됩니다.

## 3. 데이터베이스 마이그레이션 (Cloudflare D1)

데이터베이스 스키마 변경 시 다음 과정을 따릅니다.

- **명렁어**: `npx wrangler d1 migrations apply my-blog-db --remote`
- **구조**: `schema.sql` 파일을 기반으로 로컬/리모트 DB 구조를 동기화합니다.

## 4. 환경 관리

- **로컬 개발**: `make run` 또는 `npm run dev`를 사용하여 개발 서버를 구동합니다. `.dev.vars` 파일에서 로컬 비밀변수를 관리합니다.
- **프로덕션**: Cloudflare 대시보드 또는 `wrangler.toml`의 `[vars]` 섹션을 통해 환경 변수를 설정합니다.

## 목적

- 배포 과정을 표준화하여 환경 간 차이를 최소화하고, 새로운 환경에 대한 쉬운 온보딩을 지원합니다.
