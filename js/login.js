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

if (!loginForm) {
  console.error('Fatal Error: #login-form not found in the DOM!');
}


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
    // Supabase에서 반환하는 실제 에러 메시지를 보여주도록 수정
    alert('로그인 실패: ' + error.message + '\n\n(참고: Supabase 설정에서 "Confirm email"이 켜져있어 이메일 인증을 안했거나 비밀번호가 틀렸을 수 있습니다.)');
  } finally {
    loginBtn.disabled = false;
    loginBtn.innerText = '로그인';
  }
});
