import { jwtVerify } from "jose";
import { getJwks } from "./getJwks";
import type { Env } from "../../shared/types/Env";

export async function checkAuth(request: Request, env: Env): Promise<boolean> {
  // 로컬 개발 환경 우회
  if (
    env.ALLOW_LOCAL_AUTH === "true" &&
    request.headers.get("Origin")?.includes("localhost")
  ) {
    return true;
  }

  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!token) {
    return false;
  }

  const teamDomain =
    env.ACCESS_TEAM_DOMAIN || "choidaruhan.cloudflareaccess.com";
  const audience = env.ACCESS_AUDIENCE || `https://${teamDomain}`;

  try {
    const jwks = getJwks(teamDomain);
    await jwtVerify(token, jwks, {
      issuer: `https://${teamDomain}`,
      audience: audience,
    });
    return true;
  } catch (e) {
    console.error("JWT verification failed:", e);
    return false;
  }
}
