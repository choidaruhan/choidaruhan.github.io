import type { Post } from "../../shared/types/Post";

export const DUMMY_POSTS: Post[] = [
  {
    id: 1,
    title: "첫 번째 블로그 글",
    slug: "first-post",
    content: "# 첫 번째 글\n\n안녕하세요! 이것은 첫 번째 블로그 글입니다.\n\n```javascript\nconsole.log('Hello World');\n```",
    created_at: "2024-01-01",
    updated_at: "2024-01-01"
  },
  {
    id: 2,
    title: "두 번째 글 - Svelte",
    slug: "svelte-post",
    content: "# Svelte에 관하여\n\nSvelte는 정말 좋은 프레임워크입니다.\n\n## 장점\n\n- 컴파일 타임 최적화\n- 반응성이 뛰어남\n- 코드량이 적음",
    created_at: "2024-01-15",
    updated_at: "2024-01-15"
  },
  {
    id: 3,
    title: "세 번째 글 - 마크다운",
    slug: "markdown-test",
    content: "# 마크다운 테스트\n\n마크다운 문법을 테스트합니다.\n\n> 인용문입니다\n\n**굵은 글씨**와 *기울임*",
    created_at: "2024-02-01",
    updated_at: "2024-02-01"
  }
];
