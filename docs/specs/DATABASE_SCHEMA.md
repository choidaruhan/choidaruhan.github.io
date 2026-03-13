# Database Schema (데이터베이스 스키마)

Cloudflare D1 (`my-blog-db`) 테이블 구조입니다.

## Table: `posts`
- **`id`**: Integer (Primary Key) - 게시글 고유 식별자.
- **`title`**: Text - 게시글 제목.
- **`content`**: Text - 마크다운 본문.
- **`slug`**: Text (Unique) - URL 경로용 슬러그.
- **`created_at`**: Datetime - 생성 일시.

---
*Last Updated: 2026-03-13*
