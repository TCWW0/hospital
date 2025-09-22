// 模拟用户数据
export const mockUsers = [
  {
    id: 1,
    username: 'doctor1',
    phone: '13800138001',
    password: '123456',
    userType: 'DOCTOR',
    relatedId: 1,
    createdAt: '2025-09-21 20:53:51'
  },
  {
    id: 2,
    username: 'patient1',
    phone: '13800138002',
    password: '123456',
    userType: 'PATIENT',
    relatedId: 1,
    createdAt: '2025-09-21 20:53:51'
  },
  {
    id: 3,
    username: 'admin1',
    phone: '13800138003',
    password: '123456',
    userType: 'ADMIN',
    relatedId: 1,
    createdAt: '2025-09-21 20:53:51'
  }
];

// 模拟患者数据
export const mockPatients = [
  {
    id: 1,
    createdAt: '2025-09-21 20:53:51',
    updatedAt: '2025-09-21 20:53:51',
    name: '张三',
    idCard: '110101199001011234',
    gender: '男',
    birthDate: '1990-01-01',
    phone: '13912345678',
    address: '北京市朝阳区',
    emergencyContact: '李四',
    emergencyPhone: '13987654321',
    medicalHistory: '高血压病史',
    severityLevel: '轻症',
    hospitalId: 1,
    hospitalName: '北京协和医院'
  },
  {
    id: 2,
    createdAt: '2025-09-21 20:53:51',
    updatedAt: '2025-09-21 20:53:51',
    name: '李美丽',
    idCard: '110101199002021234',
    gender: '女',
    birthDate: '1990-02-02',
    phone: '13912345679',
    address: '北京市海淀区',
    emergencyContact: '王五',
    emergencyPhone: '13987654322',
    medicalHistory: '糖尿病病史',
    severityLevel: '中症',
    hospitalId: 2,
    hospitalName: '北京大学第一医院'
  },
  {
    id: 3,
    createdAt: '2025-09-21 20:53:51',
    updatedAt: '2025-09-21 20:53:51',
    name: '王强',
    idCard: '110101199003031234',
    gender: '男',
    birthDate: '1990-03-03',
    phone: '13912345680',
    address: '北京市西城区',
    emergencyContact: '赵六',
    emergencyPhone: '13987654323',
    medicalHistory: '心脏病病史',
    severityLevel: '重症',
    hospitalId: 1,
    hospitalName: '北京协和医院'
  }
];

// 模拟转诊数据
export const mockReferrals = [
  {
    id: 1,
    patientId: 1,
    patientName: '张三',
    fromHospitalId: 1,
    fromHospitalName: '北京协和医院',
    toHospitalId: 2,
    toHospitalName: '北京大学第一医院',
    fromDoctorId: 1,
    fromDoctorName: '李医生',
    toDoctorId: 2,
    toDoctorName: '王医生',
    reason: '需要专科治疗',
    urgencyLevel: 'NORMAL',
    status: 'PENDING',
    notes: '患者病情稳定',
    createdAt: '2025-09-21 20:53:51',
    updatedAt: '2025-09-21 20:53:51'
  },
  {
    id: 2,
    patientId: 2,
    patientName: '李美丽',
    fromHospitalId: 2,
    fromHospitalName: '北京大学第一医院',
    toHospitalId: 3,
    toHospitalName: '北京天坛医院',
    fromDoctorId: 2,
    fromDoctorName: '王医生',
    toDoctorId: 3,
    toDoctorName: '张医生',
    reason: '需要进一步检查',
    urgencyLevel: 'HIGH',
    status: 'APPROVED',
    notes: '已同意接收',
    createdAt: '2025-09-20 18:30:00',
    updatedAt: '2025-09-21 09:15:00'
  }
];

// 模拟医生工作台数据
export const mockDoctorDashboard = {
  doctorInfo: {
    doctorId: 1,
    name: '李医生',
    title: '主任医师',
    department: '心内科',
    hospital: '北京协和医院'
  },
  todayStatistics: {
    totalPatients: 15,
    newPatients: 3,
    referralsOut: 2,
    referralsIn: 1
  },
  monthlyStatistics: {
    totalPatients: 450,
    referralsOut: 25,
    referralsIn: 18,
    successRate: 0.92
  },
  recentReferrals: [
    {
      id: 1,
      patientName: '张三',
      toHospital: '北京大学第一医院',
      status: 'PENDING',
      createdAt: '2025-09-21 20:53:51'
    }
  ]
};

// 模拟患者个人中心数据
export const mockPatientDashboard = {
  patientInfo: {
    patientId: 1,
    name: '张三',
    gender: '男',
    birthDate: '1990-01-01',
    phone: '13912345678',
    severityLevel: '轻症',
    currentHospital: '北京协和医院'
  },
  medicalSummary: {
    totalVisits: 5,
    totalReferrals: 2,
    lastVisitDate: '2025-09-20',
    nextAppointment: '2025-09-25'
  },
  recentVisits: [
    {
      id: 1,
      hospitalName: '北京协和医院',
      doctorName: '李医生',
      visitDate: '2025-09-20',
      diagnosis: '高血压复查',
      treatment: '调整用药'
    }
  ],
  recentReferrals: [
    {
      id: 1,
      fromHospital: '北京协和医院',
      toHospital: '北京大学第一医院',
      reason: '需要专科治疗',
      status: 'APPROVED',
      referralDate: '2025-09-21'
    }
  ]
};