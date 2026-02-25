if (window.SUPABASE_URL.includes('여기에') || !window.SUPABASE_URL.startsWith('http')) {
  alert("config.js 파일에 올바른 Supabase URL (https://...)과 Anon Key를 입력해주세요!");
  window.location.href = "index.html";
}

let supabaseClient = null;
try {
  supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
} catch (e) {
  console.error("Supabase 초기화 불가", e);
}

const loginForm = document.getElementById('login-form');
const loginBtn = document.getElementById('login-btn');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!supabaseClient) return alert('Supabase 설정이 잘못되어 로그인할 수 없습니다.');

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  loginBtn.disabled = true;
  loginBtn.innerText = '로그인 중...';

  try {
    const { error } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) throw error;

    alert('로그인 성공!');
    window.location.href = 'index.html'; // 로그인 성공 시 홈으로
  } catch (error) {
    console.error('Login error:', error.message);
    alert('로그인 실패: 이메일이나 비밀번호를 확인해주세요.');
  } finally {
    loginBtn.disabled = false;
    loginBtn.innerText = '로그인';
  }
});
