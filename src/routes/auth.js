import { corsHeaders, getCorsHeaders } from '../utils/cors.js';
import { isAuthorized } from '../utils/auth.js';
import { signJwt } from '../utils/jwt.js';
import { AppError, Errors } from '../utils/errors.js';

export async function handleAuthRoutes(request, path, env, secret, corsHeaders) {
  const method = request.method;
  const cors = corsHeaders || getCorsHeaders(request);

  // 1. 인증 상태 확인 (GET /auth/me 또는 /auth-check)
  if ((path === '/auth-check' || path === '/auth/me') && method === 'GET') {
    try {
      const authorized = await isAuthorized(request, secret);
      return Response.json({ 
        authorized,
        timestamp: new Date().toISOString()
      }, { headers: cors });
    } catch (error) {
      console.error('Auth check error:', error);
      throw Errors.internal('Authentication check failed');
    }
  }

  // 2. 로그인 세션 생성 및 리다이렉트 (GET /login)
  if (path === '/login' && method === 'GET') {
    const url = new URL(request.url);
    const jwt = request.headers.get('Cf-Access-Jwt-Assertion');
    
    // 리다이렉트 URL 검증
    const allowedRedirects = [
      'https://choidaruhan.github.io',
      'http://localhost:3000',
      'http://localhost:8787'
    ];
    
    const requestedRedirect = url.searchParams.get('redirect');
    const defaultRedirect = 'https://choidaruhan.github.io/';
    
    // 허용된 리다이렉트 URL인지 검증
    const redirectUrl = allowedRedirects.some(allowed => 
      requestedRedirect?.startsWith(allowed)
    ) ? requestedRedirect : defaultRedirect;

    const host = request.headers.get('Host') || '';
    const isLocal = host.includes('localhost') || 
                    host.includes('127.0.0.1') || 
                    host.includes(':8787');

    if (jwt || isLocal) {
      try {
        const sessionToken = await signJwt(
          { 
            sub: 'admin', 
            iat: Math.floor(Date.now() / 1000),
            type: 'session'
          }, 
          secret
        );
        
        // 안전한 리다이렉트
        const safeRedirect = new URL(redirectUrl);
        safeRedirect.hash = `access_token=${sessionToken}`;
        
        return Response.redirect(safeRedirect.toString(), 302);
      } catch (e) {
        console.error('Session creation error:', e);
        throw Errors.internal('Session creation failed');
      }
    } else {
      // Cloudflare Access가 필요함을 알림
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head><title>Unauthorized</title></head>
        <body>
          <h1>401 - Unauthorized</h1>
          <p>This endpoint requires Cloudflare Access protection.</p>
          <p>Please configure your Cloudflare Access policy to protect <code>/login</code>.</p>
          <hr>
          <p><small>${new Date().toISOString()}</small></p>
        </body>
        </html>
      `, { 
        status: 401, 
        headers: { 
          ...cors, 
          'Content-Type': 'text/html; charset=utf-8'
        } 
      });
    }
  }

  return null;
}
