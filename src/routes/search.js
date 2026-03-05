import { corsHeaders, getCorsHeaders } from '../utils/cors.js';
import { AppError, Errors } from '../utils/errors.js';

/**
 * 검색어 입력값 검증 및 sanitize
 * SQL LIKE 메타문자 escape 및 길이 제한
 */
function sanitizeSearchQuery(query) {
  if (!query || typeof query !== 'string') {
    throw Errors.badRequest('Search query is required');
  }
  
  const trimmed = query.trim();
  
  if (trimmed.length === 0) {
    throw Errors.badRequest('Search query cannot be empty');
  }
  
  if (trimmed.length > 100) {
    throw Errors.badRequest('Search query too long (max 100 characters)');
  }
  
  // SQL LIKE 메타문자 escape (% 와 _)
  // SQLite에서 %와 _는 와일드카드이므로 \로 escape
  const sanitized = trimmed
    .replace(/\\/g, '\\\\')  // 먼저 백슬래시 escape
    .replace(/%/g, '\\%')     // % escape
    .replace(/_/g, '\\_');    // _ escape
  
  return sanitized;
}

/**
 * 검색 결과 후처리
 * 민감한 정보 필터링
 */
function sanitizeSearchResults(results) {
  if (!Array.isArray(results)) return [];
  
  return results.map(post => ({
    id: post.id,
    title: post.title,
    created_at: post.created_at
    // content는 검색 결과에서 제외 (민감 정보)
  }));
}

export async function handleSearchRoutes(request, path, env, corsHeaders) {
  const method = request.method;
  const url = new URL(request.url);
  const cors = corsHeaders || getCorsHeaders(request);

  // 단순 검색 (SQL LIKE)
  if (path === '/search' && method === 'GET') {
    const rawQuery = url.searchParams.get('q');
    
    try {
      const query = sanitizeSearchQuery(rawQuery);
      const searchPattern = `%${query}%`;
      
      console.log(`Search request: "${rawQuery}" -> sanitized: "${query}"`);

      const { results: sqlPosts } = await env.DB.prepare(
        `SELECT id, title, created_at 
         FROM posts 
         WHERE title LIKE ? ESCAPE '\\' 
            OR content LIKE ? ESCAPE '\\' 
         ORDER BY created_at DESC 
         LIMIT 20`
      ).bind(searchPattern, searchPattern).all();

      const sanitizedResults = sanitizeSearchResults(sqlPosts);
      
      console.log(`Search returned ${sanitizedResults.length} results`);
      
      return Response.json(sanitizedResults, {
        headers: {
          ...cors,
          'X-Search-Method': 'sql-like',
          'X-Total-Results': sanitizedResults.length.toString()
        }
      });
      
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Search error:', error);
      throw Errors.internal('Search failed');
    }
  }

  return null;
}
