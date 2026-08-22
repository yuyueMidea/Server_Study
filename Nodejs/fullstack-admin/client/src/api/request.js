import axios from 'axios';

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// 响应拦截器：后端统一返回 { success, data, message }，
// 这里直接把 data 抛给调用方，失败时统一转换为 Error 抛出，
// 让上层用 try/catch 处理，无需每次判断 success 字段。
request.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body && body.success === false) {
      const error = new Error(body.message || '请求失败');
      error.errors = body.errors;
      throw error;
    }
    return body?.data;
  },
  (error) => {
    const body = error.response?.data;
    const message = body?.message || error.message || '网络错误，请稍后重试';
    const normalized = new Error(message);
    normalized.errors = body?.errors;
    normalized.status = error.response?.status;
    return Promise.reject(normalized);
  }
);

export default request;
