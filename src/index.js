export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS Headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Authentication Helper
    const isAuthorized = (req) => {
      // Cloudflare Access가 활성화되면 이 헤더에 JWT가 포함됩니다.
      const jwt = req.headers.get('Cf-Access-Jwt-Assertion');

      // 로컬 개발 환경(localhost)에서는 헤더가 없어도 허용합니다.
      const origin = req.headers.get('Origin') || '';
      if (!jwt && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
        return true;
      }

      return !!jwt;
    };

    // 0. Authentication Check (GET /auth-check)
    if (path === '/auth-check' && method === 'GET') {
      return Response.json({ authorized: isAuthorized(request) }, { headers: corsHeaders });
    }

    try {
      // 1. 글 목록 조회 (GET /posts) - 공개
      if (path === '/posts' && method === 'GET') {
        const { results } = await env.DB.prepare(
          "SELECT id, title, created_at FROM posts ORDER BY created_at DESC"
        ).all();
        return Response.json(results, { headers: corsHeaders });
      }

      // 2. 개별 글 상세 조회 (GET /posts/:id) - 공개
      if (path.startsWith('/posts/') && method === 'GET') {
        const id = path.split('/')[2];
        const post = await env.DB.prepare(
          "SELECT * FROM posts WHERE id = ?"
        ).bind(id).first();
        if (!post) return new Response("Not Found", { status: 404, headers: corsHeaders });
        return Response.json(post, { headers: corsHeaders });
      }

      // 3. 글 작성/수정 (POST /posts) - 보호됨
      if (path === '/posts' && method === 'POST') {
        if (!isAuthorized(request)) {
          return new Response("Unauthorized", { status: 401, headers: corsHeaders });
        }

        const body = await request.json();
        const { id, title, content } = body;

        // DB 저장
        await env.DB.prepare(
          "INSERT OR REPLACE INTO posts (id, title, content, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)"
        ).bind(id, title, content).run();

        // 벡터 생성 (Cloudflare AI)
        let values = [];
        try {
          const embeddingResponse = await env.AI.run('@cf/baai/bge-small-en-v1.5', {
            text: [title, content].join(' ')
          });
          values = embeddingResponse.data[0];
        } catch (aiError) {
          console.error("AI embedding generation failed:", aiError);
          // AI 실패 시 빈 벡터를 전달하거나 기본 처리를 합니다.
        }

        // Vectorize 인덱스 업데이트
        if (values && values.length > 0) {
          try {
            await env.VECTOR_INDEX.upsert([
              {
                id: id,
                values: values,
                metadata: { title }
              }
            ]);
          } catch (vError) {
            console.error("Vectorize upsert failed (Expected in local dev):", vError);
          }
        }

        return Response.json({ success: true }, { headers: corsHeaders });
      }

      // 4. 글 삭제 (DELETE /posts/:id) - 보호됨
      if (path.startsWith('/posts/') && method === 'DELETE') {
        if (!isAuthorized(request)) {
          return new Response("Unauthorized", { status: 401, headers: corsHeaders });
        }

        const id = path.split('/')[2];
        await env.DB.prepare("DELETE FROM posts WHERE id = ?").bind(id).run();

        try {
          await env.VECTOR_INDEX.deleteByIds([id]);
        } catch (vError) {
          console.error("Vectorize delete failed (Expected in local dev):", vError);
          // 로컬 개발 환경에서는 Vectorize가 지원되지 않으므로 에러를 무시하고 진행합니다.
        }

        return Response.json({ success: true }, { headers: corsHeaders });
      }

      // 5. 벡터 검색 (GET /search?q=...)
      if (path === '/search' && method === 'GET') {
        const query = url.searchParams.get('q');
        if (!query) return new Response("Missing query", { status: 400, headers: corsHeaders });

        // 검색어 벡터화
        const queryEmbedding = await env.AI.run('@cf/baai/bge-small-en-v1.5', {
          text: query
        });
        const vector = queryEmbedding.data[0];

        // Vectorize 검색
        const matches = await env.VECTOR_INDEX.query(vector, {
          topK: 10,
          returnValues: false,
          returnMetadata: true
        });

        if (matches.matches.length === 0) {
          return Response.json([], { headers: corsHeaders });
        }

        // D1에서 실제 데이터와 매칭 (IN 절을 사용하여 성능 최적화)
        const ids = matches.matches.map(m => m.id);
        const placeholders = ids.map(() => '?').join(',');
        const { results: posts } = await env.DB.prepare(
          `SELECT id, title, created_at FROM posts WHERE id IN (${placeholders})`
        ).bind(...ids).all();

        // Vectorize 스코어와 병합
        const results = posts.map(post => {
          const match = matches.matches.find(m => m.id === post.id);
          return { ...post, score: match ? match.score : 0 };
        }).sort((a, b) => b.score - a.score);

        return Response.json(results, { headers: corsHeaders });
      }

      return new Response("Not Found", { status: 404, headers: corsHeaders });
    } catch (err) {
      console.error(err);
      return new Response("Internal Server Error", { status: 500, headers: corsHeaders });
    }
  }
}
