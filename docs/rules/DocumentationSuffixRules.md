# 문서 접미사 규칙 (Documentation Suffix Rules)

## 규칙

- 모든 마크다운 파일은 그 성격에 따라 명확한 접미사(Suffix)를 붙여 이름을 지정하고, 내부 제목 또한 일정한 형식을 따릅니다.

### 1. 제목 및 파일명 형식

- **H1 제목**: `# 한글 제목 (English Name)` (가독성을 위해 영어 이름에 띄어쓰기 포함 가능)
- **파일 이름**: `EnglishName.md` (시스템 제약상 영어 이름에서 띄어쓰기 제거)
- **접미사 규칙**: 영어 이름은 반드시 `Rules`(규칙 문서) 또는 `Specification`(명세 문서)으로 끝나야 합니다.

### 2. 예시

- **규칙 문서**:
  - 제목: `# Svelte 작성 규칙 (Svelte Rules)`
  - 파일명: `SvelteRules.md`
- **명세 문서**:
  - 제목: `# 데이터베이스 명세 (Database Specification)`
  - 파일명: `DatabaseSpecification.md`

## 목적

- 파일 이름만으로도 해당 문서의 성격을 즉각적으로 구분하고, 문서 내부 제목과의 일관성을 확보하기 위함입니다.
