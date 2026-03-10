/**
 * Cloudflare Workers API for Blog
 * D1 데이터베이스를 사용하여 포스트를 관리합니다.
 */

export interface Env {
  DB: D1Database;
  ALLOW_LOCAL_AUTH?: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

// 허용할 오리진
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:8787",
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) 
    ? origin 
    : ALLOWED_ORIGINS[0] || "*";
  
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
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

      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Unknown error";
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
  },
};
