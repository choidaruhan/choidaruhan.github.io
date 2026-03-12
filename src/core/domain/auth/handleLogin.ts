import { jsonResponse } from "../../shared/utils/jsonResponse";
import type { Env } from "../../shared/types/Env";

export async function handleLogin(request: Request, env: Env, url: URL, corsHeaders: Record<string, string>): Promise<Response> {
  const redirectTo = url.searchParams.get("redirect_to") || env.FRONTEND_URL || "/";
  const origin = request.headers.get("Origin");

  // 로컬 개발 환경 우회
  if (
    env.ALLOW_LOCAL_AUTH === "true" &&
    origin &&
    origin.includes("localhost")
  ) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: redirectTo,
        ...corsHeaders,
      },
    });
  }

  // Cloudflare Access 로그인 페이지로 리디렉션
  const teamDomain = env.ACCESS_TEAM_DOMAIN || "choidaruhan.cloudflareaccess.com";
  const accessLoginUrl = `https://${teamDomain}/cdn-cgi/access/login?redirect_url=${encodeURIComponent(request.url)}`;

  return new Response(null, {
    status: 302,
    headers: {
      Location: accessLoginUrl,
      ...corsHeaders,
    },
  });
}
