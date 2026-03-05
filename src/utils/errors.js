/**
 * 애플리케이션 에러 클래스
 * 상태 코드와 함께 에러를 처리
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 자주 사용되는 에러 팩토리 함수들
 */
export const Errors = {
  badRequest: (msg = 'Bad Request') => new AppError(msg, 400),
  unauthorized: (msg = 'Unauthorized') => new AppError(msg, 401),
  forbidden: (msg = 'Forbidden') => new AppError(msg, 403),
  notFound: (msg = 'Not Found') => new AppError(msg, 404),
  conflict: (msg = 'Conflict') => new AppError(msg, 409),
  internal: (msg = 'Internal Server Error') => new AppError(msg, 500),
};

/**
 * 에러 응답 생성 헬퍼
 * 프로덕션 환경에서는 민감한 정보를 숨김
 */
export function createErrorResponse(error, isDevelopment = false) {
  const statusCode = error.statusCode || 500;
  
  const response = {
    status: 'error',
    message: statusCode >= 500 && !isDevelopment 
      ? 'Internal Server Error' 
      : error.message
  };
  
  // 개발 환경에서만 스택 트레이스 포함
  if (isDevelopment && error.stack) {
    response.stack = error.stack;
  }
  
  return Response.json(response, { 
    status: statusCode,
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * 비동기 핸들러 래퍼
 * try-catch 중복 제거
 */
export function asyncHandler(fn) {
  return async (request, ...args) => {
    try {
      return await fn(request, ...args);
    } catch (error) {
      // 이미 AppError인 경우 그대로 던짐
      if (error instanceof AppError) {
        throw error;
      }
      
      // 예상치 못한 에러는 500으로 변환
      throw new AppError(error.message || 'Unexpected error', 500, false);
    }
  };
}
