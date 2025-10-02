import { http } from '@/utils/request';

export const statisticsApi = {
  getDoctorDashboard: (doctorId: number) =>
    http.get(`/statistics/doctor/dashboard/${doctorId}`),

  getPatientDashboard: (patientId: number) =>
    http.get(`/statistics/patient/dashboard/${patientId}`),

  getHospitalOverview: () => http.get('/statistics/hospital/overview'),

  getReferralTrends: (params: { startDate: string; endDate: string }) =>
    http.get('/statistics/referrals/trends', { params })
};

export type StatisticsApi = typeof statisticsApi;
