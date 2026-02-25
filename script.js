const contentDiv = document.getElementById('content');
const loadingDiv = document.getElementById('loading');
const homeLink = document.getElementById('home-link');

// 포스트 목록 사이트 메인에 렌더링
async function loadHome() {
    showLoading();
    try {
        const response = await fetch('posts.json');
        if (!response.ok) throw new Error('Network response was not ok');
        const posts = await response.json();

        // 최신 글이 위로 오도록 정렬 (옵션)
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));

        let html = '<ul class="post-list">';
        posts.forEach(post => {
            html += `
                <li>
                    <a href="#${post.id}" class="post-title">${post.title}</a>
                    <span class="post-date">${post.date}</span>
                </li>
            `;
        });
        html += '</ul>';
        contentDiv.innerHTML = html;
    } catch (error) {
        contentDiv.innerHTML = '<p>포스트 목록을 불러오는 데 실패했습니다.</p>';
        console.error('Error loading home:', error);
    } finally {
        hideLoading();
    }
}

// 개별 마크다운 파일 렌더링
async function loadPost(postId) {
    showLoading();
    try {
        const response = await fetch(`posts/${postId}.md`);
        if (!response.ok) throw new Error('Post not found');
        const markdown = await response.text();

        // YAML 프론트매터(--- 블록) 제거 후 본문만 파싱
        const bodyContent = markdown.replace(/^---\n[\s\S]*?\n---\n/, '');

        // marked.js로 HTML 삽입
        contentDiv.innerHTML = `<div class="markdown-body">${marked.parse(bodyContent)}</div>`;
        window.scrollTo(0, 0);
    } catch (error) {
        contentDiv.innerHTML = '<p>포스트를 불러오는 데 실패했습니다.</p>';
        console.error('Error loading post:', error);
    } finally {
        hideLoading();
    }
}

function showLoading() {
    loadingDiv.classList.remove('hidden');
    contentDiv.innerHTML = '';
}

function hideLoading() {
    loadingDiv.classList.add('hidden');
}

// 홈 링크 클릭 처리
homeLink.addEventListener('click', (e) => {
    e.preventDefault();
    history.pushState("", document.title, window.location.pathname + window.location.search);
    window.location.hash = ''; // 해시 초기화
    loadHome();
});

// URL hash 이벤트(뒤로가기, 직접 접속 등) 처리
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1);
    if (hash) {
        loadPost(hash);
    } else {
        loadHome();
    }
});

// 페이지 초기 진입 시 처리
window.addEventListener('load', () => {
    const hash = window.location.hash.slice(1);
    if (hash) {
        loadPost(hash);
    } else {
        loadHome();
    }
});
