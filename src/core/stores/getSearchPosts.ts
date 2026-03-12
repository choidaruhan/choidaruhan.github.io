import { posts } from "./posts";
import { loading } from "./loading";
import { error } from "./error";
import { searchQuery } from "./searchQuery";
import { searchPosts as apiSearchPosts } from "../api/client/searchPosts";
import { sortPostsByDate } from "../utils/sortPostsByDate";
import { getFetchPosts } from "./getFetchPosts";
import { DUMMY_POSTS } from "../constants/DUMMY_POSTS";

export async function getSearchPosts(query: string) {
  searchQuery.set(query);
  
  if (!query.trim()) {
    await getFetchPosts();
    return;
  }
  
  loading.set(true);
  
  try {
    console.log('Searching posts via granular client function');
    const data = await apiSearchPosts(query);
    console.log('Search results:', data.length);
    posts.set(sortPostsByDate(data));
  } catch (err) {
    console.error('Search failed:', err);
    error.set(err instanceof Error ? err.message : 'Unknown error');
    // 로컬 개발 환경에서만 더미 데이터 사용
    if (window.location.hostname === "localhost") {
      console.warn('Using dummy data for local development');
      const q = query.toLowerCase();
      const filtered = DUMMY_POSTS.filter(
        (p) => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q)
      );
      posts.set(sortPostsByDate(filtered));
    }
  } finally {
    loading.set(false);
  }
}
