import type { Env } from "../types/Env";
import { getCorsHeaders } from "../utils/getCorsHeaders";
import { jsonResponse } from "../utils/jsonResponse";
import { routeRequest } from "./handle/routeRequest";

export async function fetch(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  const url = new URL(request.url);
  const origin = request.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin);

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    return await routeRequest(request, env, url, corsHeaders);
  } catch (error) {
    console.error("API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return jsonResponse({ error: errorMessage }, 500, corsHeaders);
  }
}

export default {
  fetch
};
