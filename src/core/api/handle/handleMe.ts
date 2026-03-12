import { jsonResponse } from "../../utils/jsonResponse";
import { getUserInfo } from "../../auth/getUserInfo";
import type { Env } from "../../types/Env";

export async function handleMe(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
  const userInfo = await getUserInfo(request, env);

  if (!userInfo) {
    return jsonResponse({ error: "Unauthorized" }, 401, corsHeaders);
  }

  return jsonResponse(userInfo, 200, corsHeaders);
}
