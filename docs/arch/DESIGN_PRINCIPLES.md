# Design Principles (설계 원칙)

일관된 코드 품질을 위해 다음과 같은 원칙을 준수합니다.

## 1. One Function Per File
하나의 파일은 하나의 주요 기능(함수)만 수행하며, 파일명은 함수명과 일치해야 합니다.

## 2. Framework Agnostic Core
`core/` 디렉토리의 로직은 가능한 프레임워크(SvelteKit)에 의존하지 않도록 구성합니다.

## 3. DDD (Domain-Driven Design)
비즈니스 로직(`core/domain`)과 기술 구현(`core/infra`)을 엄격히 분리합니다.

## 4. Static First
모든 프론트엔드 결과물은 정적으로 빌드되어 배포됩니다.

---
*Last Updated: 2026-03-13*
