import type { Env } from "../../shared/types/Env";
import { handleMe } from "./handleMe";
import { handleLogin } from "./handleLogin";
import { handleLogout } from "./handleLogout";

export async function dispatchAuthRequest(
  path: string,
  request: Request,
  env: Env,
  url: URL,
  corsHeaders: Record<string, string>
): Promise<Response | null> {
  if (path === "/auth/me" && request.method === "GET") return handleMe(request, env, corsHeaders);
  if (path === "/auth/login" && request.method === "GET") return handleLogin(request, env, url, corsHeaders);
  if (path === "/auth/logout" && request.method === "GET") return handleLogout(request, env, url, corsHeaders);
  return null;
}
