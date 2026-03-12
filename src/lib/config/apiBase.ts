export const API_BASE = (() => {
  if (typeof window === "undefined") {
    // Server-side rendering or build time
    return "";
  }

  const hostname = window.location.hostname;
  const protocol = window.location.protocol;

  // 1. Tunnel environment (frontend via Tunnel, backend via production Workers for GitHub OAuth)
  if (hostname === "my-blog-local.chl11wq12.workers.dev") {
    // Tunnel: 프론트엔드는 my-blog-local (Tunnel), 백엔드는 production Workers
    // GitHub OAuth 테스트를 위해 production Workers 사용 (Cloudflare Access 보호)
    return "https://my-blog-worker.chl11wq12.workers.dev";
  }

  // 2. Local development (localhost)
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    // Local dev: 프론트엔드 localhost:5173, 백엔드 localhost:8787
    // vite.config.ts proxy 설정으로 /api, /auth 요청이 localhost:8787로 전달됨
    return "http://localhost:8787";
  }

  // 3. GitHub Pages production (choidaruhan.github.io)
  if (hostname === "choidaruhan.github.io") {
    // Production: 프론트엔드 GitHub Pages, 백엔드 Cloudflare Workers
    return "https://my-blog-worker.chl11wq12.workers.dev";
  }

  // 4. Fallback: 현재 도메인 사용 (개발/테스트용)
  return `${protocol}//${hostname}`;
})();
