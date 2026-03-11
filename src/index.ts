/**
 * Cloudflare Workers API for Blog with GitHub OAuth via Cloudflare Access
 * Supports local development, Tunnel, and GitHub Pages deployment
 */

export interface Env {
  DB: D1Database;
  ALLOW_LOCAL_AUTH?: string;
  ACCESS_TEAM_DOMAIN?: string;
  ACCESS_AUDIENCE?: string;
  FRONTEND_URL?: string;
}

interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface User {
  email: string;
  name: string;
}

// Import jose for JWT verification
import { jwtVerify, createRemoteJWKSet } from "jose";

// JWKS caching
let jwksCache: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJwks(teamDomain: string): ReturnType<typeof createRemoteJWKSet> {
  if (!jwksCache) {
    jwksCache = createRemoteJWKSet(
      new URL(`https://${teamDomain}/cdn-cgi/access/certs`),
    );
  }
  return jwksCache;
}

// 허용할 오리진 (로컬 개발, Tunnel, GitHub Pages)
const ALLOWED_ORIGINS = [
  "http://localhost:5173", // 로컬 개발
  "http://localhost:8787", // Workers 개발 서버
  "https://choidaruhan.github.io", // GitHub Pages
  "https://my-blog-local.chl11wq12.workers.dev", // Tunnel 프론트엔드
];

// CORS 헤더 생성
function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin =
    origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, Cf-Access-Jwt-Assertion",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Expose-Headers": "Content-Type, Authorization",
    Vary: "Origin",
  };
}

// 인증 검사 (API 엔드포인트용)
async function checkAuth(request: Request, env: Env): Promise<boolean> {
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

// 사용자 정보 가져오기 (로컬 개발 우회 포함)
async function getUserInfo(
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

// Slug 생성
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// API 응답 헬퍼
function jsonResponse(
  data: any,
  status = 200,
  corsHeaders: Record<string, string>,
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const origin = request.headers.get("Origin");

    const corsHeaders = getCorsHeaders(origin);

    // Preflight 요청 처리
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // ==================== 인증 엔드포인트 ====================

      // GET /auth/me - 현재 사용자 정보
      if (path === "/auth/me" && request.method === "GET") {
        const userInfo = await getUserInfo(request, env);

        if (!userInfo) {
          return jsonResponse({ error: "Unauthorized" }, 401, corsHeaders);
        }

        return jsonResponse(userInfo, 200, corsHeaders);
      }

      // GET /auth/login - Cloudflare Access 로그인 리디렉션
      if (path === "/auth/login" && request.method === "GET") {
        const redirectTo =
          url.searchParams.get("redirect_to") || env.FRONTEND_URL || "/";
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
        const teamDomain =
          env.ACCESS_TEAM_DOMAIN || "choidaruhan.cloudflareaccess.com";
        const accessLoginUrl = `https://${teamDomain}/cdn-cgi/access/login?redirect_url=${encodeURIComponent(request.url)}`;

        return new Response(null, {
          status: 302,
          headers: {
            Location: accessLoginUrl,
            ...corsHeaders,
          },
        });
      }

      // GET /auth/logout - Cloudflare Access 로그아웃 리디렉션
      if (path === "/auth/logout" && request.method === "GET") {
        const redirectTo =
          url.searchParams.get("redirect_to") || env.FRONTEND_URL || "/";
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

        // Cloudflare Access 로그아웃 페이지로 리디렉션
        const teamDomain =
          env.ACCESS_TEAM_DOMAIN || "choidaruhan.cloudflareaccess.com";
        const logoutUrl = `https://${teamDomain}/logout?redirectTo=${encodeURIComponent(redirectTo)}`;

        return new Response(null, {
          status: 302,
          headers: {
            Location: logoutUrl,
            ...corsHeaders,
          },
        });
      }

      // ==================== 블로그 포스트 API ====================

      // GET /api/posts - 모든 포스트 조회 (검색 포함)
      if (path === "/api/posts" && request.method === "GET") {
        const searchQuery = url.searchParams.get("q");

        let query = "SELECT * FROM posts ORDER BY created_at DESC";
        let params: any[] = [];

        if (searchQuery) {
          query =
            "SELECT * FROM posts WHERE title LIKE ? OR content LIKE ? ORDER BY created_at DESC";
          params = [`%${searchQuery}%`, `%${searchQuery}%`];
        }

        const { results } = await env.DB.prepare(query)
          .bind(...params)
          .all<Post>();

        return jsonResponse(results, 200, corsHeaders);
      }

      // GET /api/posts/:id - 특정 포스트 조회
      const postIdMatch = path.match(/^\/api\/posts\/(\d+)$/);
      if (postIdMatch && request.method === "GET") {
        const postId = parseInt(postIdMatch[1], 10);

        const post = await env.DB.prepare("SELECT * FROM posts WHERE id = ?")
          .bind(postId)
          .first<Post>();

        if (!post) {
          return jsonResponse({ error: "Post not found" }, 404, corsHeaders);
        }

        return jsonResponse(post, 200, corsHeaders);
      }

      // POST /api/posts - 새 포스트 생성 (인증 필요)
      if (path === "/api/posts" && request.method === "POST") {
        if (!(await checkAuth(request, env))) {
          return jsonResponse({ error: "Unauthorized" }, 401, corsHeaders);
        }

        let body: { title?: string; content?: string; slug?: string };
        try {
          body = await request.json();
        } catch (e) {
          return jsonResponse({ error: "Invalid JSON" }, 400, corsHeaders);
        }

        if (!body.title || !body.content) {
          return jsonResponse(
            { error: "Title and content are required" },
            400,
            corsHeaders,
          );
        }

        const slug = body.slug || generateSlug(body.title);

        // Slug 중복 확인
        const existing = await env.DB.prepare(
          "SELECT id FROM posts WHERE slug = ?",
        )
          .bind(slug)
          .first<{ id: number }>();

        if (existing) {
          return jsonResponse(
            { error: "Slug already exists" },
            409,
            corsHeaders,
          );
        }

        const now = new Date().toISOString();

        const result = await env.DB.prepare(
          "INSERT INTO posts (title, slug, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
        )
          .bind(body.title, slug, body.content, now, now)
          .run();

        const insertedPost = await env.DB.prepare(
          "SELECT * FROM posts WHERE id = ?",
        )
          .bind(result.meta.last_row_id)
          .first<Post>();

        return jsonResponse(insertedPost, 201, corsHeaders);
      }

      // PUT /api/posts/:id - 포스트 수정 (인증 필요)
      if (postIdMatch && request.method === "PUT") {
        if (!(await checkAuth(request, env))) {
          return jsonResponse({ error: "Unauthorized" }, 401, corsHeaders);
        }

        const postId = parseInt(postIdMatch[1], 10);

        let body: { title?: string; content?: string; slug?: string };
        try {
          body = await request.json();
        } catch (e) {
          return jsonResponse({ error: "Invalid JSON" }, 400, corsHeaders);
        }

        // 기존 포스트 확인
        const existingPost = await env.DB.prepare(
          "SELECT * FROM posts WHERE id = ?",
        )
          .bind(postId)
          .first<Post>();

        if (!existingPost) {
          return jsonResponse({ error: "Post not found" }, 404, corsHeaders);
        }

        // 업데이트할 필드 구성
        const updates: string[] = [];
        const params: any[] = [];

        if (body.title !== undefined) {
          updates.push("title = ?");
          params.push(body.title);
        }
        if (body.content !== undefined) {
          updates.push("content = ?");
          params.push(body.content);
        }
        if (body.slug !== undefined) {
          const slug =
            body.slug || generateSlug(body.title || existingPost.title);

          // Slug 중복 확인 (자신 제외)
          const slugConflict = await env.DB.prepare(
            "SELECT id FROM posts WHERE slug = ? AND id != ?",
          )
            .bind(slug, postId)
            .first<{ id: number }>();

          if (slugConflict) {
            return jsonResponse(
              { error: "Slug already exists" },
              409,
              corsHeaders,
            );
          }

          updates.push("slug = ?");
          params.push(slug);
        }

        if (updates.length === 0) {
          return jsonResponse(
            { error: "No updates provided" },
            400,
            corsHeaders,
          );
        }

        updates.push("updated_at = ?");
        params.push(new Date().toISOString());
        params.push(postId);

        await env.DB.prepare(
          `UPDATE posts SET ${updates.join(", ")} WHERE id = ?`,
        )
          .bind(...params)
          .run();

        const updatedPost = await env.DB.prepare(
          "SELECT * FROM posts WHERE id = ?",
        )
          .bind(postId)
          .first<Post>();

        return jsonResponse(updatedPost, 200, corsHeaders);
      }

      // DELETE /api/posts/:id - 포스트 삭제 (인증 필요)
      if (postIdMatch && request.method === "DELETE") {
        if (!(await checkAuth(request, env))) {
          return jsonResponse({ error: "Unauthorized" }, 401, corsHeaders);
        }

        const postId = parseInt(postIdMatch[1], 10);

        // 기존 포스트 확인
        const existingPost = await env.DB.prepare(
          "SELECT id FROM posts WHERE id = ?",
        )
          .bind(postId)
          .first<{ id: number }>();

        if (!existingPost) {
          return jsonResponse({ error: "Post not found" }, 404, corsHeaders);
        }

        await env.DB.prepare("DELETE FROM posts WHERE id = ?")
          .bind(postId)
          .run();

        return jsonResponse({ success: true }, 200, corsHeaders);
      }

      // ==================== 상태 확인 ====================

      // GET /health - 상태 확인
      if (path === "/health" && request.method === "GET") {
        return jsonResponse(
          { status: "ok", timestamp: new Date().toISOString() },
          200,
          corsHeaders,
        );
      }

      // ==================== 404 처리 ====================

      return jsonResponse({ error: "Not found" }, 404, corsHeaders);
    } catch (error) {
      console.error("API error:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Internal server error";
      return jsonResponse({ error: errorMessage }, 500, corsHeaders);
    }
  },
};
