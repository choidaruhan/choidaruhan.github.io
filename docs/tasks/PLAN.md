# Plan (할 일 목록)

현재 진행 중이거나 앞으로 진행할 작업 목록입니다. 각 항목의 상세 내용은 `todo/` 폴더 내의 개별 파일을 참조하세요.

## 🔴 High Priority (긴급)

- **인증 리디렉션 루프 해결**: SvelteKit Hooks를 활용한 중앙 집중식 인증 관리 도입. ([001_AUTH_REFACTOR_HOOKS.md](todo/001_AUTH_REFACTOR_HOOKS.md))
- **코드 중복 제거**: `login`과 `write` 페이지의 공통 로직 분리. ([002_CODE_DUPLICATION_CLEANUP.md](todo/002_CODE_DUPLICATION_CLEANUP.md))
- **도메인 로직 이관**: UI에 포함된 비즈니스 로직을 `core/domain`으로 이동. ([003_DOMAIN_LOGIC_MIGRATION.md](todo/003_DOMAIN_LOGIC_MIGRATION.md))

## 🟡 Medium Priority (보통)

- **Svelte 5 Runes 적용**: 모든 컴포넌트의 반응형 상태를 `$state`로 전환.
- **마크다운 보안**: XSS 방지를 위한 렌더링 살균(Sanitization) 필터 적용.
- **DB 스키마 반영**: `updated_at`, `status` 컬럼 실제 DB 반영 및 코드 수정.

## 🟢 Low Priority (낮음)

- **테스트 환경 구축**: Vitest를 이용한 핵심 로직 단위 테스트 작성.
- **반응형 디자인**: 모바일 최적화 및 CSS 가독성 개선.

---
*Last Updated: 2026-03-13*
