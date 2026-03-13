# 프로젝트 규칙 및 원칙 (Project Rules & Principles)

이 문서는 프로젝트의 일관성과 명확성을 유지하기 위한 핵심 원칙 및 코딩 표준을 정의합니다.

## 1. 파일 및 함수 설계 원칙

- **파일당 하나의 함수 (One Function Per File)**: 모든 로직 관련 파일은 정확히 하나의 주요 함수만 포함하고 내보내야(export) 합니다.
- **이름 일관성 (Naming Consistency)**: 파일명은 내보내는 함수의 이름과 정확히 일치해야 합니다.
  - 예시: `getFetchPosts.ts` 파일은 `getFetchPosts` 함수를 내보냅니다.
- **디렉토리 구조 (Location)**:
  - `src/`: 루트 소스 디렉토리.
    - `app.css`: 글로벌 스타일.
    - `routes/`: SvelteKit 파일 기반 라우팅.
      - `+layout.svelte`: 공통 레이아웃 및 공유 UI 요소.
      - `+page.svelte`: 각 페이지별 컴포넌트.
      - `+page.server.ts`: 서버 측 데이터 로딩 (`core/infra` 호출).
    - `specs/`: 프로젝트 상세 명세 및 가이드.
      - `RULES.md`: (본 문서) 프로젝트 규칙.
      - `TODO.md`: 작업 현황 및 계획.
      - `DOCUMENTATION.md`: 문서화 가이드.
      - `ARCHITECTURE.md`: 아키텍처 및 기술 스택 명세.
    - `lib/`: SvelteKit 라이브러리 디렉토리 (`$lib`로 접근 가능).
      - `components/`: UI 재사용 컴포넌트.
    - `core/`: 모든 공유 로직 및 데이터 처리 (DDD 레이어).
      - `domain/`: 도메인별 비즈니스 로직 (예: `posts`, `auth`).
      - `infra/`: 기술적 구현체 (API 연동, 라우팅 구현).
      - `app/`: 애플리케이션 수준의 관심사.
        - `states/`: 전역 상태 관리 (Svelte 5 Runes).
        - `constants/`: 글로벌 고정 상수값.
        - `config/`: 환경 설정 정보.
        - `boot/`: 앱 초기화 및 마운트 로직.
      - `shared/`: 범용 헬퍼 및 정의 파일.
        - `utils/`: 공통 유틸리티 함수.
        - `types/`: 공유 TypeScript 타입 정의.

---

## 2. SvelteKit & DDD 조화 (Harmony)

SvelteKit을 사용하면서도 아키텍처의 무결성을 유지하기 위한 원칙입니다.

- **프레임워크 독립성 (Framework Independence)**: `core/` 디렉토리는 가능한 프레임워크에 의존하지 않아야 합니다. SvelteKit 전용 API(예: `page` 스토어)를 직접 사용하는 것은 지양합니다.
- **데이터 흐름 (Data Flow)**:
  1. `+page.server.ts`에서 `core/infra`를 호출하여 데이터를 요청합니다.
  2. 조회된 데이터는 `data` prop을 통해 `+page.svelte`로 전달됩니다.
  3. UI 상호작용은 `core/app` 또는 `core/domain`에 정의된 함수를 실행합니다.
- **상태 관리 (State Management)**: 페이지 이동 시에도 유지되어야 하는 전역 상태는 `core/app/states`에서 Svelte 5 Runes(`$state`, `$derived`)를 사용하여 관리합니다.

---

## 3. 변수 및 상수 조직화

### 3.1 글로벌 상수 (Global Constants)

- **경로**: `src/core/app/constants/`
- **명명 규칙**: 내보내는 변수명과 일치하는 `UPPER_SNAKE_CASE.ts`.
- **예시**: `API_BASE.ts` -> `export const API_BASE = ...`

### 3.2 글로벌 반응형 상태 (Global Reactive States)

- **경로**: `src/core/app/states/`
- **명명 규칙**: 내보내는 변수명과 일치하는 `camelCase.ts`.
- **예시**: `posts.ts` -> `export const posts = $state([])`

### 3.3 설정 및 환경 변수 (Config & Environment)

- **경로**: `src/core/app/config/`
- **명명 규칙**: 내보내는 이름이나 기능을 잘 설명하는 `camelCase.ts`.
- **예시**: `isProduction.ts` -> `export const isProduction = ...`

### 3.4 지역 변수 (Local Variables)

- 특정 함수 내부에서만 사용되는 변수는 해당 함수 파일 안에 둡니다.
- 지역 변수가 공유될 필요가 생기거나 복잡해지면 `constants`나 `config`로 이동시킵니다.

---

## 4. 개발 워크플로우

- **리팩토링**: 새로운 기능을 추가할 때 "파일당 하나의 함수" 규칙을 위반하지 않도록 주의하세요. 함수가 너무 커지면 별도의 파일로 분리하여 작은 함수들로 쪼개야 합니다.

---
*Last Updated: 2026-03-13*
