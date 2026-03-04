import { fetchWithAuth } from './api.js';

export async function checkAuth() {
  try {
    const response = await fetchWithAuth(`${window.API_URL}/auth/me`);
    if (!response.ok) {
      throw new Error(`Auth API error: ${response.status}`);
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
      loggedInView.classList.add('hidden');
      loggedOutView.classList.remove('hidden');
      if (adminControls) adminControls.classList.add('hidden');

      const loginLink = document.getElementById('login-link');
      if (loginLink) {
        loginLink.href = `${window.API_URL}/login?redirect=${encodeURIComponent(window.location.origin + window.location.pathname)}`;
      }
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    const loggedOutView = document.getElementById('logged-out-view');
    if (loggedOutView) {
      loggedOutView.classList.remove('hidden');
    }
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
