# Coding Conventions (코딩 컨벤션)

일관된 코드 작성을 위한 규칙입니다.

## 1. 변수 및 상수 조직화

- **글로벌 상수**: `src/core/app/constants/`
- **글로벌 반응형 상태**: `src/core/app/states/` (Svelte 5 Runes)
- **설정 및 환경 변수**: `src/core/app/config/`
- **지역 변수**: 함수 내부에서 정의하며, 공유가 필요할 경우 상위 수준으로 이동.

## 1. Logic Placement (로직 배치)

- **UI 로직**: 컴포넌트 내 `onMount`, 이벤트 핸들러 등 순수 UI 상태 변경만 다룹니다.
- **도메인 로직**: 모든 비즈니스 규칙(데이터 검증, 변환 등)은 `src/core/domain`에 위치해야 합니다.
- **API 호출**: `src/core/infra/api/client`에 정의된 함수만 호출합니다.

## 2. Svelte 5 Runes

- 모든 반응형 상태는 Svelte 5의 Runes(`$state`, `$derived`, `$props`)를 사용해야 합니다.
- 기존 Svelte 4 스타일의 `let` 변수는 지양합니다.

## 3. 데이터 흐름

1. `+page.server.ts`에서 `core/infra` 호출.
2. `data` prop을 통해 `+page.svelte`로 전달.
3. UI 상호작용은 `core/app` 또는 `core/domain` 함수 실행.

---
*Last Updated: 2026-03-13*
