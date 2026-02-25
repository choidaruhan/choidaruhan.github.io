if (window.SUPABASE_URL.includes('여기에')) {
  alert("config.js 파일에 Supabase 설정을 먼저 완료해주세요!");
  window.location.href = "index.html";
}
const supabase = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

const loginForm = document.getElementById('login-form');
const loginBtn = document.getElementById('login-btn');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  loginBtn.disabled = true;
  loginBtn.innerText = '로그인 중...';

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
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
