# One Function Per File

이 문서는 프로젝트의 핵심 코딩 원칙인 "함수 하나에 하나의 파일" 규칙을 정의합니다.

## 설명

각 소스 코드 파일(TypeScript, JavaScript, Svelte 등)과 마크다운 파일은 다음과 같은 단일 책임 원칙을 준수해야 합니다:

1. **코드 파일**: 하나의 파일에는 오직 하나의 함수(또는 컴포넌트)만 정의되어야 합니다.
2. **마크다운 파일**: 하나의 파일은 오직 하나의 명확한 주제나 개념만을 다루어야 합니다.

## 예시

### 코드 예시: `calculateTotalPrice.ts`

```typescript
export function calculateTotalPrice(items: Item[]) {
  return items.reduce((total, item) => total + item.price, 0);
}
```

### 문서 예시: `MODULAR_ARCHITECTURE.md`

- 해당 문서는 '모듈 아키텍처'라는 하나의 대주제만 다루며, 다른 주제는 별도의 문서로 분리합니다.
