import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { ApiResponse } from '@/types';

// 创建 axios 实例
const instance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
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
    // 兼容两种返回格式：
    // 1) 后端返回 envelope: { code, message, data }
    // 2) json-server 等 mock 返回原始资源（数组或对象）
    const raw = response.data;
    const envelope = (raw && typeof raw === 'object' && Object.prototype.hasOwnProperty.call(raw, 'code'))
      ? raw
      : { code: 200, message: 'OK', data: raw };

    const { code, message } = envelope as { code?: number; message?: string };

    // 处理业务错误
    if (code !== 200) {
      const errorMessage = message || '请求失败';

      // 如果是认证错误，清除 token 并跳转到登录页
      if (code === 401) {
        localStorage.removeItem('medical_union_token');
        localStorage.removeItem('medical_union_user');
        // 这里可以添加路由跳转逻辑
        window.location.href = '/login';
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