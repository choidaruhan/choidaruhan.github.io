import { derived } from 'svelte/store';
import { posts } from "./posts";
import { searchQuery } from "./searchQuery";

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
