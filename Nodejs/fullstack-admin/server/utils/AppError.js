/**
 * 业务错误基类。Service 层应抛出该类的实例（或子类），
 * 由全局错误处理中间件统一捕获并转换为标准响应结构。
 */
export class AppError extends Error {
  constructor(message, statusCode = 400, errors = undefined) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace?.(this, AppError);
  }
}

export class NotFoundError extends AppError {
  constructor(message = '资源不存在') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends AppError {
  constructor(message = '参数校验失败', errors = undefined) {
    super(message, 422, errors);
    this.name = 'ValidationError';
  }
}

export default AppError;
