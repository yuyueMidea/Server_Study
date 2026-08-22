import { fail } from '../utils/response.js';
import { AppError } from '../utils/AppError.js';

/**
 * 全局错误处理器。捕获三类错误并统一转换为 { success:false, data:null, message } 结构：
 *  1. 业务错误 AppError（及其子类 NotFoundError / ValidationError）
 *  2. Fastify 的 JSON Schema 参数校验错误（error.validation 存在）
 *  3. 其他未预期的运行时错误（500）
 */
export function errorHandler(error, request, reply) {
  // 1. 自定义业务错误
  if (error instanceof AppError) {
    request.log.warn({ err: error }, `[业务错误] ${error.message}`);
    return reply.code(error.statusCode).send(fail(error.message, error.errors));
  }

  // 2. Fastify 参数校验错误 -> 转换为 { field: message } 形式，与业务校验错误结构保持一致
  if (error.validation) {
    const errors = {};
    for (const item of error.validation) {
      const field = item.instancePath?.replace('/', '') || item.params?.missingProperty || 'body';
      errors[field] = item.message;
    }
    request.log.warn({ err: error }, '[参数校验失败]');
    return reply.code(422).send(fail('参数校验失败', errors));
  }

  // 3. 未预期错误
  request.log.error({ err: error }, '[未处理异常]');
  const message =
    process.env.NODE_ENV === 'production' ? '服务器内部错误' : error.message || '服务器内部错误';
  return reply.code(error.statusCode || 500).send(fail(message));
}

/**
 * 统一 404 处理（未匹配到任何路由）。
 */
export function notFoundHandler(request, reply) {
  return reply.code(404).send(fail(`接口不存在: ${request.method} ${request.url}`));
}
