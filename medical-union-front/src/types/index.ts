// 用户相关类型
export interface User {
  id: number;
  username: string;
  userType: UserType;
  relatedId?: number;  // 可选，用于关联患者或医生ID
  createdAt?: string;
  profileJson?: any;   // 后端返回的附加资料字段
}

export type UserType = 'DOCTOR' | 'PATIENT' | 'ADMIN';

// 登录相关类型
export interface LoginRequest {
  phone: string;
  password: string;
  userType: UserType;
}

// 注册请求类型
export interface RegisterRequest {
  username: string;
  password: string;
  role: UserType;
  phone: string;
}

// 后端标准响应格式
export interface BackendResponse<T = any> {
  success: boolean;
  code: number;
  message: string;
  data: T;
}

// 登录响应数据（后端格式）
export interface LoginResponseData {
  userId: number;
  username: string;
  role: UserType;
  profileJson?: any;
  token: string;
}

// 用户信息响应数据
export interface UserInfoData {
  userId: number;
  username: string;
  role: UserType;
  profileJson?: any;
}

// 前端兼容的登录响应类型
export interface LoginResponse {
  token: string;
  user: User;
}

// 患者相关类型
export interface Patient {
  id: number;
  createdAt: string;
  updatedAt: string;
  name: string;
  idCard: string;
  gender: '男' | '女';
  birthDate: string;
  phone: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  medicalHistory: string;
  severityLevel: '轻症' | '中症' | '重症' | '危重';
  hospitalId: number;
  hospitalName: string;
}

// 医生相关类型
export interface Doctor {
  id: number;
  name: string;
  title: string;
  department: string;
  hospital: string;
  createdAt: string;
  updatedAt: string;
}

// 转诊相关类型
export interface Referral {
  id: number;
  patientId: number;
  patientName: string;
  fromHospitalId: number;
  fromHospitalName: string;
  toHospitalId: number;
  toHospitalName: string;
  fromDoctorId: number;
  fromDoctorName: string;
  toDoctorId: number;
  toDoctorName: string;
  reason: string;
  urgencyLevel: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// 就诊记录类型
export interface Visit {
  id: number;
  hospitalName: string;
  doctorName: string;
  visitDate: string;
  diagnosis: string;
  treatment: string;
}

// 统计数据类型
export interface DoctorDashboard {
  doctorInfo: {
    doctorId: number;
    name: string;
    title: string;
    department: string;
    hospital: string;
  };
  todayStatistics: {
    totalPatients: number;
    newPatients: number;
    referralsOut: number;
    referralsIn: number;
  };
  monthlyStatistics: {
    totalPatients: number;
    referralsOut: number;
    referralsIn: number;
    successRate: number;
  };
  recentReferrals: Array<{
    id: number;
    patientName: string;
    toHospital: string;
    status: string;
    createdAt: string;
  }>;
}

export interface PatientDashboard {
  patientInfo: {
    patientId: number;
    name: string;
    gender: string;
    birthDate: string;
    phone: string;
    severityLevel: string;
    currentHospital: string;
  };
  medicalSummary: {
    totalVisits: number;
    totalReferrals: number;
    lastVisitDate: string;
    nextAppointment: string;
  };
  recentVisits: Visit[];
  recentReferrals: Array<{
    id: number;
    fromHospital: string;
    toHospital: string;
    reason: string;
    status: string;
    referralDate: string;
  }>;
}

// 分页相关类型
export interface PaginationParams {
  page?: number;
  size?: number;
}

export interface PaginationResponse<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
}

// API 响应类型
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}