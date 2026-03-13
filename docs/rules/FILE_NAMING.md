# File Naming (파일 명명 규칙)

프로젝트의 핵심 설계 원칙에 따른 명명 규칙입니다.


## 1. One Function Per File

모든 로직 관련 파일은 정확히 하나의 주요 함수만 포함하며, 파일명은 함수명과 일치해야 합니다.

- **예시**: `getFetchPosts.ts` 파일은 `getFetchPosts` 함수를 내보냅니다.


## 2. 대소문자 규칙

- **함수 및 변수**: Camel Case (`camelCase.ts`)
- **글로벌 상수**: Upper Snake Case (`UPPER_SNAKE_CASE.ts`)
- **컴포넌트**: Pascal Case (`ComponentName.svelte`)
- **마크다운**: Upper Snake Case (`DOCUMENT_NAME.md`)

---
*Last Updated: 2026-03-13*
