import { getFetchOptions } from "./getFetchOptions";
import { DEFAULT_API_BASE } from "../../constants/DEFAULT_API_BASE";
import type { Post } from "../../types/Post";

export async function searchPosts(query: string, apiBase: string = DEFAULT_API_BASE): Promise<Post[]> {
  const res = await fetch(
    `${apiBase}/posts?q=${encodeURIComponent(query)}`,
    getFetchOptions(),
  );
  if (!res.ok) throw new Error("Search failed");
  return await res.json();
}
