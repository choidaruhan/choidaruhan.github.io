# MAP (지형도)

이 문서는 프로젝트의 전체 폴더 구조와 각 디렉토리의 역할을 상세히 설명합니다.

## 📂 프로젝트 시각화 (Project Visualization)

```text
my-blog/
├── dist/               # 빌드 결과물
│   └── _app/           # SvelteKit 내부 에셋
├── docs/               # 문서 저장소
│   ├── arch/           # 아키텍처 및 설계 원칙
│   ├── tasks/          # 작업 관리 (todo, issues, history)
│   ├── rules/          # 프로젝트 규칙
│   └── specs/          # 기술 명세
├── scripts/            # 실행 스크립트
│   └── make/           # Makefile 헬퍼 스크립트
├── static/             # 정적 자산
└── src/                # 소스 코드
    ├── components/     # UI 공동 컴포넌트
    ├── core/           # 핵심 엔진 (DDD 구조)
    │   ├── app/        # 앱 실행 로직 및 상태
    │   ├── domain/     # 비즈니스 로직 (Pure Logic)
    │   ├── infra/      # 기술 구현 (API, DB)
    │   └── shared/     # 공유 자원 (Types, Utils)
    └── routes/         # 페이지 라우팅 (SvelteKit)
```

---

## 🏗️ 폴더별 상세 설명 (Folder Descriptions)

### `/dist`

프로젝트 빌드(`npm run build`) 결과가 저장되는 곳입니다. 브라우저에서 실행 가능한 최적화된 파일들이 위치합니다.

### `/docs`

프로젝트의 지식 관리 센터입니다. 모든 중요 결정과 규칙이 이곳에 마크다운 파일로 기록됩니다.

- **`/arch`**: 프로젝트의 전체적인 설계 방향과 기술 스택을 다룹니다.
- **`/tasks`**: 프로젝트의 진행 상황을 관리합니다.
    - `todo/`: 개별 할 일 목록.
    - `issues/`: 개별 이슈 트래커.
    - `history/`: 완료된 작업의 증적.
- **`/rules`**: 코딩 스타일, 파일 명명, 문서 작성법 등 팀이 지켜야 할 규칙을 정의합니다.
- **`/specs`**: API 명세, DB 스키마 등 구체적인 기술 사양을 포함합니다.

### `/scripts`

개발 및 운영 효율화를 위한 자동화 도구들입니다.

### `/static`

컴파일 과정 없이 브라우저에 그대로 노출되는 파일들입니다.

### `/src/components`

여러 페이지에서 공통으로 재사용하는 Svelte UI 컴포넌트들입니다.

### `/src/core/app`

애플리케이션의 뼈대를 구성하며 초기 구동과 전역적인 설정을 관리합니다.

### `/src/core/domain`

블로그의 핵심 비즈니스 규칙이 정의되는 계층입니다.

### `/src/core/infra`

비즈니스 로직을 구체적인 기술로 구현하는 계층입니다.

### `/src/core/shared`

도메인이나 레이어에 상관없이 유니버설하게 사용되는 자원들입니다.

### `/src/routes`

사용자가 접근하는 URL 경로에 대응하는 페이지 컴포넌트들입니다.

---

*마지막 업데이트: 2026-03-13*
