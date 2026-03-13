# Svelte 작성 규칙 (Svelte Rules)

## 규칙

- `+page.svelte` 파일 하나에 모든 코드를 작성하지 말고, 기능에 따라 다음과 같이 파일을 분산하여 정의합니다.
- 사용 가능한 주요 SvelteKit 파일 유형:
  - `+page.ts`
  - `+page.server.ts`
  - `+page.svelte`
  - `+server.ts`
  - `+layout.ts`
  - `+layout.server.ts`
  - `+layout.server.svelte`
  - `+error.svelte`

## 목적

- 단일 파일의 비대화를 방지하고 코드의 가독성을 높입니다.
- 서버 측 로직과 클라이언트 측 UI 로직을 명확히 분리하여 성능과 보안을 최적화합니다.
