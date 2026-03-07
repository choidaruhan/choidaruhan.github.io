import { fetchWithAuth } from './api.js';

/**
 * 인증 상태를 확인하고 { authorized: boolean, data?: any } 객체를 반환합니다.
 * 네트워크 오류나 인증 실패 시에도 예외를 던지지 않고 authorized: false를 반환합니다.
 */
export async function verifyAuthentication() {
  try {
    const data = await fetchWithAuth(`${window.API_URL}/auth/me`);

    // 응답이 없는 경우 (네트워크 오류 등)
    if (!data) {
      console.warn('Auth check: No data received');
      return { authorized: false, error: 'No data' };
    }

    // fetchWithAuth가 성공했다면 응답이 ok인 것이며, 
    // 반환된 data 객체의 authorized 필드를 확인합니다.
    return { authorized: !!data.authorized, data };
  } catch (error) {
    // ApiError 또는 일반적인 오류 처리
    console.warn('Auth check failed (non-critical):', error.message || error);
    return { authorized: false, error: error.message || 'Unknown error' };
  }
}

export async function checkAuth() {
  const { authorized, data } = await verifyAuthentication();

  const loggedInView = document.getElementById('logged-in-view');
  const loggedOutView = document.getElementById('logged-out-view');
  const adminControls = document.getElementById('admin-controls');

  if (!loggedInView || !loggedOutView) return;

  if (authorized) {
    loggedInView.classList.remove('hidden');
    loggedOutView.classList.add('hidden');
    if (adminControls) adminControls.classList.remove('hidden');
  } else {
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

  // 로그인 링크 업데이트: 로그인 후 현재 페이지로 돌아옴
  const loginLink = document.getElementById('login-link');
  if (loginLink) {
    const currentHash = window.location.hash ? window.location.hash : '';
    const redirectUrl = `${window.API_URL}/login?redirect=${encodeURIComponent(window.location.origin + window.location.pathname + currentHash)}`;
    loginLink.href = redirectUrl;
    console.log('로그인 링크 업데이트:', redirectUrl);
  } else {
    console.warn('login-link 요소를 찾을 수 없음');
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
