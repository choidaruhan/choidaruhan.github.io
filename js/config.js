// 환경에 따른 API URL 자동 설정
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
window.API_URL = isLocal
  ? 'http://127.0.0.1:8787'
  : 'https://my-blog-worker.chl11wq12.workers.dev';


