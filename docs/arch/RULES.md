# Rules: 구조 및 설계 규칙

## 1. 계층 준수
- 상위 레이어는 하위 레이어를 알 수 있지만, 하위 레이어는 상위 레이어를 참조해서는 안 됩니다. (Dependency Rule)
- 모든 파일은 정의된 레이어(`arch/LAYER_STRUCTURE.md`)에 따라 올바른 위치에 있어야 합니다.

## 2. 설계 원칙
- [DESIGN_PRINCIPLES.md](DESIGN_PRINCIPLES.md)를 모든 코드 작성의 기준으로 삼습니다.
- 새로운 전역 라이브러리 도입 시 반드시 설계 검토를 거쳐야 합니다.
