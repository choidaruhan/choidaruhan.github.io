import type { Post } from "../../shared/types/Post";

export function sortPostsByDate(posts: Post[], ascending = false): Post[] {
  return [...posts].sort((a, b) => {
    const dateA = new Date(a.updated_at || a.created_at || (a as any).date || 0).getTime();
    const dateB = new Date(b.updated_at || b.created_at || (b as any).date || 0).getTime();
    return ascending ? dateA - dateB : dateB - dateA;
  });
}
