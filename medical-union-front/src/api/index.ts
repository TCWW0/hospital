import { fetchReferrals, fetchReferralById, updateReferralStatus } from '@/api/mock/referrals';
import { fetchPatients, fetchPatientById } from '@/api/mock/patients';

export async function getDashboardSummary() {
  // Derive simple summary from mock data
  const all = await fetchReferrals({ page: 1, pageSize: 1000, status: 'all' } as any);
  const items = all.items || [];
  const totalReferrals = items.length;
  const pending = items.filter((i:any) => i.status === 'pending').length;
  const accepted = items.filter((i:any) => i.status === 'accepted').length;
  const rejected = items.filter((i:any) => i.status === 'rejected').length;
  const today = new Date().toISOString().slice(0,10);
  const todayNew = items.filter((i:any) => (i.createdAt || '').startsWith(today)).length;
  // myPending is mocked as pending
  const myPending = pending;

  return { totalReferrals, pending, accepted, rejected, todayNew, myPending };
}

export async function getRecentReferrals(limit = 6) {
  const res = await fetchReferrals({ page:1, pageSize: limit } as any);
  return res.items || [];
}

export async function getRecentPatients(limit = 6) {
  const patients = await fetchPatients();
  return patients.slice(0, Math.min(limit, patients.length));
}

export async function getSortedPatients(limit = 6) {
  const patients = await fetchPatients();
  // sort: ongoing first, then by triage high>medium>low, then recent lastVisit desc
  const triageOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
  patients.sort((a:any,b:any) => {
    if ((a.status === 'ongoing') !== (b.status === 'ongoing')) return (a.status === 'ongoing') ? -1 : 1;
    const ta = triageOrder[a.triage] ?? 3;
    const tb = triageOrder[b.triage] ?? 3;
    if (ta !== tb) return ta - tb;
    const da = a.lastVisit ? new Date(a.lastVisit).getTime() : 0;
    const db = b.lastVisit ? new Date(b.lastVisit).getTime() : 0;
    return db - da;
  });
  return patients.slice(0, Math.min(limit, patients.length));
}

export { fetchReferrals as fetchReferralsMock, fetchReferralById as fetchReferralByIdMock, updateReferralStatus as updateReferralStatusMock, fetchPatientById as fetchPatientByIdMock };

// Patient-focused helpers (mock-derived)
export async function getPatientOverview() {
  const patients = await fetchPatients();
  const totalPatients = patients.length;
  const highTriage = patients.filter((p:any) => p.triage === 'high').length;
  const mediumTriage = patients.filter((p:any) => p.triage === 'medium').length;
  const lowTriage = patients.filter((p:any) => p.triage === 'low').length;
  const ongoing = patients.filter((p:any) => p.status === 'ongoing').length;
  const completed = patients.filter((p:any) => p.status === 'completed').length;
  return { totalPatients, highTriage, mediumTriage, lowTriage, ongoing, completed };
}

export async function getPatientTrend(days = 7) {
  const patients = await fetchPatients();
  const today = new Date();
  const series: { date: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0,10);
    const count = patients.filter((p:any) => (p.lastVisit || '').startsWith(key)).length;
    series.push({ date: key, count });
  }
  return series;
}
import { http } from '@/utils/request';
import type { 
  LoginRequest, 
  LoginResponse, 
  Patient, 
  Referral, 
  DoctorDashboard, 
  PatientDashboard,
  PaginationParams 
} from '@/types';

// 认证相关 API
export const authApi = {
  // 用户登录
  login: (data: LoginRequest) => 
    http.post<LoginResponse>('/auth/login', data),
  
  // 用户登出
  logout: () => 
    http.post('/auth/logout'),
};

// 患者相关 API
export const patientApi = {
  // 分页查询患者列表
  getPatients: (params: PaginationParams & {
    name?: string;
    gender?: string;
    severityLevel?: string;
  }) => 
    http.get<Patient[]>('/patients', { params }),
  
  // 查询单个患者详情
  getPatient: (id: number) => 
    http.get<Patient>(`/patients/${id}`),
  
  // 创建患者
  createPatient: (data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | 'hospitalName'>) => 
    http.post<Patient>('/patients', data),
  
  // 更新患者信息
  updatePatient: (id: number, data: Partial<Patient>) => 
    http.put<Patient>(`/patients/${id}`, data),
  
  // 删除患者
  deletePatient: (id: number) => 
    http.delete(`/patients/${id}`),
};

// 转诊相关 API
export const referralApi = {
  // 分页查询转诊记录
  getReferrals: (params: PaginationParams & {
    patientId?: number;
    status?: string;
  }) => 
    http.get<Referral[]>('/referrals', { params }),
  
  // 查询单个转诊记录
  getReferral: (id: number) => 
    http.get<Referral>(`/referrals/${id}`),
  
  // 创建转诊记录
  createReferral: (data: Omit<Referral, 'id' | 'createdAt' | 'updatedAt' | 'patientName' | 'fromHospitalName' | 'toHospitalName' | 'fromDoctorName' | 'toDoctorName'>) => 
    http.post<Referral>('/referrals', data),
  
  // 更新转诊状态
  updateReferralStatus: (id: number, data: { status: string; notes?: string }) => 
    http.put<Referral>(`/referrals/${id}/status`, data),
};

// 统计相关 API
export const statisticsApi = {
  // 医生工作台数据
  getDoctorDashboard: (doctorId: number) => 
    http.get<DoctorDashboard>(`/statistics/doctor/dashboard/${doctorId}`),
  
  // 患者个人中心数据
  getPatientDashboard: (patientId: number) => 
    http.get<PatientDashboard>(`/statistics/patient/dashboard/${patientId}`),
  
  // 医院概览统计
  getHospitalOverview: () => 
    http.get('/statistics/hospital/overview'),
  
  // 转诊趋势分析
  getReferralTrends: (params: { startDate: string; endDate: string }) => 
    http.get('/statistics/referrals/trends', { params }),
};

// 系统健康检查
export const systemApi = {
  // 应用健康状态
  getHealth: () => 
    http.get('/actuator/health'),
};