# Rules: Routes & UI 규칙

## 1. SvelteKit 구조 준수
- SvelteKit의 파일 기반 라우팅 규칙을 엄격히 따릅니다.
- 컴포넌트는 재사용 가능한 단위로 최대한 쪼개어 관리합니다.

## 2. Logic Placement
- 복잡한 로직은 최대한 `core` 레이어로 넘기고, 컴포넌트 내부에는 UI 제어와 이벤트 핸들링만 둡니다.
- **Svelte 5 Runes**(`$state`, `$derived` 등)를 사용하여 반응성을 관리합니다.
