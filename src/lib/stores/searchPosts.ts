import { posts } from "./posts";
import { loading } from "./loading";
import { error } from "./error";
import { searchQuery } from "./searchQuery";
import { searchPosts as apiSearchPosts } from "../api/client/searchPosts";
import { sortPostsByDate } from "../utils/sortPostsByDate";
import { fetchPosts } from "./fetchPosts";
import { dummyPosts } from "./dummyPosts";

export async function searchPosts(query: string) {
  searchQuery.set(query);
  
  if (!query.trim()) {
    await fetchPosts();
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
      const filtered = dummyPosts.filter(
        (p) => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q)
      );
      posts.set(sortPostsByDate(filtered));
    }
  } finally {
    loading.set(false);
  }
}
