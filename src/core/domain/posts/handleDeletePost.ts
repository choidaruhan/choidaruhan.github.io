import { jsonResponse } from "../../shared/utils/jsonResponse";
import { checkAuth } from "../auth/checkAuth";
import type { Env } from "../../shared/types/Env";

export async function handleDeletePost(request: Request, env: Env, postId: number, corsHeaders: Record<string, string>): Promise<Response> {
  if (!(await checkAuth(request, env))) {
    return jsonResponse({ error: "Unauthorized" }, 401, corsHeaders);
  }

  // 기존 포스트 확인
  const existingPost = await env.DB.prepare("SELECT id FROM posts WHERE id = ?")
    .bind(postId)
    .first<{ id: number }>();

  if (!existingPost) {
    return jsonResponse({ error: "Post not found" }, 404, corsHeaders);
  }

  await env.DB.prepare("DELETE FROM posts WHERE id = ?")
    .bind(postId)
    .run();

  return jsonResponse({ success: true }, 200, corsHeaders);
}
