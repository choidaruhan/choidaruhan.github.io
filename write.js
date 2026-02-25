// Supabase 초기화
if (window.SUPABASE_URL.includes('여기에')) {
  alert("config.js 파일에 Supabase 설정을 먼저 완료해주세요!");
  window.location.href = "index.html";
}
const supabase = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

// 세션 확인 (로그인 안된 유저 차단)
document.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    alert('글쓰기 권한이 없습니다. 관리자 로그인이 필요합니다.');
    window.location.href = 'login.html';
  }
});

const writeForm = document.getElementById('write-form');
const submitBtn = document.getElementById('submit-btn');

writeForm.addEventListener('submit', async (e) => {
  e.preventDefault(); // 기본 새로고침 방지

  const title = document.getElementById('post-title').value;
  const content = document.getElementById('post-content').value;

  // 버튼 상태 변경
  submitBtn.disabled = true;
  submitBtn.innerText = '저장 중...';

  try {
    const { data, error } = await supabase
      .from('posts')
      .insert([
        { title: title, content: content } // uuid와 created_at은 DB에서 자동 생성됨
      ]);

    if (error) {
      throw error;
    }

    alert('글이 성공적으로 등록되었습니다!');
    window.location.href = 'index.html'; // 홈으로 이동

  } catch (error) {
    console.error('Error inserting post:', error.message);
    alert('글 등록에 실패했습니다. (콘솔 혹은 RLS 정책을 확인하세요)');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerText = '작성 완료';
  }
});
