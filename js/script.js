import { fetchPosts, fetchPost, deletePostApi, searchPosts, createPost } from './api.js';
import { checkAuth, verifyAuthentication } from './auth.js';

let allPosts = []; // 모든 글 목록을 저장할 변수
let currentEditId = null; // 현재 수정 중인 글 ID

const loadingDiv = document.getElementById('loading');
const homeLink = document.getElementById('home-link');
const sidebarToggleBtn = document.getElementById('sidebar-toggle');
const sidebar = document.getElementById('sidebar');

// DOM Elements for Write View
const writeView = document.getElementById('write-view');
const writeForm = document.getElementById('write-form');
const writeTitle = document.getElementById('write-title');
const postTitleInput = document.getElementById('post-title');
const postContentInput = document.getElementById('post-content');
const submitBtn = document.getElementById('submit-btn');
const cancelWriteBtn = document.getElementById('cancel-write-btn');

if (sidebarToggleBtn && sidebar) {
    sidebarToggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('show');
    });

    // 모바일 등에서 메뉴 바깥 영역 클릭 시 사이드바 닫기
    document.addEventListener('click', (e) => {
        if (sidebar && sidebar.classList.contains('show') && !sidebar.contains(e.target) && !sidebarToggleBtn.contains(e.target)) {
            sidebar.classList.remove('show');
        }
    });

    // 사이드바 내의 링크 클릭 시 사이드바 닫기
    sidebar.addEventListener('click', (e) => {
        if (e.target.closest('a')) {
            sidebar.classList.remove('show');
        }
    });
}

async function loadSidebarPosts() {
    const sidebarListDiv = document.getElementById('sidebar-post-list');
    if (!sidebarListDiv) return;

    try {
        allPosts = await fetchPosts();
        renderSidebarPosts(allPosts);
        setupSearch();
    } catch (error) {
        sidebarListDiv.innerHTML = '<p style="font-size: 0.9rem; color: red;">목록을 불러오지 못했습니다.</p>';
        console.error('Error loading sidebar:', error);
    }
}

function renderSidebarPosts(posts, isSearch = false) {
    const sidebarListDiv = document.getElementById('sidebar-post-list');
    if (!sidebarListDiv) return;

    if (!Array.isArray(posts) || posts.length === 0) {
        if (isSearch) {
            sidebarListDiv.innerHTML = '<p style="font-size: 0.9rem; color: #7f8c8d; text-align: center; padding: 1rem;">검색 결과가 없습니다.</p>';
        } else {
            sidebarListDiv.innerHTML = '<p style="font-size: 0.9rem; color: #7f8c8d;">게시글이 없습니다.</p>';
        }
        return;
    }

    let html = '<ul class="post-list">';
    posts.forEach(post => {
        const dateStr = post.created_at ? new Date(post.created_at).toLocaleDateString('ko-KR') : '날짜 없음';
        html += `
            <li>
                <a href="#${post.id}" class="post-title">${post.title || '제목 없음'}</a>
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
        const query = e.target.value.trim();
        clearTimeout(debounceTimer);

        if (!query) {
            renderSidebarPosts(allPosts);
            return;
        }

        debounceTimer = setTimeout(async () => {
            try {
                const results = await searchPosts(query);
                renderSidebarPosts(results, true);
            } catch (err) {
                console.error('Search error:', err);
                const sidebarListDiv = document.getElementById('sidebar-post-list');
                if (sidebarListDiv) {
                    sidebarListDiv.innerHTML = `<p style="font-size: 0.8rem; color: #e74c3c; text-align: center; padding: 1rem;">
                        검색 중 오류가 발생했습니다.<br>
                        <small>${err.message}</small>
                    </p>`;
                }
            }
        }, 400);
    };
}

async function loadHome() {
    const homeView = document.getElementById('home-view');
    const postView = document.getElementById('post-view');
    const writeView = document.getElementById('write-view');
    const errorView = document.getElementById('error-view');
    if (homeView && postView && writeView && errorView) {
        homeView.classList.remove('hidden');
        postView.classList.add('hidden');
        writeView.classList.add('hidden');
        errorView.classList.add('hidden');
    }
}

async function loadPost(postId) {
    const homeView = document.getElementById('home-view');
    const postView = document.getElementById('post-view');
    const writeView = document.getElementById('write-view');
    const errorView = document.getElementById('error-view');

    if (homeView) homeView.classList.add('hidden');
    if (postView) postView.classList.add('hidden');
    if (writeView) writeView.classList.add('hidden');
    if (errorView) errorView.classList.add('hidden');

    showLoading();
    try {
        const post = await fetchPost(postId);
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
            editLink.href = `#edit/${post.id}`;
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

async function loadEditor(postId = null) {
    const { authorized } = await verifyAuthentication();
    if (!authorized) {
        alert('이 페이지에 접근하려면 로그인이 필요합니다.');
        const currentHash = window.location.hash;
        window.location.href = `${window.API_URL}/login?redirect=${encodeURIComponent(window.location.origin + window.location.pathname + currentHash)}`;
        return;
    }

    const homeView = document.getElementById('home-view');
    const postView = document.getElementById('post-view');
    const writeView = document.getElementById('write-view');
    const errorView = document.getElementById('error-view');

    if (homeView) homeView.classList.add('hidden');
    if (postView) postView.classList.add('hidden');
    if (errorView) errorView.classList.add('hidden');
    if (writeView) writeView.classList.remove('hidden');

    currentEditId = postId;
    if (postId) {
        writeTitle.textContent = '글 수정하기';
        submitBtn.textContent = '수정 완료';
        showLoading();
        try {
            const post = await fetchPost(postId);
            postTitleInput.value = post.title;
            postContentInput.value = post.content;
        } catch (error) {
            alert('기존 글을 불러오는 데 실패했습니다.');
            window.location.hash = '';
        } finally {
            hideLoading();
        }
    } else {
        writeTitle.textContent = '새 글 작성하기';
        submitBtn.textContent = '작성 완료';
        postTitleInput.value = '';
        postContentInput.value = '';
    }
    window.scrollTo(0, 0);
}

if (writeForm) {
    writeForm.onsubmit = async (e) => {
        e.preventDefault();
        const title = postTitleInput.value;
        const content = postContentInput.value;
        const id = currentEditId || crypto.randomUUID();

        submitBtn.disabled = true;
        const originalText = submitBtn.textContent;
        submitBtn.textContent = '저장 중...';

        try {
            await createPost(id, title, content);
            alert(currentEditId ? '수정되었습니다.' : '등록되었습니다.');
            await loadSidebarPosts();
            window.location.hash = `#${id}`;
        } catch (error) {
            alert('저장에 실패했습니다.');
            console.error('Save error:', error);
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    };
}

if (cancelWriteBtn) {
    cancelWriteBtn.onclick = () => {
        if (confirm('작성을 취소하시겠습니까?')) {
            window.history.back();
        }
    };
}

window.deletePost = async function (postId) {
    if (!confirm('정말로 이 글을 삭제하시겠습니까?')) return;

    try {
        await deletePostApi(postId);
        alert('삭제되었습니다.');
        await loadSidebarPosts();
        window.location.hash = '';
    } catch (error) {
        alert('삭제 실패: API 연결을 확인하세요.');
        console.error('Error deleting post:', error);
    }
}

function showLoading() {
    if (loadingDiv) loadingDiv.classList.remove('hidden');
}

function hideLoading() {
    if (loadingDiv) loadingDiv.classList.add('hidden');
}

homeLink.addEventListener('click', (e) => {
    e.preventDefault();
    history.pushState("", document.title, window.location.pathname + window.location.search);
    window.location.hash = '';
    loadHome();
});

window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1);

    if (hash.includes('access_token=')) {
        const params = new URLSearchParams(hash);
        const token = params.get('access_token');
        const restore = params.get('restore');

        if (token) {
            localStorage.setItem('cf_access_token', token);
        }

        if (restore) {
            window.location.hash = restore;
        } else {
            history.replaceState("", document.title, window.location.pathname + window.location.search);
            loadHome();
        }
        checkAuth();
        return;
    }

    if (hash === 'write') {
        loadEditor();
    } else if (hash.startsWith('edit/')) {
        const id = hash.replace('edit/', '');
        loadEditor(id);
    } else if (hash) {
        loadPost(hash);
    } else {
        loadHome();
    }
});

window.addEventListener('load', async () => {
    const hash = window.location.hash.slice(1);

    if (hash.includes('access_token=')) {
        const params = new URLSearchParams(hash);
        const token = params.get('access_token');
        const restore = params.get('restore');

        if (token) {
            localStorage.setItem('cf_access_token', token);
            if (restore) {
                history.replaceState("", document.title, window.location.pathname + window.location.search + '#' + restore);
            } else {
                history.replaceState("", document.title, window.location.pathname + window.location.search);
            }
        }
    }

    await checkAuth();
    await loadSidebarPosts();

    const currentHash = window.location.hash.slice(1);
    if (currentHash) {
        if (currentHash === 'write') {
            loadEditor();
        } else if (currentHash.startsWith('edit/')) {
            const id = currentHash.replace('edit/', '');
            loadEditor(id);
        } else if (!currentHash.includes('access_token=')) {
            loadPost(currentHash);
        } else {
            loadHome();
        }
    } else {
        loadHome();
    }
});
