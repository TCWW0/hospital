import { http } from '@/utils/request';
import type { PaginationParams, Referral } from '@/types';

export const referralApi = {
  getReferrals: (params: PaginationParams & {
    patientId?: number;
    status?: string;
  }) => http.get<Referral[]>('/referrals', { params }),

  getReferral: (id: number) => http.get<Referral>(`/referrals/${id}`),

  createReferral: (
    data: Omit<
      Referral,
      | 'id'
      | 'createdAt'
      | 'updatedAt'
      | 'patientName'
      | 'fromHospitalName'
      | 'toHospitalName'
      | 'fromDoctorName'
      | 'toDoctorName'
    >
  ) => http.post<Referral>('/referrals', data),

  updateReferralStatus: (id: number, data: { status: string; notes?: string }) =>
    http.put<Referral>(`/referrals/${id}/status`, data)
};

export type ReferralApi = typeof referralApi;
