import { verifyJwt } from './jwt.js';

export async function isAuthorized(req, secret) {
  // 1. 프론트엔드에서 Authorization 헤더로 발송한 JWT 검증
  const authHeader = req.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const payload = await verifyJwt(token, secret);
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
}
