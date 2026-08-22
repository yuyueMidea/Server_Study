/**
 * 统一 API 返回结构：
 * 成功: { success: true, data, message }
 * 失败: { success: false, data: null, message, errors? }
 */

export function success(data = null, message = 'success') {
  return { success: true, data, message };
}

export function fail(message = 'error', errors = undefined) {
  const body = { success: false, data: null, message };
  if (errors) body.errors = errors;
  return body;
}

/**
 * 分页数据的标准包装
 * @param {Array} list
 * @param {{ page: number, pageSize: number, total: number }} meta
 */
export function paginated(list, meta) {
  return {
    list,
    pagination: {
      page: meta.page,
      pageSize: meta.pageSize,
      total: meta.total,
      totalPages: Math.max(1, Math.ceil(meta.total / meta.pageSize)),
    },
  };
}
