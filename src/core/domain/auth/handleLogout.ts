import type { Env } from "../../shared/types/Env";

export async function handleLogout(request: Request, env: Env, url: URL, corsHeaders: Record<string, string>): Promise<Response> {
  const redirectTo = url.searchParams.get("redirect_to") || env.FRONTEND_URL || "/";

  // 로컬 개발 환경 우회
  if (env.ALLOW_LOCAL_AUTH === "true") {
    return new Response(null, {
      status: 302,
      headers: {
        Location: redirectTo,
        ...corsHeaders,
      },
    });
  }

  // Cloudflare Access 로그아웃 페이지로 리디렉션
  const teamDomain = env.ACCESS_TEAM_DOMAIN || "choidaruhan.cloudflareaccess.com";
  const logoutUrl = `https://${teamDomain}/logout?redirectTo=${encodeURIComponent(redirectTo)}`;

  return new Response(null, {
    status: 302,
    headers: {
      Location: logoutUrl,
      ...corsHeaders,
    },
  });
}
