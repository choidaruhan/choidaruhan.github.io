import { writable, derived } from 'svelte/store';
import type { Post } from "@/lib/api/blogApi";

// 환경에 따라 다른 API URL 사용
const API_BASE = window.location.hostname === "localhost"
  ? "http://localhost:8787"
  : "https://my-blog-worker.chl11wq12.workers.dev";

export const posts = writable<Post[]>([]);
export const loading = writable<boolean>(false);
export const error = writable<string | null>(null);
export const searchQuery = writable<string>("");

export const filteredPosts = derived(
  [posts, searchQuery],
  ([$posts, $searchQuery]) => {
    if (!$searchQuery.trim()) return $posts;
    const q = $searchQuery.toLowerCase();
    return $posts.filter(
      (p) =>
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.content && p.content.toLowerCase().includes(q))
    );
  }
);

export const selectedPost = writable<Post | null>(null);

function sortPosts(postsArray: Post[]) {
  return [...postsArray].sort((a, b) => {
    const da = new Date(a.created_at || a.date || 0).getTime();
    const db = new Date(b.created_at || b.date || 0).getTime();
    return db - da;
  });
}

// 더미 데이터
const dummyPosts: Post[] = [
  {
    id: 1,
    title: "첫 번째 블로그 글",
    content: "# 첫 번째 글\n\n안녕하세요! 이것은 첫 번째 블로그 글입니다.\n\n```javascript\nconsole.log('Hello World');\n```",
    created_at: "2024-01-01"
  },
  {
    id: 2,
    title: "두 번째 글 - Svelte",
    content: "# Svelte에 관하여\n\nSvelte는 정말 좋은 프레임워크입니다.\n\n## 장점\n\n- 컴파일 타임 최적화\n- 반응성이 뛰어남\n- 코드량이 적음",
    created_at: "2024-01-15"
  },
  {
    id: 3,
    title: "세 번째 글 - 마크다운",
    content: "# 마크다운 테스트\n\n마크다운 문법을 테스트합니다.\n\n> 인용문입니다\n\n**굵은 글씨**와 *기울임*",
    created_at: "2024-02-01"
  }
];

// 포스트 가져오기
export async function fetchPosts() {
  loading.set(true);
  error.set(null);

  try {
    const url = `${API_BASE}/api/posts`;
    console.log('Fetching posts from:', url);
    const res = await fetch(url);
    console.log('Response status:', res.status, res.ok);
    if (!res.ok) throw new Error('Failed to load posts');
    const data = await res.json() as Post[];
    console.log('Received posts:', data.length);
    posts.set(sortPosts(data));
  } catch (err) {
    console.error('Failed to fetch posts:', err);
    error.set(err instanceof Error ? err.message : 'Unknown error');
    // 로컬 개발 환경에서만 더미 데이터 사용
    if (window.location.hostname === "localhost") {
      console.warn('Using dummy data for local development');
      posts.set(sortPosts(dummyPosts));
    }
  } finally {
    loading.set(false);
  }
}

// 검색
export async function searchPosts(query: string) {
  searchQuery.set(query);
  
  if (!query.trim()) {
    await fetchPosts();
    return;
  }
  
  loading.set(true);
  
  try {
    const url = `${API_BASE}/api/posts?q=${encodeURIComponent(query)}`;
    console.log('Searching posts:', url);
    const res = await fetch(url);
    console.log('Search response status:', res.status, res.ok);
    if (!res.ok) throw new Error('Search failed');
    const data = await res.json() as Post[];
    console.log('Search results:', data.length);
    posts.set(sortPosts(data));
  } catch (err) {
    console.error('Search failed:', err);
    error.set(err instanceof Error ? err.message : 'Unknown error');
    // 로컬 개발 환경에서만 더미 데이터 사용
    if (window.location.hostname === "localhost") {
      console.warn('Using dummy data for local development');
      const q = query.toLowerCase();
      const filtered = dummyPosts.filter(
        (p) => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q)
      );
      posts.set(sortPosts(filtered));
    }
  } finally {
    loading.set(false);
  }
}

export function openPost(post: Post) {
  selectedPost.set(post);
}
