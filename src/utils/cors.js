// 허용된 출처 목록
const allowedOrigins = [
  'https://choidaruhan.github.io',
  'http://localhost:3000',
  'http://localhost:8787',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:8787'
];

// 요청의 Origin에 따라 동적으로 CORS 헤더 생성
export function getCorsHeaders(request) {
  const origin = request.headers.get('Origin');
  const allowOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

// 하위호환성을 위한 기본 헤더 (특정 출처 기반)
export const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://choidaruhan.github.io',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

export function handleOptions(request) {
  if (request.method === 'OPTIONS') {
    const headers = getCorsHeaders(request);
    return new Response(null, { headers });
  }
  return null;
}
