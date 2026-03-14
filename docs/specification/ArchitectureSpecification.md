# 아키텍처 명세 (Architecture Specification)

이 프로젝트는 유지보수성과 확장성을 위해 DDD(Domain-Driven Design) 원칙을 기반으로 한 레이어드 아키텍처를 따릅니다.

## 1. 디렉토리 구조 및 레이어 역할 (`src/core`)

모든 비즈니스 로직과 데이터 처리는 `src/core` 디렉터리 내에서 관리됩니다.

### app (Application Layer)

- **역할**: 외부 세계와 도메인 레이어를 연결하는 진입점입니다.
- **주요 구성**: Use Case, Service 클래스 등.

### domain (Domain Layer)

- **역할**: 핵심 비즈니스 로직과 모델을 정의합니다.
- **주요 구성**: Entity, Value Object, Repository 인터페이스.
- **의존성**: 순수 로직만 포함하며 다른 어느 레이어에도 의존하지 않습니다.

### infra (Infrastructure Layer)

- **역할**: 외부 시스템(DB, API, 캐시 등)과의 구체적인 연동을 담당합니다.
- **주요 구성**: API 클라이언트, DB Repository 구현체.
- **의존성**: 도메인 레이어의 인터페이스를 구현합니다.

### shared (Shared Kernel)

- **역할**: 모든 레이어에서 공통적으로 사용되는 유틸리티나 상수를 포함합니다.

## 2. 의존성 규칙

- 의존성은 항상 외부에서 내부 방향으로 향해야 합니다.
- 프레임워크(Svelte)나 외부 라이브러리에 대한 의존성은 가능한 `infra` 레이어에 격리합니다.

## 목적

- 코드의 역할과 책임을 명확히 구분하여 테스트가 용이하고 변경에 유연한 구조를 유지합니다.
