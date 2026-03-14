# One Function Per File

이 문서는 프로젝트의 핵심 코딩 원칙인 "함수 하나에 하나의 파일" 규칙을 정의합니다.

## 핵심 원칙

1. **단일 책임 (Single Responsibility)**: 각 소스 코드 파일은 오직 하나의 함수만을 포함해야 합니다.
2. **명확한 대응 (Explicit Mapping)**: 파일 이름은 반드시 해당 파일 내에 정의된 함수의 이름과 정확히 일치해야 합니다.

### 예시

- **함수 이름**: `calculateTotalPrice`
- **파일명**: `calculateTotalPrice.ts` (또는 `.js`, `.svelte` 등)

```typescript
// calculateTotalPrice.ts
export function calculateTotalPrice(items: Item[]) {
  return items.reduce((total, item) => total + item.price, 0);
}
```

## 기대 효과

- 코드 가독성 향상
- 테스트 용이성 (단위 테스트가 파일 단위로 분리됨)
- 협업 시 충돌(Conflict) 최소화
- 파일 검색 및 탐색 속도 향상
