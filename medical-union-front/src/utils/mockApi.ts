import type { LoginRequest, LoginResponse, ApiResponse, UserType } from '@/types';
import { mockUsers, mockPatients, mockReferrals, mockDoctorDashboard, mockPatientDashboard } from './mockData';

// 模拟 API 延迟
const delay = (ms: number = 1000) => new Promise(resolve => setTimeout(resolve, ms));

// 模拟登录 API
export const mockLogin = async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
  await delay(1500); // 模拟网络延迟
  
  const user = mockUsers.find(u => 
    u.phone === data.phone && 
    u.password === data.password && 
    u.userType === data.userType
  );
  
  if (!user) {
    return {
      code: 401,
      message: '手机号或密码错误',
      data: null as any
    };
  }
  
  // 生成模拟 token
  const token = `mock_token_${user.id}_${Date.now()}`;
  
  return {
    code: 200,
    message: '登录成功',
    data: {
      token,
      user: {
        id: user.id,
        username: user.username,
        userType: user.userType as UserType,
        relatedId: user.relatedId,
        createdAt: user.createdAt
      }
    }
  };
};

// 模拟登出 API
export const mockLogout = async (): Promise<ApiResponse> => {
  await delay(500);
  return {
    code: 200,
    message: '登出成功',
    data: null
  };
};

// 模拟获取患者列表
export const mockGetPatients = async (params: any = {}): Promise<ApiResponse> => {
  await delay(800);
  
  let filteredPatients = [...mockPatients];
  
  // 简单的筛选逻辑
  if (params.name) {
    filteredPatients = filteredPatients.filter(p => p.name.includes(params.name));
  }
  if (params.gender) {
    filteredPatients = filteredPatients.filter(p => p.gender === params.gender);
  }
  if (params.severityLevel) {
    filteredPatients = filteredPatients.filter(p => p.severityLevel === params.severityLevel);
  }
  
  return {
    code: 200,
    message: '查询患者列表成功',
    data: filteredPatients
  };
};

// 模拟获取转诊记录
export const mockGetReferrals = async (params: any = {}): Promise<ApiResponse> => {
  await delay(800);
  
  let filteredReferrals = [...mockReferrals];
  
  if (params.patientId) {
    filteredReferrals = filteredReferrals.filter(r => r.patientId === params.patientId);
  }
  if (params.status) {
    filteredReferrals = filteredReferrals.filter(r => r.status === params.status);
  }
  
  return {
    code: 200,
    message: '查询转诊记录成功',
    data: filteredReferrals
  };
};

// 模拟获取医生工作台数据
export const mockGetDoctorDashboard = async (doctorId?: number): Promise<ApiResponse> => {
  await delay(1000);
  
  // 这里可以根据 doctorId 返回不同的数据，目前返回模拟数据
  console.log('Mock API: 获取医生工作台数据，doctorId:', doctorId);
  
  return {
    code: 200,
    message: '获取医生工作台数据成功',
    data: mockDoctorDashboard
  };
};

// 模拟获取患者个人中心数据
export const mockGetPatientDashboard = async (patientId?: number): Promise<ApiResponse> => {
  await delay(1000);
  
  // 这里可以根据 patientId 返回不同的数据，目前返回模拟数据
  console.log('Mock API: 获取患者个人中心数据，patientId:', patientId);
  
  return {
    code: 200,
    message: '获取患者个人中心数据成功',
    data: mockPatientDashboard
  };
};

// 判断是否使用 Mock 数据
export const shouldUseMock = (): boolean => {
  // 可以通过环境变量或其他方式控制
  return import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API;
};