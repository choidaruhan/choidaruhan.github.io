import { getCorsHeaders, handleOptions } from './utils/cors.js';
import { createErrorResponse, AppError, Errors } from './utils/errors.js';
import { handleAuthRoutes } from './routes/auth.js';
import { handlePostsRoutes } from './routes/posts.js';
import { handleSearchRoutes } from './routes/search.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const corsHeaders = getCorsHeaders(request);

    // OPTIONS 요청 처리 (CORS preflight)
    const optionsResponse = handleOptions(request);
    if (optionsResponse) return optionsResponse;

    // 환경변수 검증
    const JWT_SECRET = env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error('JWT_SECRET is not configured');
      return createErrorResponse(
        new AppError('Server misconfigured', 500),
        env.NODE_ENV === 'development'
      );
    }

    try {
      // 라우트 순차 처리
      let response = await handleAuthRoutes(request, path, env, JWT_SECRET, corsHeaders);
      if (response) return response;

      response = await handlePostsRoutes(request, path, env, JWT_SECRET, corsHeaders);
      if (response) return response;

      response = await handleSearchRoutes(request, path, env, corsHeaders);
      if (response) return response;

      // 404 처리
      throw Errors.notFound('Resource not found');
      
    } catch (error) {
      console.error('Request handling error:', error);
      
      // 에러 응답 생성
      const isDevelopment = env.NODE_ENV === 'development';
      const errorResponse = createErrorResponse(error, isDevelopment);
      
      // CORS 헤더 추가
      const responseHeaders = {
        ...Object.fromEntries(errorResponse.headers),
        ...corsHeaders
      };
      
      return new Response(errorResponse.body, {
        status: errorResponse.status,
        headers: responseHeaders
      });
    }
  }
};
