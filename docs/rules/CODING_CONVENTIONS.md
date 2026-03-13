# Coding Conventions (코딩 컨벤션)

일관된 코드 작성을 위한 규칙입니다.

## 1. 변수 및 상수 조직화
- **글로벌 상수**: `src/core/app/constants/`
- **글로벌 반응형 상태**: `src/core/app/states/` (Svelte 5 Runes)
- **설정 및 환경 변수**: `src/core/app/config/`
- **지역 변수**: 함수 내부에서 정의하며, 공유가 필요할 경우 상위 수준으로 이동.

## 2. 데이터 흐름
1. `+page.server.ts`에서 `core/infra` 호출.
2. `data` prop을 통해 `+page.svelte`로 전달.
3. UI 상호작용은 `core/app` 또는 `core/domain` 함수 실행.

---
*Last Updated: 2026-03-13*
