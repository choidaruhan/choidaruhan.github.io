# My Memo Web

순수 HTML/CSS/JS로 만든 메모 웹 애플리케이션입니다.

## 실행 방법

로컬 서버가 필요합니다 (ES modules 사용):

```bash
npm run build   # md → posts-data.js 변환
npx serve .     # 정적 서버 실행
```

또는:

```bash
python3 -m http.server 8000
```

## 개발 워크플로우

1. `posts/` 폴더에 마크다운 파일 추가 (frontmatter 포함)
2. `npm run build` 실행
3. `posts-data.js` 자동 생성됨

## 기능

- **포스트 목록**: 날짜순 정렬된 포스트 카드 표시
- **포스트 상세**: 카드 클릭 시 전체 내용 표시
- **검색**: 제목, 내용, 태그 기준 실시간 필터링
- **다크/라이트 모드**: 토글 버튼으로 전환 (시스템 설정 자동 감지, localStorage 저장)

## 프로젝트 구조

```text
index.html         # 메인 페이지
style.css          # 스타일 (다크/라이트 모드, 반응형)
app.js             # 애플리케이션 로직 (ES module)
posts-data.js      # 빌드 생성물 (직접 수정 금지)
posts/             # 마크다운 포스트 소스
  YYYY-MM-DD-slug.md
scripts/
  build.js         # md → JS 빌드 스크립트
```

## 포스트 추가

`posts/` 폴더에 새 마크다운 파일 생성:

```markdown
---
title: "포스트 제목"
date: 2026-04-04
tags:
  - 태그1
  - 태그2
---

내용을 여기에 마크다운으로 작성합니다.
```

파일명 규칙: `YYYY-MM-DD-슬러그.md`

그 후 `npm run build` 실행.
