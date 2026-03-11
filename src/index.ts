/**
 * Cloudflare Workers API for Blog
 * D1 데이터베이스를 사용하여 포스트를 관리합니다.
 * Authentication via Cloudflare Access JWT.
 */

export interface Env {
  DB: D1Database;
  ALLOW_LOCAL_AUTH?: string;
  ACCESS_TEAM_DOMAIN?: string;
}

interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// Import jose for JWT verification
import { jwtVerify } from 'jose';

// JWKS caching
let jwksCache: jose.JWKSet | null = null;
let jwksCacheTime = 0;
const JWKS_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

async function getJwks(teamDomain: string): Promise<jose.JWKSet> {
  const now = Date.now();
  if (jwksCache && (now - jwksCacheTime) < JWKS_CACHE_TTL) {
    return jwksCache;
  }
  const res = await fetch(`https://${teamDomain}/cdn-cgi/access/certs`);
  if (!res.ok) {
    throw new Error(`Failed to fetch JWKS: ${res.status}`);
  }
  jwksCache = await res.json() as jose.JWKSet;
  jwksCacheTime = now;
  return jwksCache;
}

// 허용할 오리진
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:8787",
  "https://choidaruhan.github.io",
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  console.log('CORS origin:', origin, 'allowed origins:', ALLOWED_ORIGINS);
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0] || "*";
  console.log('Selected allowed origin:', allowedOrigin);
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

async function checkAuth(request: Request, env: Env): Promise<boolean> {
  // In local development, allow auth if ALLOW_LOCAL_AUTH is true
  if (env.ALLOW_LOCAL_AUTH === "true" && request.headers.get("Origin")?.includes("localhost")) {
    return true;
  }

  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!token) {
    return false;
  }

  const teamDomain = env.ACCESS_TEAM_DOMAIN || 'choidaruhan.cloudflareaccess.com';
  try {
    const jwks = await getJwks(teamDomain);
    await jwtVerify(token, jwks, {
      issuer: `https://${teamDomain}`,
      audience: `https://${teamDomain}`
    });
    return true;
  } catch (e) {
    console.error('JWT verification failed:', e);
    return false;
  }
}

function generateSlug(title: string): string {
  return title.toLowerCase()
    .replace(/[^a-z0-9가-힣]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const origin = request.headers.get("Origin");

    const corsHeaders = getCorsHeaders(origin);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // GET /auth/me - return user info from Access JWT
      if (path === "/auth/me" && request.method === "GET") {
        const token = request.headers.get("Cf-Access-Jwt-Assertion");
        if (!token) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }

        const teamDomain = env.ACCESS_TEAM_DOMAIN || 'choidaruhan.cloudflareaccess.com';
        try {
          const jwks = await getJwks(teamDomain);
          const { payload } = await jwtVerify(token, jwks, {
            issuer: `https://${teamDomain}`,
            audience: `https://${teamDomain}`
          });

          return new Response(JSON.stringify({
            user: {
              email: payload.email,
              name: payload.name || payload.email,
            }
          }), {
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        } catch (e) {
          console.error('Auth error:', e);
          return new Response(JSON.stringify({ error: "Invalid token" }), {
            status: 401,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }
      }

      // GET /auth/login - Redirect to frontend after Access authentication
      if (path === "/auth/login") {
        const redirectTo = url.searchParams.get("redirect_to") || env.FRONTEND_URL || "/";
        return new Response(null, {
          status: 302,
          headers: {
            "Location": redirectTo,
            ...corsHeaders
          }
        });
      }

      // GET /auth/logout - Redirect to Access logout
      if (path === "/auth/logout") {
        const teamDomain = env.ACCESS_TEAM_DOMAIN || 'choidaruhan.cloudflareaccess.com';
        const redirectTo = url.searchParams.get("redirect_to") || env.FRONTEND_URL || "/";
        const logoutUrl = `https://${teamDomain}/logout?redirectTo=${encodeURIComponent(redirectTo)}`;
        return new Response(null, {
          status: 302,
          headers: {
            "Location": logoutUrl,
            ...corsHeaders
          }
        });
      }

      // GET /api/posts - 모든 포스트 가져오기
      if (path === "/api/posts" && request.method === "GET") {
        const searchQuery = url.searchParams.get("q");

        if (searchQuery) {
          // 검색 기능
          const { results } = await env.DB.prepare(
            "SELECT * FROM posts WHERE title LIKE ? OR content LIKE ? ORDER BY created_at DESC"
          ).bind(`%${searchQuery}%`, `%${searchQuery}%`).all<Post>();
          return new Response(JSON.stringify(results), {
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }

        const { results } = await env.DB.prepare(
          "SELECT * FROM posts ORDER BY created_at DESC"
        ).all<Post>();

        return new Response(JSON.stringify(results), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      // GET /api/posts/:id - 특정 포스트 가져오기
      const postMatch = path.match(/^\/api\/posts\/(\d+)$/);
      if (postMatch && request.method === "GET") {
        const postId = postMatch[1];
        const { results } = await env.DB.prepare(
          "SELECT * FROM posts WHERE id = ?"
        ).bind(postId).all<Post>();

        if (results.length === 0) {
          return new Response(JSON.stringify({ error: "Post not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }

        return new Response(JSON.stringify(results[0]), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      // POST /api/posts - 새 포스트 생성
      if (path === "/api/posts" && request.method === "POST") {
        if (!await checkAuth(request, env)) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }

        const body = await request.json<{ title: string; content: string; slug?: string }>();

        if (!body.title || !body.content) {
          return new Response(JSON.stringify({ error: "Title and content are required" }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }

        const slug = body.slug || generateSlug(body.title);

        // Check if slug already exists
        const existing = await env.DB.prepare(
          "SELECT id FROM posts WHERE slug = ?"
        ).bind(slug).first<{ id: number }>();

        if (existing) {
          return new Response(JSON.stringify({ error: "Slug already exists" }), {
            status: 409,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }

        const now = new Date().toISOString();

        const result = await env.DB.prepare(
          "INSERT INTO posts (title, slug, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)"
        ).bind(body.title, slug, body.content, now, now).run();

        const insertedPost = await env.DB.prepare(
          "SELECT * FROM posts WHERE id = ?"
        ).bind(result.meta.last_row_id).first<Post>();

        return new Response(JSON.stringify(insertedPost), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      // PUT /api/posts/:id - 포스트 수정
      const putMatch = path.match(/^\/api\/posts\/(\d+)$/);
      if (putMatch && request.method === "PUT") {
        if (!await checkAuth(request, env)) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }

        const postId = putMatch[1];
        const body = await request.json<{ title?: string; content?: string; slug?: string }>();

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
          updates.push("slug = ?");
          params.push(body.slug);
        }

        if (updates.length === 0) {
          return new Response(JSON.stringify({ error: "No updates provided" }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }

        updates.push("updated_at = ?");
        params.push(new Date().toISOString());
        params.push(postId);

        await env.DB.prepare(
          `UPDATE posts SET ${updates.join(", ")} WHERE id = ?`
        ).bind(...params).run();

        const updatedPost = await env.DB.prepare(
          "SELECT * FROM posts WHERE id = ?"
        ).bind(postId).first<Post>();

        return new Response(JSON.stringify(updatedPost), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      // DELETE /api/posts/:id - 포스트 삭제
      const deleteMatch = path.match(/^\/api\/posts\/(\d+)$/);
      if (deleteMatch && request.method === "DELETE") {
        if (!await checkAuth(request, env)) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }

        const postId = deleteMatch[1];
        await env.DB.prepare("DELETE FROM posts WHERE id = ?").bind(postId).run();

        return new Response(JSON.stringify({ success: true }), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Unknown error";
      console.error('Error:', e);
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
  },
};
