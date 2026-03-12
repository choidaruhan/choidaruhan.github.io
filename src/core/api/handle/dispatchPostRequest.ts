import type { Env } from "../../types/Env";
import { handleListPosts } from "./handleListPosts";
import { handleCreatePost } from "./handleCreatePost";
import { handleGetPost } from "./handleGetPost";
import { handleUpdatePost } from "./handleUpdatePost";
import { handleDeletePost } from "./handleDeletePost";

export async function dispatchPostRequest(
  path: string,
  request: Request,
  env: Env,
  url: URL,
  corsHeaders: Record<string, string>
): Promise<Response | null> {
  const postIdMatch = path.match(/^\/api\/posts\/(\d+)$/);
  
  if (path === "/api/posts") {
    if (request.method === "GET") return handleListPosts(request, env, url, corsHeaders);
    if (request.method === "POST") return handleCreatePost(request, env, corsHeaders);
  }

  if (postIdMatch) {
    const postId = parseInt(postIdMatch[1], 10);
    if (request.method === "GET") return handleGetPost(request, env, postId, corsHeaders);
    if (request.method === "PUT") return handleUpdatePost(request, env, postId, corsHeaders);
    if (request.method === "DELETE") return handleDeletePost(request, env, postId, corsHeaders);
  }

  return null;
}
