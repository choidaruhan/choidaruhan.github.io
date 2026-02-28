export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS Headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*', // 필요 시 choidaruhan.github.io로 제한 가능
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Simplified JWT Implementation for Cloudflare Workers
    const JWT_SECRET = env.JWT_SECRET || 'your-default-secret-key-for-local';

    async function signJwt(payload) {
      const header = { alg: 'HS256', typ: 'JWT' };
      const encoder = new TextEncoder();
      const stringifiedHeader = JSON.stringify(header);
      const stringifiedPayload = JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) }); // 24h expiry

      const base64Header = btoa(stringifiedHeader).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
      const base64Payload = btoa(stringifiedPayload).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

      const data = encoder.encode(`${base64Header}.${base64Payload}`);
      const key = await crypto.subtle.importKey(
        'raw', encoder.encode(JWT_SECRET),
        { name: 'HMAC', hash: 'SHA-256' },
        false, ['sign']
      );
      const signature = await crypto.subtle.sign('HMAC', key, data);
      const base64Signature = btoa(String.fromCharCode(...new Uint8Array(signature)))
        .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

      return `${base64Header}.${base64Payload}.${base64Signature}`;
    }

    async function verifyJwt(token) {
      if (!token) return null;
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const [header, payload, signature] = parts;
      const encoder = new TextEncoder();
      const data = encoder.encode(`${header}.${payload}`);

      const key = await crypto.subtle.importKey(
        'raw', encoder.encode(JWT_SECRET),
        { name: 'HMAC', hash: 'SHA-256' },
        false, ['verify']
      );

      const sigUint8 = new Uint8Array(atob(signature.replace(/-/g, '+').replace(/_/g, '/')).split('').map(c => c.charCodeAt(0)));
      const isValid = await crypto.subtle.verify('HMAC', key, sigUint8, data);

      if (!isValid) return null;

      const decodedPayload = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      if (decodedPayload.exp && Date.now() / 1000 > decodedPayload.exp) return null;

      return decodedPayload;
    }

    // Authentication Helper
    const isAuthorized = async (req) => {
      // 1. 프론트엔드에서 Authorization 헤더로 발송한 JWT 검증
      const authHeader = req.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const payload = await verifyJwt(token);
        if (payload) return true;
      }

      // 2. Cloudflare Access가 활성화되어 전달된 헤더 검증 (직접 접근 시)
      const jwt = req.headers.get('Cf-Access-Jwt-Assertion');

      // 로컬 개발 환경(wrangler dev)에서는 편의상 허용
      const host = req.headers.get('Host') || '';
      if (!jwt && !authHeader && (host.includes('localhost') || host.includes('127.0.0.1') || host.includes(':8787'))) {
        return true;
      }

      return !!jwt;
    };

    // 0-1. Authentication Check (GET /auth-check or /auth/me)
    if ((path === '/auth-check' || path === '/auth/me') && method === 'GET') {
      const authorized = await isAuthorized(request);
      return Response.json({ authorized }, { headers: corsHeaders });
    }

    // 0-2. Login Session Generation & Redirect (GET /login)
    if (path === '/login' && method === 'GET') {
      const jwt = request.headers.get('Cf-Access-Jwt-Assertion');
      const defaultRedirect = 'https://choidaruhan.github.io/';
      const redirectUrl = url.searchParams.get('redirect') || defaultRedirect;

      const host = request.headers.get('Host') || '';
      const isLocal = host.includes('localhost') || host.includes('127.0.0.1') || host.includes(':8787');

      if (jwt || isLocal) {
        try {
          // Cloudflare Access JWT를 파싱하여 사용자 정보 추출 (필요한 경우)
          // 여기서는 단순히 성공 인증 시 자체 JWT를 발급함
          const sessionToken = await signJwt({ sub: 'admin', iat: Math.floor(Date.now() / 1000) });

          // 프론트엔드로 토큰을 URL 해시에 담아 리다이렉트
          return Response.redirect(`${redirectUrl}#access_token=${sessionToken}`, 302);
        } catch (e) {
          return new Response("Session creation failed", { status: 500, headers: corsHeaders });
        }
      } else {
        return new Response(`
          <h1>Unauthorized</h1>
          <p>This endpoint requires Cloudflare Access protection. Please configure your Cloudflare Access policy to protect <code>/login</code>.</p>
        `, { status: 401, headers: { ...corsHeaders, 'Content-Type': 'text/html' } });
      }
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
        if (!(await isAuthorized(request))) {
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
        if (!(await isAuthorized(request))) {
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
