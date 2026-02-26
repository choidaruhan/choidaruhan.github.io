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

// 전역 변수 및 DOM 요소
const writeForm = document.getElementById('write-form');
const submitBtn = document.getElementById('submit-btn');
const pageTitle = document.getElementById('page-title');
const titleInput = document.getElementById('post-title');
const contentInput = document.getElementById('post-content');

// URL 파라미터 확인 (수정 모드인지 판별)
function getEditPostId() {
  const params = new URLSearchParams(window.location.search);
  let id = params.get('id');

  // 만약 쿼리 파라미터에 없으면 해시(#)에서 찾아봄 (리다이렉트 대비)
  if (!id && window.location.hash) {
    id = window.location.hash.slice(1);
  }
  return id;
}

const editPostId = getEditPostId();

// 초기화 함수
async function init() {
  if (!supabaseClient) return;

  // 1. 세션 확인
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    alert('글쓰기 권한이 없습니다. 로그인이 필요합니다.');
    window.location.href = 'login.html';
    return;
  }

  // 2. 수정 모드일 경우 기존 데이터 불러오기
  if (editPostId) {
    console.log('수정 모드 진입: Post ID =', editPostId);
    if (pageTitle) pageTitle.innerText = '글 수정하기';
    if (submitBtn) submitBtn.innerText = '수정 완료';
    document.title = '글 수정 - Simple Blog';

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
      } else {
        alert('해당 글을 찾을 수 없습니다.');
        window.location.href = 'index.html';
      }
    } catch (err) {
      console.error('Error fetching post for edit:', err);
      alert('기존 글을 불러오는 데 실패했습니다.');
    }
  }
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', init);

// 폼 제출 핸들러
writeForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = titleInput.value;
  const content = contentInput.value;

  // 버튼 상태 변경
  submitBtn.disabled = true;
  const originalBtnText = submitBtn.innerText;
  submitBtn.innerText = '저장 중...';

  try {
    if (editPostId) {
      // 글 수정 모드 (Update)
      const { error } = await supabaseClient
        .from('posts')
        .update({ title, content })
        .eq('id', editPostId);

      if (error) throw error;

      // 캐시 무효화
      sessionStorage.removeItem('sidebar_posts');
      sessionStorage.removeItem('post_' + editPostId);

      alert('글이 성공적으로 수정되었습니다!');
      window.location.href = `index.html#${editPostId}`;
    } else {
      // 새 글 작성 모드 (Insert)
      const { error } = await supabaseClient
        .from('posts')
        .insert([{ title, content }]);

      if (error) throw error;

      sessionStorage.removeItem('sidebar_posts');

      alert('글이 성공적으로 등록되었습니다!');
      window.location.href = 'index.html';
    }

  } catch (error) {
    console.error('Error saving post:', error);
    alert(`저장에 실패했습니다: ${error.message || '알 수 없는 에러'}`);
    submitBtn.disabled = false;
    submitBtn.innerText = originalBtnText;
  }
});
