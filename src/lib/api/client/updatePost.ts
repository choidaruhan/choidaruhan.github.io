import { getFetchOptions, DEFAULT_API_BASE } from "./apiClientOptions";
import type { Post } from "../../types/Post";

export async function updatePost(id: number, post: Omit<Post, "id">, apiBase: string = DEFAULT_API_BASE): Promise<Post> {
  const res = await fetch(`${apiBase}/posts/${id}`, {
    ...getFetchOptions({
      "Content-Type": "application/json",
    }),
    method: "PUT",
    body: JSON.stringify(post),
  });
  if (!res.ok) throw new Error("Update failed");
  return await res.json();
}
