import type { Post } from "../types/Post";

export function formatPostDate(post: Post): string {
  // Use updated_at if available, otherwise created_at
  const dateStr = post.updated_at || post.created_at || (post as any).date || (post as any).published_at;
  const date = dateStr ? new Date(dateStr) : new Date();
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
