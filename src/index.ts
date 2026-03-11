/**
 * Cloudflare Workers API for Blog
 * D1 데이터베이스를 사용하여 포스트를 관리합니다.
 */

export interface Env {
  DB: D1Database;
  ADMIN_SECRET?: string;
  ALLOW_LOCAL_AUTH?: string;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  SESSION_SECRET?: string;
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

// JWT utilities
function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  if (pad) {
    if (pad === 1) throw new Error('Invalid base64url');
    base64 += '='.repeat(4 - pad);
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function signJWT(payload: any, secret: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = await base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const encodedPayload = await base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signingInput));
  const encodedSignature = await base64UrlEncode(signature);
  return `${signingInput}.${encodedSignature}`;
}

async function verifyJWT(token: string, secret: string): Promise<any | null> {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  // Verify signature
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );
  const signature = base64UrlDecode(encodedSignature);
  const isValid = await crypto.subtle.verify(
    'HMAC',
    key,
    signature,
    new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`)
  );
  if (!isValid) return null;
  // Decode payload
  try {
    const payloadBytes = base64UrlDecode(encodedPayload);
    const payload = JSON.parse(new TextDecoder().decode(payloadBytes));
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }
    return payload;
  } catch (e) {
    return null;
  }
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

  const auth = request.headers.get("Authorization");

  // Check for ADMIN_SECRET (simple token)
  const expectedAdmin = env.ADMIN_SECRET ? `Bearer ${env.ADMIN_SECRET}` : null;
  if (auth === expectedAdmin) {
    return true;
  }

  // Check for JWT (GitHub OAuth)
  if (auth && auth.startsWith("Bearer ")) {
    const token = auth.slice(7);
    if (token && env.SESSION_SECRET) {
      const payload = await verifyJWT(token, env.SESSION_SECRET);
      return payload !== null;
    }
  }

  return false;
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
      // OAuth routes
      if (path === "/auth/github" && request.method === "GET") {
        const clientId = env.GITHUB_CLIENT_ID;
        if (!clientId) {
          return new Response(JSON.stringify({ error: "GitHub OAuth not configured" }), { status: 500, headers: corsHeaders });
        }

        const redirectTo = url.searchParams.get("redirect_to") || "/";
        // Validate redirect_to is relative or matches FRONTEND_URL
        let safeRedirect = redirectTo;
        if (redirectTo.startsWith('http')) {
          const frontendUrl = env.FRONTEND_URL;
          if (!frontendUrl || !redirectTo.startsWith(frontendUrl)) {
            safeRedirect = "/";
          }
        }

        // Generate state and store in DB
        const state = crypto.randomUUID();
        await env.DB.prepare("INSERT INTO oauth_states (state, redirect_to) VALUES (?, ?)").bind(state, safeRedirect).run();

        const scope = "read:user,user:email";
        const redirectUri = `${url.origin}/auth/callback`;
        const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`;
        return Response.redirect(githubAuthUrl, 302);
      }

      if (path === "/auth/callback" && request.method === "GET") {
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        if (!code) {
          return new Response(JSON.stringify({ error: "Missing code" }), { status: 400, headers: corsHeaders });
        }

        // Verify state
        let redirectTo = "/";
        if (state) {
          const { results } = await env.DB.prepare("SELECT redirect_to FROM oauth_states WHERE state = ?").bind(state).all<{ redirect_to: string }>();
          if (results.length > 0) {
            redirectTo = results[0].redirect_to;
          }
          // Delete used state
          await env.DB.prepare("DELETE FROM oauth_states WHERE state = ?").bind(state).run();
        }

        const clientId = env.GITHUB_CLIENT_ID;
        const clientSecret = env.GITHUB_CLIENT_SECRET;
        if (!clientId || !clientSecret) {
          return new Response(JSON.stringify({ error: "GitHub OAuth not configured" }), { status: 500, headers: corsHeaders });
        }

        // Exchange code for access token
        const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
          method: "POST",
          headers: { "Accept": "application/json", "Content-Type": "application/json" },
          body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            code
          })
        });
        const tokenData = await tokenRes.json();
        if (tokenData.error) {
          return new Response(JSON.stringify({ error: tokenData.error_description || tokenData.error }), { status: 400, headers: corsHeaders });
        }
        const accessToken = tokenData.access_token;
        if (!accessToken) {
          return new Response(JSON.stringify({ error: "No access token" }), { status: 400, headers: corsHeaders });
        }

        // Get user info
        const userRes = await fetch("https://api.github.com/user", {
          headers: { "Authorization": `token ${accessToken}` }
        });
        const user = await userRes.json();

        // Generate JWT
        const sessionSecret = env.SESSION_SECRET;
        if (!sessionSecret) {
          return new Response(JSON.stringify({ error: "Session secret not configured" }), { status: 500, headers: corsHeaders });
        }

        const now = Math.floor(Date.now() / 1000);
        const payload = {
          sub: String(user.id),
          login: user.login,
          name: user.name,
          avatar: user.avatar_url,
          iat: now,
          exp: now + (60 * 60 * 24 * 30) // 30 days
        };
        const jwt = await signJWT(payload, sessionSecret);

        // Build redirect URL
        let redirectUrl: string;
        if (redirectTo.startsWith('http')) {
          redirectUrl = redirectTo;
        } else {
          const frontendUrl = env.FRONTEND_URL || "";
          const base = frontendUrl.replace(/\/$/, '');
          redirectUrl = `${base}${redirectTo}`;
        }
        // Append token as query param
        const separator = redirectUrl.includes('?') ? '&' : '?';
        redirectUrl = `${redirectUrl}${separator}auth_token=${jwt}`;

        return Response.redirect(redirectUrl, 302);
      }

      if (path === "/auth/me" && request.method === "GET") {
        const auth = request.headers.get("Authorization");
        if (!auth || !auth.startsWith("Bearer ")) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
        }
        const token = auth.slice(7);
        const sessionSecret = env.SESSION_SECRET;
        if (!sessionSecret) {
          return new Response(JSON.stringify({ error: "Server misconfigured" }), { status: 500, headers: corsHeaders });
        }
        const payload = await verifyJWT(token, sessionSecret);
        if (!payload) {
          return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401, headers: corsHeaders });
        }
        return new Response(JSON.stringify({ user: payload }), { headers: { "Content-Type": "application/json", ...corsHeaders } });
      }

      if (path === "/auth/logout" && request.method === "POST") {
        return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json", ...corsHeaders } });
      }

      // API routes require auth for write
      if (path === "/api/posts" && request.method === "GET") {
        const searchQuery = url.searchParams.get("q");

        if (searchQuery) {
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
