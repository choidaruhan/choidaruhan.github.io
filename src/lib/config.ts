/**
 * API base URL configuration for different environments
 * Supports local development, Tunnel, and production (GitHub Pages + Workers)
 */

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

/**
 * Environment detection helpers
 */
export const isLocalDevelopment = () => {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname;
  return hostname === "localhost" || hostname === "127.0.0.1";
};

export const isTunnelEnvironment = () => {
  if (typeof window === "undefined") return false;
  return window.location.hostname === "my-blog-local.chl11wq12.workers.dev";
};

export const isProduction = () => {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname;
  return hostname === "choidaruhan.github.io";
};

/**
 * Auth endpoints
 */
export const AUTH_ENDPOINTS = {
  login: `${API_BASE}/auth/login`,
  logout: `${API_BASE}/auth/logout`,
  me: `${API_BASE}/auth/me`,
};

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  posts: `${API_BASE}/api/posts`,
  post: (id: number | string) => `${API_BASE}/api/posts/${id}`,
  search: (query: string) =>
    `${API_BASE}/api/posts?q=${encodeURIComponent(query)}`,
  health: `${API_BASE}/health`,
};

/**
 * Frontend URLs for redirects
 */
export const FRONTEND_URLS = {
  local: "http://localhost:5173",
  tunnel: "https://my-blog-local.chl11wq12.workers.dev",
  production: "https://choidaruhan.github.io",
};

/**
 * Get current frontend URL based on environment
 */
export const getFrontendUrl = () => {
  if (isLocalDevelopment()) return FRONTEND_URLS.local;
  if (isTunnelEnvironment()) return FRONTEND_URLS.tunnel;
  if (isProduction()) return FRONTEND_URLS.production;

  // Fallback to current location
  return `${window.location.protocol}//${window.location.host}`;
};

/**
 * Get redirect URL for auth flows
 */
export const getAuthRedirectUrl = (path = "") => {
  const frontendUrl = getFrontendUrl();
  return `${frontendUrl}${path.startsWith("/") ? path : `/${path}`}`;
};

/**
 * Debug information (development only)
 */
export const debugConfig = () => {
  if (typeof window === "undefined") return {};

  return {
    hostname: window.location.hostname,
    protocol: window.location.protocol,
    href: window.location.href,
    API_BASE,
    environment: {
      isLocal: isLocalDevelopment(),
      isTunnel: isTunnelEnvironment(),
      isProduction: isProduction(),
    },
    endpoints: {
      auth: AUTH_ENDPOINTS,
      api: API_ENDPOINTS,
    },
    frontendUrl: getFrontendUrl(),
  };
};
