import { fetchWithAuth } from './api.js';

export async function checkAuth() {
  try {
    const response = await fetchWithAuth(`${window.API_URL}/auth/me`);

    // 응답이 없는 경우 (네트워크 오류 등)
    if (!response) {
      console.warn('Auth check: No response received (network error)');
      showLoggedOutView();
      return;
    }

    if (!response.ok) {
      // status가 undefined일 수 있으므로 안전하게 처리
      const status = response.status || 'unknown';
      console.warn(`Auth check failed with status: ${status}`);
      showLoggedOutView();
      return;
    }

    const data = await response.json();

    const loggedInView = document.getElementById('logged-in-view');
    const loggedOutView = document.getElementById('logged-out-view');
    const adminControls = document.getElementById('admin-controls');

    if (!loggedInView || !loggedOutView) return;

    if (data.authorized) {
      loggedInView.classList.remove('hidden');
      loggedOutView.classList.add('hidden');
      if (adminControls) adminControls.classList.remove('hidden');
    } else {
      showLoggedOutView();
    }
  } catch (error) {
    // 네트워크 오류나 JSON 파싱 오류 등
    console.warn('Auth check failed (non-critical):', error.message || error);
    showLoggedOutView();
  }
}

function showLoggedOutView() {
  const loggedInView = document.getElementById('logged-in-view');
  const loggedOutView = document.getElementById('logged-out-view');
  const adminControls = document.getElementById('admin-controls');

  if (loggedInView) loggedInView.classList.add('hidden');
  if (loggedOutView) loggedOutView.classList.remove('hidden');
  if (adminControls) adminControls.classList.add('hidden');

  // 로그인 링크 업데이트
  const loginLink = document.getElementById('login-link');
  if (loginLink) {
    loginLink.href = `${window.API_URL}/login?redirect=${encodeURIComponent(window.location.origin + window.location.pathname)}`;
  }
}

export function logout() {
  if (confirm('로그아웃 하시겠습니까?')) {
    localStorage.removeItem('cf_access_token');
    alert('로그아웃 되었습니다.');
    window.location.reload();
  }
}

// Ensure logout is available globally for inline HTML onclick handlers
window.logout = logout;
