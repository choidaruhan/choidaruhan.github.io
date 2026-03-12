import { jsonResponse } from "../../utils/jsonResponse";
import type { Env } from "../../types/Env";
import type { Post } from "../../types/Post";

export async function handleListPosts(request: Request, env: Env, url: URL, corsHeaders: Record<string, string>): Promise<Response> {
  const searchQuery = url.searchParams.get("q");

  let query = "SELECT * FROM posts ORDER BY created_at DESC";
  let params: any[] = [];

  if (searchQuery) {
    query = "SELECT * FROM posts WHERE title LIKE ? OR content LIKE ? ORDER BY created_at DESC";
    params = [`%${searchQuery}%`, `%${searchQuery}%`];
  }

  const { results } = await env.DB.prepare(query)
    .bind(...params)
    .all<Post>();

  return jsonResponse(results, 200, corsHeaders);
}
