import type { Env } from "../../shared/types/Env";
import { jsonResponse } from "../../shared/utils/jsonResponse";
import { dispatchAuthRequest } from "../../domain/auth/dispatchAuthRequest";
import { dispatchPostRequest } from "../../domain/posts/dispatchPostRequest";

export async function routeRequest(
  request: Request,
  env: Env,
  url: URL,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const path = url.pathname;

  // Auth Routes
  const authResponse = await dispatchAuthRequest(path, request, env, url, corsHeaders);
  if (authResponse) return authResponse;

  // Post Routes
  const postResponse = await dispatchPostRequest(path, request, env, url, corsHeaders);
  if (postResponse) return postResponse;

  // Health Check
  if (path === "/health" && request.method === "GET") {
    return jsonResponse({ status: "ok", timestamp: new Date().toISOString() }, 200, corsHeaders);
  }

  return jsonResponse({ error: "Not found" }, 404, corsHeaders);
}
