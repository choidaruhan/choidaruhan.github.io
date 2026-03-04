import { corsHeaders } from '../utils/cors.js';
import { isAuthorized } from '../utils/auth.js';

export async function handlePostsRoutes(request, path, env, secret) {
  const method = request.method;

  // 1. 글 목록 조회 (GET /posts) - 공개
  if (path === '/posts' && method === 'GET') {
    const { results } = await env.DB.prepare(
      "SELECT id, title, created_at FROM posts ORDER BY created_at DESC"
    ).all();
    return Response.json(results, { headers: corsHeaders });
  }

  // 2. 개별 글 상세 조회 (GET /posts/:id) - 공개
  if (path.startsWith('/posts/') && method === 'GET' && path !== '/posts') {
    const id = path.split('/')[2];
    if (id) {
      const post = await env.DB.prepare(
        "SELECT * FROM posts WHERE id = ?"
      ).bind(id).first();
      if (!post) return new Response("Not Found", { status: 404, headers: corsHeaders });
      return Response.json(post, { headers: corsHeaders });
    }
  }

  // 3. 글 작성/수정 (POST /posts) - 보호됨
  if (path === '/posts' && method === 'POST') {
    if (!(await isAuthorized(request, secret))) {
      return new Response("Unauthorized", { status: 401, headers: corsHeaders });
    }

    const body = await request.json();
    const { id, title, content } = body;

    // DB 저장
    await env.DB.prepare(
      "INSERT OR REPLACE INTO posts (id, title, content, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)"
    ).bind(id, title, content).run();

    return Response.json({ success: true }, { headers: corsHeaders });
  }

  // 4. 글 삭제 (DELETE /posts/:id) - 보호됨
  if (path.startsWith('/posts/') && method === 'DELETE') {
    if (!(await isAuthorized(request, secret))) {
      return new Response("Unauthorized", { status: 401, headers: corsHeaders });
    }

    const id = path.split('/')[2];
    if (id) {
      await env.DB.prepare("DELETE FROM posts WHERE id = ?").bind(id).run();
      return Response.json({ success: true }, { headers: corsHeaders });
    }
  }

  return null;
}
