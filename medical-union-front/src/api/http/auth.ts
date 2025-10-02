import { http } from '@/utils/request';
import type {
  BackendResponse,
  LoginRequest,
  LoginResponseData,
  RegisterRequest,
  UserInfoData
} from '@/types';

export const authApi = {
  register: (data: RegisterRequest) =>
    http.post<BackendResponse<{ userId: number; message: string }>>('/auth/register', data),

  login: (data: LoginRequest) =>
    http.post<BackendResponse<LoginResponseData>>('/api/v1/auth/login', data),

  getUserInfo: () =>
    http.get<BackendResponse<UserInfoData>>('/api/v1/auth/user/info'),

  logout: () =>
    http.post('/api/v1/auth/logout')
};

export type AuthApi = typeof authApi;
