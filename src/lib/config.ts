export const API_BASE = (() => {
  if (typeof window === 'undefined') return '';
  return window.location.hostname === 'localhost'
    ? 'http://localhost:8787'
    : 'https://my-blog-worker.chl11wq12.workers.dev';
})();
