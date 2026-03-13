# Svelte & SvelteKit Usage Guide (Svelte 및 SvelteKit 가이드)

프로젝트에서 Svelte 5와 SvelteKit을 사용하는 방법입니다.

## 1. 파일 역할
- **`+page.svelte`**: 라우트 진입점 UI.
- **`+layout.svelte`**: 공용 레이아웃.
- **`+page.ts`**: 클라이언트/서버 공용 로더.
- **`+page.server.ts`**: 서버 전용 로직.

## 2. 상태 관리 (Runes)
- `$state()`: 반응형 데이터.
- `$derived()`: 계산된 상태.
- `$effect()`: 사이드 이펙트.

---
*Last Updated: 2026-03-13*
