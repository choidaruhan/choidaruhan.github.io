/**
 * API 에러 클래스
 */
class ApiError extends Error {
  constructor(response, message) {
    // response가 없는 경우(네트워크 오류 등)를 처리
    const status = response?.status || 'NETWORK_ERROR';
    super(message || `API Error: ${status}`);
    this.status = status;
    this.response = response;
  }
}

/**
 * API 클라이언트 클래스
 * 중복된 HTTP 로직을 캡슐화
 */
class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  /**
   * 인증 헤더를 포함한 기본 헤더 생성
   */
  buildHeaders(customHeaders = {}) {
    const token = localStorage.getItem('cf_access_token');
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  /**
   * 기본 HTTP 요청 메서드
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = this.buildHeaders(options.headers);

    const config = {
      ...options,
      headers
    };

    // GET/HEAD 요청에는 body를 포함하지 않음
    if (options.body && (options.method === 'GET' || options.method === 'HEAD')) {
      delete config.body;
    }

    let response;
    try {
      response = await fetch(url, config);
    } catch (fetchError) {
      // 네트워크 오류, CORS 에러 등 fetch 자체가 실패한 경우
      console.warn(`Fetch failed for ${url}:`, fetchError.message);
      throw new ApiError(null, `Network error: ${fetchError.message}`);
    }

    if (!response.ok) {
      throw new ApiError(response);
    }

    // 204 No Content 등 본문이 없는 응답 처리
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }

    return response.text();
  }

  // ========== Posts API ==========
  
  /**
   * 모든 게시글 목록 조회
   */
  async getPosts() {
    return this.request('/posts');
  }

  /**
   * 특정 게시글 상세 조회
   */
  async getPost(id) {
    return this.request(`/posts/${id}`);
  }

  /**
   * 게시글 생성/수정
   */
  async savePost(id, title, content) {
    const body = { id, title, content };
    return this.request('/posts', {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  /**
   * 게시글 삭제
   */
  async deletePost(id) {
    return this.request(`/posts/${id}`, {
      method: 'DELETE'
    });
  }

  // ========== Search API ==========
  
  /**
   * 게시글 검색
   */
  async searchPosts(query) {
    const encodedQuery = encodeURIComponent(query);
    return this.request(`/search?q=${encodedQuery}`);
  }

  // ========== Auth API ==========
  
  /**
   * 인증 상태 확인
   */
  async checkAuth() {
    return this.request('/auth/me');
  }
}

// 싱글톤 인스턴스 생성 및 낵출
export const api = new ApiClient(window.API_URL);

// 하위호환성을 위한 기존 함수들 (기존 코드와의 호환성 유지)
export const fetchWithAuth = (url, options = {}) => {
  return api.request(url.replace(window.API_URL, ''), options);
};

export const fetchPosts = () => api.getPosts();
export const fetchPost = (id) => api.getPost(id);
export const createPost = (id, title, content) => api.savePost(id, title, content);
export const deletePostApi = (id) => api.deletePost(id);
export const searchPosts = (query) => api.searchPosts(query);
