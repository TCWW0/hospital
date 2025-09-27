import { http } from '@/utils/request';
import type { UserType } from '@/types';

export interface MeResponse {
  userId: number;
  username: string;
  role: UserType | string;
  idNumber?: string;
  phone?: string;
  profileJson?: string | Record<string, any>;
}

export interface UpdateMePayload {
  name?: string;
  idNumber?: string;
  phone?: string;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export const userApi = {
  getMe: () => http.get<MeResponse>('/api/v1/user/me'),
  updateMe: (data: UpdateMePayload) => http.patch<null>('/api/v1/user/me', data),
  changePassword: (data: ChangePasswordPayload) => http.post<null>('/api/v1/user/change-password', data),
};
