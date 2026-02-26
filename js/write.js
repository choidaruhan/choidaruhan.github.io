// Supabase 초기화
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

// 세션 확인 (로그인 안된 유저 차단)
document.addEventListener('DOMContentLoaded', async () => {
  if (!supabaseClient) return;
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    alert('글쓰기 권한이 없습니다. 관리자 로그인이 필요합니다.');
    window.location.href = 'login.html';
  }
});

const writeForm = document.getElementById('write-form');
const submitBtn = document.getElementById('submit-btn');
const pageTitle = document.getElementById('page-title'); // html에 id 추가 필요
const titleInput = document.getElementById('post-title');
const contentInput = document.getElementById('post-content');

// URL 파라미터 확인 (수정 모드인지 판별)
const urlParams = new URLSearchParams(window.location.search);
const editPostId = urlParams.get('id');

// 수정 모드일 경우 기존 데이터 불러오기
document.addEventListener('DOMContentLoaded', async () => {
  if (!supabaseClient) return;
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    alert('글쓰기 권한이 없습니다. 관리자 로그인이 필요합니다.');
    window.location.href = 'login.html';
    return;
  }

  if (editPostId) {
    if (pageTitle) pageTitle.innerText = '글 수정';
    submitBtn.innerText = '수정 완료';

    try {
      const { data: post, error } = await supabaseClient
        .from('posts')
        .select('*')
        .eq('id', editPostId)
        .single();

      if (error) throw error;
      if (post) {
        titleInput.value = post.title;
        contentInput.value = post.content;
      }
    } catch (err) {
      console.error('Error fetching post for edit:', err);
      alert('기존 글을 불러오는 데 실패했습니다.');
    }
  }
});

writeForm.addEventListener('submit', async (e) => {
  e.preventDefault(); // 기본 새로고침 방지

  const title = document.getElementById('post-title').value;
  const content = document.getElementById('post-content').value;

  // 버튼 상태 변경
  submitBtn.disabled = true;
  submitBtn.innerText = '저장 중...';

  try {
    if (editPostId) {
      // 글 수정 모드 (Update)
      const { error } = await supabaseClient
        .from('posts')
        .update({ title, content })
        .eq('id', editPostId);

      if (error) throw error;

      // 글 수정 후 캐시 무효화
      sessionStorage.removeItem('sidebar_posts');
      sessionStorage.removeItem('post_' + editPostId);

      alert('글이 성공적으로 수정되었습니다!');
      window.location.href = `index.html#${editPostId}`; // 수정한 글로 이동
    } else {
      // 새 글 작성 모드 (Insert)
      const { error } = await supabaseClient
        .from('posts')
        .insert([{ title, content }]);

      if (error) throw error;

      // 새 글 작성 후 사이드바 캐시 무효화
      sessionStorage.removeItem('sidebar_posts');

      alert('글이 성공적으로 등록되었습니다!');
      window.location.href = 'index.html'; // 홈으로 이동
    }

  } catch (error) {
    console.error('Error inserting post:', error.message);
    alert('글 등록에 실패했습니다. (콘솔 혹은 RLS 정책을 확인하세요)');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerText = '작성 완료';
  }
});
