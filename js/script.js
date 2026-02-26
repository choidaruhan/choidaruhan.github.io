let allPosts = []; // 모든 글 목록을 저장할 변수

async function checkAuth() {
    // Cloudflare Access가 활성되면 보호된 페이지에 접근할 수 있습니다.
    // 여기서는 단순히 글쓰기 링크만 항상 표시하도록 수정합니다.
    const authLinks = document.getElementById('auth-links');
    if (authLinks) {
        authLinks.innerHTML = `
            <a href="write.html" id="write-link">글쓰기</a>
            <a href="#" onclick="logout()" id="logout-link" style="margin-left: 1rem; color: #7f8c8d; font-size: 0.9rem;">로그아웃</a>
        `;
    }
}

// 로그아웃은 Cloudflare Access의 /cdn-cgi/access/logout 경로를 사용하게 됩니다.
window.logout = function () {
    if (confirm('로그아웃 하시겠습니까?')) {
        // 로컬 개발 환경에서는 Cloudflare 전용 경로(/cdn-cgi/...)가 없으므로 홈으로 리다이렉트만 합니다.
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            alert('로컬 환경에서는 세션 초기화 후 홈으로 이동합니다.');
            window.location.href = 'index.html';
        } else {
            // 실제 배포 환경
            window.location.href = '/cdn-cgi/access/logout';
        }
    }
}

const contentDiv = document.getElementById('content');
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
    contentDiv.innerHTML = `
        <div style="text-align: center; padding: 3rem 0;">
            <h2 style="color: var(--primary-color);">My Cloudflare Blog</h2>
            <p style="color: #7f8c8d; margin-top: 1rem;">왼쪽 메뉴에서 글을 선택하여 읽어보세요.</p>
            <p style="font-size: 0.8rem; color: #bdc3c7; margin-top: 0.5rem;">Semantic Search powered by Cloudflare Vectorize</p>
        </div>
    `;
}

// 3. 개별 포스트 로드 (본문 읽기)
async function loadPost(postId) {
    showLoading();
    try {
        const response = await fetch(`${window.API_URL}/posts/${postId}`);
        if (!response.ok) throw new Error('Post not found');
        const post = await response.json();

        const dateStr = new Date(post.created_at).toLocaleDateString('ko-KR');

        let html = `
            <div class="markdown-body">
                <h1>${post.title}</h1>
                <p class="post-date" style="margin-bottom: 2rem; border-bottom: 1px solid #eee; padding-bottom: 1rem;">${dateStr}</p>
                ${marked.parse(post.content)}
                <div style="margin-top: 3rem; text-align:right;">
                    <a href="write.html#${post.id}" style="color:var(--primary-color); text-decoration:none; margin-right: 1rem; font-weight:bold;">글 수정</a>
                    <button onclick="deletePost('${post.id}')" style="background:none; border:none; color:red; cursor:pointer; font-weight:bold;">글 삭제</button>
                </div>
            </div>
        `;
        contentDiv.innerHTML = html;
        window.scrollTo(0, 0);
    } catch (error) {
        contentDiv.innerHTML = '<p>포스트를 불러오는 데 실패했습니다.</p>';
        console.error('Error loading post:', error);
    } finally {
        hideLoading();
    }
}

window.deletePost = async function (postId) {
    if (!confirm('정말로 이 글을 삭제하시겠습니까?')) return;

    try {
        const response = await fetch(`${window.API_URL}/posts/${postId}`, {
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

// URL hash 이벤트(뒤로가기, 글 클릭 등) 처리
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1);
    if (hash) {
        loadPost(hash);
    } else {
        loadHome();
    }
});

// 페이지 초기 진입 시 라우팅
window.addEventListener('load', async () => {
    await checkAuth();
    await loadSidebarPosts();

    const hash = window.location.hash.slice(1);
    if (hash) {
        loadPost(hash);
    } else {
        loadHome();
    }
});
