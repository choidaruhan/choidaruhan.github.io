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
  if (!id && window.location.hash) {
    id = window.location.hash.slice(1);
  }
  return id;
}

const editPostId = getEditPostId();

// 초기화 함수
async function init() {
  // 수정 모드일 경우 기존 데이터 불러오기
  if (editPostId) {
    console.log('수정 모드 진입: Post ID =', editPostId);
    if (pageTitle) pageTitle.innerText = '글 수정하기';
    if (submitBtn) submitBtn.innerText = '수정 완료';
    document.title = '글 수정 - Simple Blog';

    try {
      const response = await fetch(`${window.API_URL}/posts/${editPostId}`);
      if (!response.ok) throw new Error('Failed to fetch post');
      const post = await response.json();

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
  const id = editPostId || crypto.randomUUID(); // 새 글이면 UUID 생성

  // 버튼 상태 변경
  submitBtn.disabled = true;
  const originalBtnText = submitBtn.innerText;
  submitBtn.innerText = '저장 중...';

  try {
    const response = await fetch(`${window.API_URL}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, title, content })
    });

    if (!response.ok) throw new Error('Save failed');

    alert(editPostId ? '글이 성공적으로 수정되었습니다!' : '글이 성공적으로 등록되었습니다!');
    window.location.href = editPostId ? `index.html#${editPostId}` : 'index.html';

  } catch (error) {
    console.error('Error saving post:', error);
    alert(`저장에 실패했습니다: ${error.message || '알 수 없는 에러'}`);
    submitBtn.disabled = false;
    submitBtn.innerText = originalBtnText;
  }
});
