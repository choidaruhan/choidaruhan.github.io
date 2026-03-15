# Filename Must Match Function Name

이 문서는 파일 이름과 해당 파일 내에 정의된 구성 요소 간의 명확한 대응 규칙을 정의합니다.

## 설명

명확한 대응 규칙은 코드와 문서 파일 모두에 적용됩니다:

1. **코드 파일**: 파일 이름은 반드시 해당 파일 내에 정의된 유일한 함수의 이름과 정확히 일치해야 합니다. (예: `getUserProfile` 함수는 `getUserProfile.ts`에 위치)
2. **마크다운 파일**: 마크다운 파일의 이름은 문서의 주요 제목(H1)과 정확히 일치해야 합니다. (예: `# API Specification` 문서는 `API_SPECIFICATION.md`로 저장)

## 예시

### 코드 예시

- **함수 이름**: `calculateTotalPrice`
- **파일명**: `calculateTotalPrice.ts`

```typescript
export function calculateTotalPrice(items: Item[]) {
  // 로직...
}
```

### 문서 예시

- **문서 제목**: `# Filename Must Match Function Name`
- **파일명**: `FILENAME_MUST_MATCH_FUNCTION_NAME.md`
