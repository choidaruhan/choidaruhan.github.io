import { corsHeaders, getCorsHeaders } from '../utils/cors.js';
import { isAuthorized } from '../utils/auth.js';
import { AppError, Errors } from '../utils/errors.js';

/**
 * 게시글 입력값 검증
 */
function validatePostInput(body) {
  const { id, title, content } = body;
  
  // 제목 검증
  if (!title || typeof title !== 'string') {
    throw Errors.badRequest('Title is required and must be a string');
  }
  
  if (title.trim().length === 0) {
    throw Errors.badRequest('Title cannot be empty');
  }
  
  if (title.length > 200) {
    throw Errors.badRequest('Title must be less than 200 characters');
  }
  
  // 내용 검증
  if (!content || typeof content !== 'string') {
    throw Errors.badRequest('Content is required and must be a string');
  }
  
  if (content.trim().length === 0) {
    throw Errors.badRequest('Content cannot be empty');
  }
  
  if (content.length > 50000) {
    throw Errors.badRequest('Content must be less than 50000 characters');
  }
  
  return {
    id: id || crypto.randomUUID(),
    title: title.trim(),
    content: content.trim()
  };
}

/**
 * ID 파라미터 검증
 */
function validateId(id) {
  if (!id || typeof id !== 'string') {
    throw Errors.badRequest('Invalid ID');
  }
  
  // UUID 형식 또는 URL-safe 문자열 검증
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
    throw Errors.badRequest('Invalid ID format');
  }
  
  if (id.length > 100) {
    throw Errors.badRequest('ID too long');
  }
  
  return id;
}

export async function handlePostsRoutes(request, path, env, secret, corsHeaders) {
  const method = request.method;
  const cors = corsHeaders || getCorsHeaders(request);

  // 1. 글 목록 조회 (GET /posts) - 공개
  if (path === '/posts' && method === 'GET') {
    try {
      const { results } = await env.DB.prepare(
        "SELECT id, title, created_at FROM posts ORDER BY created_at DESC"
      ).all();
      
      return Response.json(results, { headers: cors });
    } catch (dbError) {
      console.error('Database error in getPosts:', dbError);
      throw Errors.internal('Failed to fetch posts');
    }
  }

  // 2. 개별 글 상세 조회 (GET /posts/:id) - 공개
  if (path.startsWith('/posts/') && method === 'GET' && path !== '/posts') {
    const rawId = path.split('/')[2];
    const id = validateId(rawId);
    
    try {
      const post = await env.DB.prepare(
        "SELECT * FROM posts WHERE id = ?"
      ).bind(id).first();
      
      if (!post) {
        throw Errors.notFound('Post not found');
      }
      
      return Response.json(post, { headers: cors });
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Database error in getPost:', error);
      throw Errors.internal('Failed to fetch post');
    }
  }

  // 3. 글 작성/수정 (POST /posts) - 보호됨
  if (path === '/posts' && method === 'POST') {
    if (!(await isAuthorized(request, secret, env))) {
      throw Errors.unauthorized('Authentication required');
    }

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      throw Errors.badRequest('Invalid JSON body');
    }
    
    const { id, title, content } = validatePostInput(body);

    try {
      await env.DB.prepare(
        "INSERT OR REPLACE INTO posts (id, title, content, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)"
      ).bind(id, title, content).run();

      return Response.json({ 
        success: true,
        data: { id, title }
      }, { headers: cors });
    } catch (dbError) {
      console.error('Database error in savePost:', dbError);
      throw Errors.internal('Failed to save post');
    }
  }

  // 4. 글 삭제 (DELETE /posts/:id) - 보호됨
  if (path.startsWith('/posts/') && method === 'DELETE') {
    if (!(await isAuthorized(request, secret, env))) {
      throw Errors.unauthorized('Authentication required');
    }

    const rawId = path.split('/')[2];
    const id = validateId(rawId);

    try {
      const result = await env.DB.prepare(
        "DELETE FROM posts WHERE id = ?"
      ).bind(id).run();
      
      // 삭제된 row가 없는 경우
      if (result.meta?.changes === 0) {
        throw Errors.notFound('Post not found');
      }

      return Response.json({ 
        success: true,
        message: 'Post deleted successfully'
      }, { headers: cors });
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Database error in deletePost:', error);
      throw Errors.internal('Failed to delete post');
    }
  }

  return null;
}
