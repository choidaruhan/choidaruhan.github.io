# Technical Specifications (기술 명세서)

이 문서는 프로젝트에 이미 구현된 기능들의 기술적인 상세 작동 방식과 명세를 기록합니다.

---

## 1. 프레임워크 및 런타임

### **1.1 Frontend (SvelteKit)**
- **Version**: SvelteKit 2.x, Svelte 5 (Runes)
- **Deployment**: GitHub Pages (Static Site Generation)
- **Adapter**: `@sveltejs/adapter-static`
- **Output Directory**: `dist/`
- **Routing**: 파일 기반 라우팅 (`src/routes/`)

### **1.2 Backend (Cloudflare Workers)**
- **Runtime**: Cloudflare Workers
- **Entry Point**: `src/core/infra/api/fetch.ts`
- **Database**: Cloudflare D1 (`my-blog-db`)

---

## 2. 주요 라우트 및 기능

### **2.1 공개 라우트 (Public)**
- **`/` (홈)**: 전체 게시글 목록 조회.
- **`/post/[slug]` (상세)**: 특정 슬러그를 가진 게시글 본문 조회.

### **2.2 관리자 라우트 (Admin)**
- **`/login` (인증 진입점)**: 
    - Cloudflare Access와의 접점.
    - 이미 인증된 사용자는 `/write`로 자동 리디렉션.
    - 미인증 사용자는 로그인 버튼 노출 및 로그인 프로세스 유도.
- **`/write` (에디터/어드민)**:
    - 게시글 작성 및 수정 인터페이스.
    - `onMount` 시점에 클라이언트 사이드 인증 체크 수행.
    - 미인증 시 `/login`으로 강제 리디렉션.

---

## 3. 인증 및 보안 (Cloudflare Access)

- **인증 방식**: Cloudflare Access에 의한 JWT 기반 인증.
- **백엔드 검증**: Worker에서 `Cf-Access-Jwt-Assertion` 헤더를 통해 사용자 신원 확인 (`/auth/me`).
- **자동 리디렉션 흐름**:
    1. 사용자가 `/write` 접근.
    2. 프론트엔드(`onMount`)에서 `/auth/me` 호출.
    3. `401 Unauthorized` 발생 시 `/login`으로 이동.
    4. `/login`에서 Cloudflare Access 로그인 수행 후 다시 `/write`로 복귀.

---

## 4. 데이터베이스 및 게시글 관리

### **4.1 데이터 스키마 (D1)**
- **Table**: `posts`
    - `id`: Integer (Primary Key)
    - `title`: Text (게시글 제목)
    - `content`: Text (마크다운 본문)
    - `slug`: Text (Unique, URL 경로용)
    - `created_at`: Datetime

### **4.2 게시글 기능**
- **자동 슬러그 생성**: 게시글 작성 시 타이틀을 기반으로 영문/숫자 혼합 슬러그 자동 생성.
- **CRUD API**:
    - `GET /api/posts`: 목록 조회
    - `GET /api/posts/:id`: 상세 조회
    - `POST /api/posts`: 신규 작성
    - `PUT /api/posts/:id`: 수정
    - `DELETE /api/posts/:id`: 삭제

---

## 5. 아키텍처 원칙

- **DDD (Domain-Driven Design)**: 비즈니스 로직(`core/domain`)과 기술 구현(`core/infra`)의 엄격한 분리.
- **One Function Per File**: 하나의 파일은 하나의 기능만 수행하며, 파일명이 함수명과 일치.
- **Shared State**: Svelte 5 Runes(`$state`)를 활용한 효율적인 전역 상태 관리.

---
*Last Updated: 2026-03-13*
