let allPosts = []; // 모든 글 목록을 저장할 변수

// API 호출 시 인증 토큰을 자동으로 포함하는 유틸리티 함수
async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('cf_access_token');
    const headers = { ...options.headers };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return fetch(url, { ...options, headers });
}

async function checkAuth() {
    try {
        const response = await fetchWithAuth(`${window.API_URL}/auth/me`);

        // HTTP 에러 처리 (404 등)
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

            // 로그인 링크의 대상을 API의 /login 라우트로 변경합니다.
            const loginLink = document.getElementById('login-link');
            if (loginLink) {
                loginLink.href = `${window.API_URL}/login?redirect=${encodeURIComponent(window.location.origin + window.location.pathname)}`;
            }
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        // 에러 발생 시(서버 점검 등) 기본적으로 로그인 화면을 보여줍니다.
        const loggedOutView = document.getElementById('logged-out-view');
        if (loggedOutView) {
            loggedOutView.classList.remove('hidden');
        }
    }
}

// 로그아웃 처리는 토큰을 삭제하고 UI를 새로고침합니다.
window.logout = function () {
    if (confirm('로그아웃 하시겠습니까?')) {
        localStorage.removeItem('cf_access_token');
        alert('로그아웃 되었습니다.');
        window.location.reload();
    }
}

const loadingDiv = document.getElementById('loading');
const homeLink = document.getElementById('home-link');
const sidebarToggleBtn = document.getElementById('sidebar-toggle');
const sidebar = document.getElementById('sidebar');

if (sidebarToggleBtn && sidebar) {
    sidebarToggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('show');
    });

    // 모바일 등에서 메뉴 바깥 영역 클릭 시 사이드바 닫기
    document.addEventListener('click', (e) => {
        if (sidebar.classList.contains('show') && !sidebar.contains(e.target) && !sidebarToggleBtn.contains(e.target)) {
            sidebar.classList.remove('show');
        }
    });

    // 사이드바 내의 링크 클릭 시 사이드바 닫기
    sidebar.addEventListener('click', (e) => {
        // 클릭한 요소가 a 태그이거나 a 태그의 자식인 경우
        if (e.target.closest('a')) {
            sidebar.classList.remove('show');
        }
    });
}

async function loadSidebarPosts() {
    const sidebarListDiv = document.getElementById('sidebar-post-list');
    if (!sidebarListDiv) return;

    try {
        const response = await fetch(`${window.API_URL}/posts`);
        if (!response.ok) throw new Error('Failed to fetch posts');

        allPosts = await response.json();
        renderSidebarPosts(allPosts);
        setupSearch();
    } catch (error) {
        sidebarListDiv.innerHTML = '<p style="font-size: 0.9rem; color: red;">목록을 불러오지 못했습니다.</p>';
        console.error('Error loading sidebar:', error);
    }
}

function renderSidebarPosts(posts) {
    const sidebarListDiv = document.getElementById('sidebar-post-list');
    if (!sidebarListDiv) return;

    if (!posts || posts.length === 0) {
        sidebarListDiv.innerHTML = '<p style="font-size: 0.9rem; color: #7f8c8d;">게시글이 없습니다.</p>';
        return;
    }

    let html = '<ul class="post-list">';
    posts.forEach(post => {
        const dateStr = new Date(post.created_at).toLocaleDateString('ko-KR');
        html += `
            <li>
                <a href="#${post.id}" class="post-title">${post.title}</a>
                <span class="post-date">${dateStr}</span>
            </li>
        `;
    });
    html += '</ul>';
    sidebarListDiv.innerHTML = html;
}

function setupSearch() {
    const searchInput = document.getElementById('post-search');
    if (!searchInput) return;

    let debounceTimer;
    searchInput.oninput = (e) => {
        clearTimeout(debounceTimer);
        const query = e.target.value.trim();

        if (!query) {
            renderSidebarPosts(allPosts);
            return;
        }

        // 실시간 벡터 검색 (디바운싱 적용)
        debounceTimer = setTimeout(async () => {
            try {
                const response = await fetch(`${window.API_URL}/search?q=${encodeURIComponent(query)}`);
                if (!response.ok) throw new Error('Search failed');
                const results = await response.json();
                renderSidebarPosts(results);
            } catch (err) {
                console.error('Vector search error:', err);
            }
        }, 300);
    };
}

async function loadHome() {
    const homeView = document.getElementById('home-view');
    const postView = document.getElementById('post-view');
    const errorView = document.getElementById('error-view');
    if (homeView && postView && errorView) {
        homeView.classList.remove('hidden');
        postView.classList.add('hidden');
        errorView.classList.add('hidden');
    }
}

// 3. 개별 포스트 로드 (본문 읽기)
async function loadPost(postId) {
    const homeView = document.getElementById('home-view');
    const postView = document.getElementById('post-view');
    const errorView = document.getElementById('error-view');

    // 로딩 전 모든 뷰 숨김
    if (homeView) homeView.classList.add('hidden');
    if (postView) postView.classList.add('hidden');
    if (errorView) errorView.classList.add('hidden');

    showLoading();
    try {
        const response = await fetch(`${window.API_URL}/posts/${postId}`);
        if (!response.ok) throw new Error('Post not found');
        const post = await response.json();

        const dateStr = new Date(post.created_at).toLocaleDateString('ko-KR');

        const titleDisplay = document.getElementById('post-title-display');
        const dateDisplay = document.getElementById('post-date-display');
        const contentDisplay = document.getElementById('post-content-display');
        const editLink = document.getElementById('edit-post-link');
        const deleteBtn = document.getElementById('delete-post-btn');

        if (titleDisplay && dateDisplay && contentDisplay && editLink && deleteBtn) {
            titleDisplay.textContent = post.title;
            dateDisplay.textContent = dateStr;
            contentDisplay.innerHTML = marked.parse(post.content);
            editLink.href = `write.html#${post.id}`;
            deleteBtn.onclick = () => deletePost(post.id);

            if (postView) postView.classList.remove('hidden');
        }
        window.scrollTo(0, 0);
    } catch (error) {
        if (errorView) errorView.classList.remove('hidden');
        console.error('Error loading post:', error);
    } finally {
        hideLoading();
    }
}

window.deletePost = async function (postId) {
    if (!confirm('정말로 이 글을 삭제하시겠습니까?')) return;

    try {
        const response = await fetchWithAuth(`${window.API_URL}/posts/${postId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Delete failed');

        alert('삭제되었습니다.');
        await loadSidebarPosts();
        window.location.hash = ''; // 홈으로 이동
    } catch (error) {
        alert('삭제 실패: API 연결을 확인하세요.');
        console.error('Error deleting post:', error);
    }
}

function showLoading() {
    loadingDiv.classList.remove('hidden');
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

// URL hash 이벤트(뒤로가기, 글 클릭 등) 처리
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1);

    // Cloudflare 인증 후 돌아온 경우 토큰 저장
    if (hash.startsWith('access_token=')) {
        const token = hash.split('=')[1];
        localStorage.setItem('cf_access_token', token);
        // 토큰을 URL에서 숨기기 위해 해시 제거
        history.replaceState("", document.title, window.location.pathname + window.location.search);
        checkAuth(); // 인증 상태 갱신
        loadHome();
        return;
    }

    if (hash) {
        loadPost(hash);
    } else {
        loadHome();
    }
});

// 페이지 초기 진입 시 라우팅
window.addEventListener('load', async () => {
    const hash = window.location.hash.slice(1);

    // Cloudflare 인증 후 돌아온 경우 토큰 저장
    if (hash.startsWith('access_token=')) {
        const token = hash.split('=')[1];
        localStorage.setItem('cf_access_token', token);
        history.replaceState("", document.title, window.location.pathname + window.location.search);
    }

    await checkAuth();
    await loadSidebarPosts();

    // 토큰 해시 처리를 이미 했다면 홈으로, 아니면 기존 해시(글 ID)로 이동
    const currentHash = window.location.hash.slice(1);
    if (currentHash && !currentHash.startsWith('access_token=')) {
        loadPost(currentHash);
    } else {
        loadHome();
    }
});
