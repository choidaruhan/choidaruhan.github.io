import { jsonResponse } from "../../shared/utils/jsonResponse";
import type { Env } from "../../shared/types/Env";
import type { Post } from "../../shared/types/Post";

export async function handleGetPost(request: Request, env: Env, postId: number, corsHeaders: Record<string, string>): Promise<Response> {
  const post = await env.DB.prepare("SELECT * FROM posts WHERE id = ?")
    .bind(postId)
    .first<Post>();

  if (!post) {
    return jsonResponse({ error: "Post not found" }, 404, corsHeaders);
  }

  return jsonResponse(post, 200, corsHeaders);
}
