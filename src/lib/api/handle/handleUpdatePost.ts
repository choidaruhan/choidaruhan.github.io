import { jsonResponse } from "../../utils/jsonResponse";
import { checkAuth } from "../../auth/checkAuth";
import { generateSlug } from "../../utils/generateSlug";
import type { Env } from "../../types/Env";
import type { Post } from "../../types/Post";

export async function handleUpdatePost(request: Request, env: Env, postId: number, corsHeaders: Record<string, string>): Promise<Response> {
  if (!(await checkAuth(request, env))) {
    return jsonResponse({ error: "Unauthorized" }, 401, corsHeaders);
  }

  let body: { title?: string; content?: string; slug?: string };
  try {
    body = await request.json();
  } catch (e) {
    return jsonResponse({ error: "Invalid JSON" }, 400, corsHeaders);
  }

  // 기존 포스트 확인
  const existingPost = await env.DB.prepare(
    "SELECT * FROM posts WHERE id = ?",
  )
    .bind(postId)
    .first<Post>();

  if (!existingPost) {
    return jsonResponse({ error: "Post not found" }, 404, corsHeaders);
  }

  // 업데이트할 필드 구성
  const updates: string[] = [];
  const params: any[] = [];

  if (body.title !== undefined) {
    updates.push("title = ?");
    params.push(body.title);
  }
  if (body.content !== undefined) {
    updates.push("content = ?");
    params.push(body.content);
  }
  if (body.slug !== undefined) {
    const slug = body.slug || generateSlug(body.title || existingPost.title);

    // Slug 중복 확인 (자신 제외)
    const slugConflict = await env.DB.prepare(
      "SELECT id FROM posts WHERE slug = ? AND id != ?",
    )
      .bind(slug, postId)
      .first<{ id: number }>();

    if (slugConflict) {
      return jsonResponse(
        { error: "Slug already exists" },
        409,
        corsHeaders,
      );
    }

    updates.push("slug = ?");
    params.push(slug);
  }

  if (updates.length === 0) {
    return jsonResponse(
      { error: "No updates provided" },
      400,
      corsHeaders,
    );
  }

  updates.push("updated_at = ?");
  params.push(new Date().toISOString());
  params.push(postId);

  await env.DB.prepare(
    `UPDATE posts SET ${updates.join(", ")} WHERE id = ?`,
  )
    .bind(...params)
    .run();

  const updatedPost = await env.DB.prepare(
    "SELECT * FROM posts WHERE id = ?",
  )
    .bind(postId)
    .first<Post>();

  return jsonResponse(updatedPost, 200, corsHeaders);
}
