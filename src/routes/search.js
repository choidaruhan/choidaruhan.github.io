import { corsHeaders } from '../utils/cors.js';

export async function handleSearchRoutes(request, path, env) {
  const method = request.method;
  const url = new URL(request.url);

  // 5. 단순 검색 (SQL LIKE)
  if (path === '/search' && method === 'GET') {
    const query = url.searchParams.get('q');
    if (!query) return new Response("Missing query", { status: 400, headers: corsHeaders });

    console.log(`Simple SQL search request received for query: "${query}"`);

    try {
      const sqlQuery = `%${query}%`;
      // 검색어를 제목과 내용에서 부분 일치 검사. LIMIT를 20으로 늘림.
      const { results: sqlPosts } = await env.DB.prepare(
        "SELECT id, title, created_at FROM posts WHERE title LIKE ? OR content LIKE ? ORDER BY created_at DESC LIMIT 20"
      ).bind(sqlQuery, sqlQuery).all();

      console.log(`SQL search returned ${sqlPosts.length} results`);
      return Response.json(sqlPosts, {
        headers: {
          ...corsHeaders,
          'X-Search-Method': 'sql-only'
        }
      });
    } catch (sError) {
      console.error("SQL search failed:", sError);
      return new Response("Search Failed", { status: 500, headers: corsHeaders });
    }
  }

  return null;
}
