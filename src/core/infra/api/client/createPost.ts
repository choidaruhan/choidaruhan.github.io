import { getFetchOptions } from "./getFetchOptions";
import { DEFAULT_API_BASE } from "../../../app/constants/DEFAULT_API_BASE";
import type { Post } from "../../../shared/types/Post";

export async function createPost(post: Omit<Post, "id">, apiBase: string = DEFAULT_API_BASE): Promise<Post> {
  const res = await fetch(`${apiBase}/posts`, {
    ...getFetchOptions({
      "Content-Type": "application/json",
    }),
    method: "POST",
    body: JSON.stringify(post),
  });
  if (!res.ok) throw new Error("Failed to submit post");
  return await res.json();
}
