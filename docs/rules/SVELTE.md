# Svelte & SvelteKit Usage Guide (Svelte 및 SvelteKit 관리 가이드)

이 문서는 프로젝트에서 Svelte 5와 SvelteKit을 사용하는 방법과 각 파일의 역할 및 관리 규칙을 정의합니다.

## 1. 파일 역할 및 명명 규칙

SvelteKit에서는 파일명에 붙는 접두사(`+`)와 확장자가 해당 파일의 런타임 역할을 결정합니다.

### **1.1 UI 컴포넌트 (.svelte)**

*   **`+page.svelte`**: 특정 경로(Route)의 진입점(Entry point)이 되는 페이지 컴포넌트입니다.
*   **`+layout.svelte`**: 하위 페이지들에 공통으로 적용되는 레이아웃(헤더, 푸터 등)입니다.
*   **`+error.svelte`**: 라우트 내에서 에러 발생 시 사용자에게 보여주는 화면입니다.
*   **일반 `.svelte` 파일**: `lib/components/`에 위치하며, 여러 곳에서 재사용 가능한 UI 조각입니다.

### **1.2 로직 및 데이터 처리 (.ts)**

*   **`+page.ts`**: 클라이언트와 서버 양쪽에서 실행되는 데이터 로더(`load`)입니다. 정적 사이트(Static Site) 생성 시에도 유용합니다.
*   **`+page.server.ts`**: **서버에서만** 실행되는 로직입니다. (현재 GitHub Pages 환경에서는 빌드 타임에만 실행되므로 주의가 필요합니다.)
*   **`+server.ts`**: API 엔드포인트입니다. GET, POST 등의 HTTP 메서드를 직접 처리합니다.
*   **`+layout.ts / +layout.server.ts`**: 레이아웃에 필요한 데이터를 로드합니다.

---

## 2. 프로젝트 특화 규칙 (SvelteKit + DDD)

우리는 SvelteKit의 표준 기능과 함께 **DDD(도메인 주도 설계)** 원칙을 조화롭게 사용합니다.

### **2.1 로직의 분리 (Separation of Concerns)**

*   **`.svelte` 파일**: UI 렌더링과 사용자 입력 감지에만 집중합니다. 복잡한 연산이나 API 호출은 별도의 `.ts` 파일로 분리합니다.
*   **`core/` 디렉토리**: 모든 비즈니스 로직과 기술적 구현체는 `src/core`에 위치하며, `+page.svelte` 혹은 `+page.ts`에서 이를 호출합니다.
*   **One Function Per File**: 하나의 `.ts` 파일은 가급적 하나의 주요 함수만 포함하며, 파일명은 함수명과 일치해야 합니다.

### **2.2 상태 관리 (Runes)**

Svelte 5의 **Runes** 시스템을 사용하여 상태를 관리합니다.
*   `$state()`: 반응형 데이터 정의
*   `$derived()`: 계산된 상태(Computed values)
*   `$effect()`: 사이드 이펙트 처리

전역 상태는 `src/core/app/states/` 디렉토리 내에 별도의 `.ts` 파일로 관리합니다.

---

## 3. 예시 구조

```text
src/routes/write/
├── +page.svelte       # UI (글쓰기 폼 렌더링)
├── +page.ts           # 클라이언트 로지 (인증 체크 유틸 호출)
└── (기타 컴포넌트)      # 내부에서만 쓰이는 하위 컴포넌트
```

---
*Last Updated: 2026-03-13*
