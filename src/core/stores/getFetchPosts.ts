import { posts } from "./posts";
import { loading } from "./loading";
import { error } from "./error";
import { fetchPosts as apiFetchPosts } from "../api/client/fetchPosts";
import { sortPostsByDate } from "../utils/sortPostsByDate";
import { DUMMY_POSTS } from "../constants/DUMMY_POSTS";

export async function getFetchPosts() {
  loading.set(true);
  error.set(null);

  try {
    console.log('Fetching posts via granular client function');
    const data = await apiFetchPosts();
    console.log('Received posts:', data.length);
    posts.set(sortPostsByDate(data));
  } catch (err) {
    console.error('Failed to fetch posts:', err);
    error.set(err instanceof Error ? err.message : 'Unknown error');
    // 로컬 개발 환경에서만 더미 데이터 사용
    if (window.location.hostname === "localhost") {
      console.warn('Using dummy data for local development');
      posts.set(sortPostsByDate(DUMMY_POSTS));
    }
  } finally {
    loading.set(false);
  }
}
