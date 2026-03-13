# Layer Structure (레이어 구조)

프로젝트는 DDD 원칙을 참고하여 레이어를 분리하고 있습니다.

## 핵심 레이어 (src/core/)
- **`domain/`**: 순수한 비즈니스 로직.
- **`infra/`**: 데이터베이스 통신(D1), API 클라이언트 등 기술 구현체.
- **`app/`**: 애플리케이션 전역 상태, 설정, 상수 등.
- **`shared/`**: 공용 유틸리티와 타입 정의.

## 프레임워크 레이어 (src/routes/ & lib/)
- **`routes/`**: SvelteKit 파일 기반 라우팅 시스템.
- **`lib/components/`**: UI 구성 요소 (재사용 가능한 컴포넌트).

---
*Last Updated: 2026-03-13*
