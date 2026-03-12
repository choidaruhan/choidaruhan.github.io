// 환경에 따라 다른 API URL 사용
export const API_BASE = window.location.hostname === "localhost"
  ? "http://localhost:8787"
  : "https://my-blog-worker.chl11wq12.workers.dev";
