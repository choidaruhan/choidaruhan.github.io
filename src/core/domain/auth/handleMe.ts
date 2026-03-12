import { jsonResponse } from "../../shared/utils/jsonResponse";
import { getUserInfo } from "./getUserInfo";
import type { Env } from "../../shared/types/Env";

export async function handleMe(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
  const userInfo = await getUserInfo(request, env);

  if (!userInfo) {
    return jsonResponse({ error: "Unauthorized" }, 401, corsHeaders);
  }

  return jsonResponse(userInfo, 200, corsHeaders);
}
