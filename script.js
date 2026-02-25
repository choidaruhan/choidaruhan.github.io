let supabaseClient = null;
try {
    supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
} catch (e) {
    console.error("Supabase URL 에러: config.js를 확인하세요.", e);
}
let currentSession = null;

// 네비게이션 로그인/로그아웃 버튼 세팅
async function checkAuth() {
    if (!supabaseClient) return;
    const { data: { session } } = await supabaseClient.auth.getSession();
    currentSession = session;

    const authLinks = document.getElementById('auth-links');
    if (session) {
        authLinks.innerHTML = `
            <a href="write.html" id="write-link" style="margin-right: 10px;">글쓰기</a>
            <a href="#" onclick="logout()" style="color: #e74c3c; margin-right: 10px;">로그아웃</a>
        `;
    } else {
        authLinks.innerHTML = `
            <a href="login.html" id="login-link" style="margin-right: 10px;">관리자 로그인</a>
        `;
    }
}

window.logout = async function () {
    await supabaseClient.auth.signOut();
    alert('로그아웃 되었습니다.');
    window.location.reload();
}

const contentDiv = document.getElementById('content');
const loadingDiv = document.getElementById('loading');
const homeLink = document.getElementById('home-link');

async function loadHome() {
    // 키가 입력되지 않거나 올바르지 않은 경우 안내
    if (!supabaseClient || window.SUPABASE_URL.includes('여기에') || !window.SUPABASE_URL.startsWith('http')) {
        contentDiv.innerHTML = '<p style="color:red; font-weight:bold; font-size: 1.2rem;">config.js 파일에 올바른 Supabase URL (https://...)과 Anon Key를 입력해주세요!</p>';
        return;
    }

    showLoading();
    try {
        // posts 테이블에서 id, title, created_at만 가져오기 (작성일 내림차순)
        const { data: posts, error } = await supabaseClient
            .from('posts')
            .select('id, title, created_at')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!posts || posts.length === 0) {
            contentDiv.innerHTML = '<p>아직 작성된 글이 없습니다. "글쓰기" 버튼을 눌러 첫 글을 작성해 보세요!</p>';
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
        contentDiv.innerHTML = html;
    } catch (error) {
        contentDiv.innerHTML = '<p>포스트 목록을 불러오는 데 실패했습니다.</p>';
        console.error('Error loading home:', error);
    } finally {
        hideLoading();
    }
}

// 3. 개별 포스트 로드 (본문 읽기)
async function loadPost(postId) {
    showLoading();
    try {
        // 특정 id의 포스트 한 개만 가져오기
        const { data: post, error } = await supabaseClient
            .from('posts')
            .select('*')
            .eq('id', postId)
            .single();

        if (error) throw error;
        if (!post) throw new Error('Post not found');

        const dateStr = new Date(post.created_at).toLocaleDateString('ko-KR');

        // marked.js로 markdown 문자열을 html로 변환하여 렌더링
        let html = `
            <div class="markdown-body">
                <h1>${post.title}</h1>
                <p class="post-date" style="margin-bottom: 2rem; border-bottom: 1px solid #eee; padding-bottom: 1rem;">${dateStr}</p>
                ${marked.parse(post.content)}
                ${currentSession ? `
                <div style="margin-top: 3rem; text-align:right;">
                    <a href="write.html?id=${post.id}" style="color:var(--primary-color); text-decoration:none; margin-right: 1rem; font-weight:bold;">글 수정</a>
                    <button onclick="deletePost('${post.id}')" style="background:none; border:none; color:red; cursor:pointer; font-weight:bold;">글 삭제</button>
                </div>
                ` : ''}
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

// 4. 포스트 삭제 함수 (추가 기능)
window.deletePost = async function (postId) {
    if (!confirm('정말로 이 글을 삭제하시겠습니까?')) return;

    try {
        const { error } = await supabaseClient
            .from('posts')
            .delete()
            .eq('id', postId);

        if (error) throw error;
        alert('삭제되었습니다.');
        window.location.hash = ''; // 홈으로 이동
    } catch (error) {
        alert('삭제 실패: RLS 정책을 확인하거나 콘솔창을 확인하세요.');
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

    const hash = window.location.hash.slice(1);
    if (hash) {
        loadPost(hash);
    } else {
        loadHome();
    }
});
