const ALLOWED_ORIGINS = [
  "http://localhost:5173", // 로컬 개발
  "http://localhost:8787", // Workers 개발 서버
  "https://choidaruhan.github.io", // GitHub Pages
  "https://my-blog-local.chl11wq12.workers.dev", // Tunnel 프론트엔드
];

export function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin =
    origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, Cf-Access-Jwt-Assertion",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Expose-Headers": "Content-Type, Authorization",
    Vary: "Origin",
  };
}
