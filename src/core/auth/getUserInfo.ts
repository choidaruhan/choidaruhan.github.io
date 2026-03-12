import { jwtVerify } from "jose";
import { getJwks } from "./getJwks";
import type { Env } from "../types/Env";
import type { User } from "../types/User";

export async function getUserInfo(
  request: Request,
  env: Env,
): Promise<{ user: User } | null> {
  const origin = request.headers.get("Origin");

  // 로컬 개발 환경: 가상 사용자 반환
  if (
    env.ALLOW_LOCAL_AUTH === "true" &&
    origin &&
    origin.includes("localhost")
  ) {
    return {
      user: {
        email: "dev@localhost",
        name: "Local Developer",
      },
    };
  }

  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!token) {
    return null;
  }

  const teamDomain =
    env.ACCESS_TEAM_DOMAIN || "choidaruhan.cloudflareaccess.com";
  const audience = env.ACCESS_AUDIENCE || `https://${teamDomain}`;

  try {
    const jwks = getJwks(teamDomain);
    const { payload } = await jwtVerify(token, jwks, {
      issuer: `https://${teamDomain}`,
      audience: audience,
    });

    return {
      user: {
        email: payload.email as string,
        name: (payload.name as string) || (payload.email as string),
      },
    };
  } catch (e) {
    console.error("Failed to get user info:", e);
    return null;
  }
}
