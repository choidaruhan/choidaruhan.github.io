import { jsonResponse } from "../../utils/jsonResponse";
import { checkAuth } from "../../auth/checkAuth";
import { generateSlug } from "../../utils/generateSlug";
import type { Env } from "../../types/Env";
import type { Post } from "../../types/Post";

export async function handleCreatePost(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
  if (!(await checkAuth(request, env))) {
    return jsonResponse({ error: "Unauthorized" }, 401, corsHeaders);
  }

  let body: { title?: string; content?: string; slug?: string };
  try {
    body = await request.json();
  } catch (e) {
    return jsonResponse({ error: "Invalid JSON" }, 400, corsHeaders);
  }

  if (!body.title || !body.content) {
    return jsonResponse(
      { error: "Title and content are required" },
      400,
      corsHeaders,
    );
  }

  const slug = body.slug || generateSlug(body.title);

  // Slug 중복 확인
  const existing = await env.DB.prepare(
    "SELECT id FROM posts WHERE slug = ?",
  )
    .bind(slug)
    .first<{ id: number }>();

  if (existing) {
    return jsonResponse(
      { error: "Slug already exists" },
      409,
      corsHeaders,
    );
  }

  const now = new Date().toISOString();

  const result = await env.DB.prepare(
    "INSERT INTO posts (title, slug, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
  )
    .bind(body.title, slug, body.content, now, now)
    .run();

  const insertedPost = await env.DB.prepare(
    "SELECT * FROM posts WHERE id = ?",
  )
    .bind(result.meta.last_row_id)
    .first<Post>();

  return jsonResponse(insertedPost, 201, corsHeaders);
}
