// 환경에 따른 API URL 자동 설정
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
window.API_URL = isLocal
  ? 'http://127.0.0.1:8787'
  : 'https://my-blog-worker.chl11wq12.workers.dev';

// Cloudflare는 Supabase와 달리 클라이언트 키가 필요하지 않은 구조로 구현했습니다.
// (Worker에서 DB 및 AI 바인딩을 직접 관리)
