# Architecture & Technical Stack (아키텍처 및 기술 스택)

이 문서는 프로젝트의 기술적 토대와 코드 구조, 그리고 설계 원칙을 설명합니다. 각 문서의 역할은 **[DOCS.md](DOCS.md)**에서 확인하실 수 있습니다.

## 1. 기술 스택 (Technical Stack)

프로젝트의 주요 구성 요소와 사용된 기술입니다.

### **Frontend**

* **Core**: Svelte 5 (Runes 기반 반응성 시스템)
* **Framework**: SvelteKit (Static Site Generation 모드)
* **Build Tool**: Vite
* **Styling**: Vanilla CSS (Global & Scoped)

### **Backend**

* **Serverless**: Cloudflare Workers
* **Database**: Cloudflare D1 (SQLite 기반 에지 데이터베이스)
* **Authentication**: Cloudflare Access

---

## 2. 코드 및 프로젝트 구조 (Code Structure)

프로젝트는 DDD(Domain-Driven Design) 원칙을 참고하여 레이어를 분리하고 있습니다.

### **핵심 레이어 (src/core/)**

* **`domain/`**: 순수한 비즈니스 로직. 외부 프레임워크나 라이브러리에 독립적으로 설계합니다.
* **`infra/`**: 데이터베이스 통신(D1), API 클라이언트 등 기술적인 구현체입니다.
* **`app/`**: 애플리케이션의 전역 상태(`states/`), 설정(`config/`), 배포 상수(`constants/`) 등을 관리합니다.
* **`shared/`**: 프로젝트 전반에서 공용으로 사용되는 유틸리티와 타입 정의입니다.

### **프레임워크 레이어 (src/routes/ & lib/)**

* **`routes/`**: SvelteKit의 파일 기반 라우팅 시스템입니다.
  * `login/`: Cloudflare Access 인증 처리 전용 경로.
  * `write/`: 글 작성 및 관리를 위한 어드민 대시보드.
* **`lib/components/`**: UI 구성 요소 (재사용 가능한 컴포넌트).

---

## 3. 핵심 설계 원칙 (Core Principles)

일관된 코드 품질을 위해 다음과 같은 원칙을 준수합니다.

1. **One Function Per File**: 하나의 파일은 하나의 주요 기능(함수)만 수행하며, 파일명은 함수명과 일치해야 합니다.
2. **Framework Agnostic Core**: `core/` 디렉토리의 로직은 가능한 프레임워크(SvelteKit)에 의존하지 않도록 구성합니다.
3. **Static First**: 모든 프론트엔드 결과물은 `dist/` 폴더에 정적으로 빌드되어 GitHub Pages에 배포됩니다.

---
*Last Updated: 2026-03-13*
