import type { Post } from "@/lib/api/blogApi";

export function formatPostDate(post: Post): string {
  const dateStr = post.created_at || post.date || post.published_at;
  const date = dateStr ? new Date(dateStr) : new Date();
  return date.toLocaleString();
}

export function sortPostsByDate(posts: Post[], ascending = false): Post[] {
  return [...posts].sort((a, b) => {
    const da = new Date(a.created_at || a.date || 0).getTime();
    const db = new Date(b.created_at || b.date || 0).getTime();
    return ascending ? da - db : db - da;
  });
}