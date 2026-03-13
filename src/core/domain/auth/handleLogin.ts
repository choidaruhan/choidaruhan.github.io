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

  // 이미 인증된 상태인지 확인 (JWT 토큰 존재 여부)
  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  if (token) {
    // 이미 인증되었다면 바로 목표 페이지로 리디렉션
    return new Response(null, {
      status: 302,
      headers: {
        Location: redirectTo,
        ...corsHeaders,
      },
    });
  }

  // Cloudflare Access 로그인 페이지로 리디렉션
  // 수동으로 cdn-cgi URL을 생성하는 대신, 보호된 도메인의 루트로 리디렉션하여
  // Cloudflare Access가 자동으로 인증을 가로채고 로그인 페이지로 보내도록 유도합니다.
  // 이렇게 하면 호스트 환경에 따른 경로 불일치 문제를 피할 수 있습니다.
  
  // 로그인 후 돌아올 URL을 세션/쿠기에 저장할 수 없으므로 (Stateless)
  // Cloudflare Access의 redirect_url 매커니즘에 의존합니다.
  const workerUrl = new URL(request.url);
  const teamDomain = env.ACCESS_TEAM_DOMAIN || "choidaruhan.cloudflareaccess.com";
  
  // Cloudflare Access가 보호하는 도메인에 접근하면 자동으로 로그인 페이지로 이동합니다.
  // /auth/login 자체가 보호 대상이라면 여기서 302를 따로 줄 필요 없이 이미 인증 페이지에 있어야 합니다.
  // 만약 인증 없이 여기까지 도달했다면, 강제로 cdn-cgi/access/login 경로를 타게 하되
  // 호스트명을 포함한 올바른 구조를 사용합니다.
  const hostname = workerUrl.hostname;
  const accessLoginUrl = `https://${teamDomain}/cdn-cgi/access/login/${hostname}?redirect_url=${encodeURIComponent(request.url)}`;

  return new Response(null, {
    status: 302,
    headers: {
      Location: accessLoginUrl,
      ...corsHeaders,
    },
  });
}
