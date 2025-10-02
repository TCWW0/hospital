// Mock 登录数据，仅在演示模式下使用
export interface MockUser {
  phone: string;
  password: string;
  userType: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  name: string;
  userId: number;
  role: string;
  doctorRole?: 'community' | 'hospital';
  expertId?: string; // 医生的专家ID，可选
}

// Mock 用户数据库
export const mockUsers: MockUser[] = [
  // 患者账号（11位手机号）
  {
    phone: '13800138000',
    password: 'password123',
    userType: 'PATIENT',
    name: '张三',
    userId: 10001,
    role: 'patient'
  },
  {
    phone: '13900139000',
    password: 'patient123',
    userType: 'PATIENT', 
    name: '李四',
    userId: 10002,
    role: 'patient'
  },
  {
    phone: '15000150000',
    password: '123456',
    userType: 'PATIENT',
    name: '王五',
    userId: 10003,
    role: 'patient'
  },
  
  // 医生账号（工号格式）
  {
    phone: 'DOC001',
    password: 'doctor123',
    userType: 'DOCTOR',
    name: '周兰',
    userId: 20001,
    role: 'doctor',
    doctorRole: 'hospital',
    expertId: 'exp-001',
  },
  {
    phone: 'DOC002', 
    password: 'password123',
    userType: 'DOCTOR',
    name: '李青',
    userId: 20002,
    role: 'doctor',
    doctorRole: 'community',
    expertId: 'exp-002',
  },
  {
    phone: 'DOC003',
    password: '123456',
    userType: 'DOCTOR',
    name: '王强',
    userId: 20003,
    role: 'doctor',
    doctorRole: 'hospital',
    expertId: 'exp-003',
  },
  
  // 管理员账号
  {
    phone: 'ADMIN001',
    password: 'admin123',
    userType: 'ADMIN',
    name: '系统管理员',
    userId: 30001,
    role: 'admin'
  }
];

// Mock 登录逻辑
export function mockAuthLogin(phone: string, password: string, userType?: string) {
  return new Promise((resolve, reject) => {
    // 模拟网络延时
    setTimeout(() => {
      // 查找用户
      const user = mockUsers.find(u => 
        u.phone === phone && 
        u.password === password &&
        (!userType || u.userType === userType)
      );

      if (!user) {
        reject(new Error('用户名或密码错误'));
        return;
      }

      // 验证患者手机号格式
      if (user.userType === 'PATIENT' && !/^1[3-9]\d{9}$/.test(phone)) {
        reject(new Error('患者请使用11位手机号登录'));
        return;
      }

      // 生成 Mock Token
      const token = `mock_jwt_${user.userId}_${Date.now()}`;

      // 返回登录成功数据
      resolve({
        code: 200,
        message: '登录成功',
        data: {
          token: token,
          userId: user.userId,
          username: user.name,
          role: user.role,
          userType: user.userType,
          phone: user.phone,
          name: user.name,
          doctorRole: user.doctorRole,
          expertId: user.expertId
        }
      });
    }, 800); // 模拟800ms网络延时
  });
}

// 获取当前是否使用 Mock 登录
export function shouldUseMockAuth() {
  return import.meta.env.VITE_USE_MOCK_AUTH === 'true';
}