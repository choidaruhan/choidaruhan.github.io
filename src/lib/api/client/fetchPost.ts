import { getFetchOptions, DEFAULT_API_BASE } from "./apiClientOptions";
import type { Post } from "../../types/Post";

export async function fetchPost(id: number, apiBase: string = DEFAULT_API_BASE): Promise<Post> {
  const res = await fetch(`${apiBase}/posts/${id}`, getFetchOptions());
  if (!res.ok) throw new Error("Failed to load post");
  return await res.json();
}
