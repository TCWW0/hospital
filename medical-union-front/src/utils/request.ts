import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { ApiResponse } from '@/types';

// 创建 axios 实例
// 在开发环境中使用相对路径让 Vite 的 dev server 代理 (/api -> backend) 生效，避免跨域预检导致的 OPTIONS 403
const devBase = import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE_URL;
const instance: AxiosInstance = axios.create({
  baseURL: devBase,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('medical_union_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 在开发环境下打印请求信息
    if (import.meta.env.DEV) {
      console.log('🚀 Request:', {
        url: config.url,
        method: config.method,
        data: config.data,
        params: config.params,
      });
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  (response: AxiosResponse<any>) => {
    // 在开发环境下打印响应信息
    if (import.meta.env.DEV) {
      console.log('✅ Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data,
      });
    }
    // 兼容三种返回格式：
    // 1) 后端返回 envelope: { success, code, message, data } (新增)
    // 2) 前端期望格式: { code, message, data }
    // 3) json-server 等 mock 返回原始资源（数组或对象）
    const raw = response.data;
    let envelope;
    
    if (raw && typeof raw === 'object') {
      if (Object.prototype.hasOwnProperty.call(raw, 'success')) {
        // 后端格式 { success, code, message, data } -> 转换为前端格式
        envelope = {
          code: raw.success ? 200 : (raw.code || 500),
          message: raw.message || 'Unknown error',
          data: raw.data
        };
      } else if (Object.prototype.hasOwnProperty.call(raw, 'code')) {
        // 已经是前端格式 { code, message, data }
        envelope = raw;
      } else {
        // mock 格式，直接包装
        envelope = { code: 200, message: 'OK', data: raw };
      }
    } else {
      envelope = { code: 200, message: 'OK', data: raw };
    }

    const { code, message } = envelope as { code?: number; message?: string };

    // 处理业务错误
    if (code !== 200 && code !== 0) {
      const errorMessage = message || '请求失败';

      // 如果是认证错误，清除 token 并跳转到登录页
      if (code === 401) {
        localStorage.removeItem('medical_union_token');
        localStorage.removeItem('medical_union_user');
        // 只有在不是登录页面时才跳转
        if (!window.location.pathname.includes('/login')) {
          console.log('🔄 认证失败，跳转到登录页');
          window.location.href = '/login';
        }
      }

      console.error('❌ Business Error:', errorMessage);
      return Promise.reject(new Error(errorMessage));
    }

    return envelope;
  },
  (error) => {
    console.error('❌ Response Error:', error);
    
    let errorMessage = '网络错误，请稍后重试';
    
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          errorMessage = data?.message || '请求参数错误';
          break;
        case 401:
          errorMessage = '登录已过期，请重新登录';
          localStorage.removeItem('medical_union_token');
          localStorage.removeItem('medical_union_user');
          window.location.href = '/login';
          break;
        case 403:
          errorMessage = '没有权限执行此操作';
          break;
        case 404:
          errorMessage = '请求的资源不存在';
          break;
        case 500:
          errorMessage = '服务器内部错误';
          break;
        default:
          errorMessage = data?.message || `请求失败 (${status})`;
      }
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = '请求超时，请稍后重试';
    } else if (error.message === 'Network Error') {
      errorMessage = '网络连接失败，请检查网络设置';
    }
    
    return Promise.reject(new Error(errorMessage));
  }
);

// 封装常用的请求方法
export const http = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return instance.get(url, config);
  },
  
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return instance.post(url, data, config);
  },
  
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return instance.put(url, data, config);
  },
  
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return instance.delete(url, config);
  },
  
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return instance.patch(url, data, config);
  },
};

// 上传文件的特殊方法
export const uploadFile = (url: string, file: File, onProgress?: (progress: number) => void) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return instance.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
  });
};

export default instance;