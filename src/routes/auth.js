import { corsHeaders } from '../utils/cors.js';
import { isAuthorized } from '../utils/auth.js';
import { signJwt } from '../utils/jwt.js';

export async function handleAuthRoutes(request, path, env, secret) {
  const method = request.method;

  // 0-1. Authentication Check (GET /auth-check or /auth/me)
  if ((path === '/auth-check' || path === '/auth/me') && method === 'GET') {
    const authorized = await isAuthorized(request, secret);
    return Response.json({ authorized }, { headers: corsHeaders });
  }

  // 0-2. Login Session Generation & Redirect (GET /login)
  if (path === '/login' && method === 'GET') {
    const url = new URL(request.url);
    const jwt = request.headers.get('Cf-Access-Jwt-Assertion');
    const defaultRedirect = 'https://choidaruhan.github.io/';
    const redirectUrl = url.searchParams.get('redirect') || defaultRedirect;

    const host = request.headers.get('Host') || '';
    const isLocal = host.includes('localhost') || host.includes('127.0.0.1') || host.includes(':8787');

    if (jwt || isLocal) {
      try {
        const sessionToken = await signJwt({ sub: 'admin', iat: Math.floor(Date.now() / 1000) }, secret);
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

  return null;
}
