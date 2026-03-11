import type { Post } from "@/lib/api/blogApi";

export function formatPostDate(post: Post): string {
  // Use updated_at if available, otherwise created_at
  const dateStr = post.updated_at || post.created_at || post.date || post.published_at;
  const date = dateStr ? new Date(dateStr) : new Date();
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function sortPostsByDate(posts: Post[], ascending = false): Post[] {
  return [...posts].sort((a, b) => {
    const dateA = new Date(a.updated_at || a.created_at || a.date || 0).getTime();
    const dateB = new Date(b.updated_at || b.created_at || b.date || 0).getTime();
    return ascending ? dateA - dateB : dateB - dateA;
  });
}