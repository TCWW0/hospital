// Mock appointments API
export interface AppointmentOrder {
  orderId: string;
  patientId: string;
  patientSnapshot?: any;
  hospitalId: string;
  hospitalName?: string;
  doctorId: string;
  doctorName?: string;
  departmentId?: string;
  date: string;
  time: string;
  slotType: 'normal' | 'expert' | 'special';
  complaint?: string;
  payment: { method: string | null; status: 'pending' | 'paid' | 'refunded' | 'none' };
  status: 'pending' | 'paid' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  voucher?: { code: string; instructions?: string };
}

const ORDERS: AppointmentOrder[] = [
  {
    orderId: 'ap_sample1', patientId: 'p1', patientSnapshot: null, hospitalId: 'h1', hospitalName: '北京协和医院', doctorId: 'doc1', doctorName: '张医生', departmentId: 'd-nei', date: new Date().toISOString().slice(0,10), time: '09:00-10:00', slotType: 'normal', complaint: '头痛发热', payment: { method: 'wechat', status: 'paid' }, status: 'paid', createdAt: new Date().toISOString(), voucher: { code: 'VCHR1', instructions: '请提前15分钟到窗口取号' }
  },
  {
    orderId: 'ap_sample2', patientId: 'p2', patientSnapshot: null, hospitalId: 'h1', hospitalName: '北京协和医院', doctorId: 'doc2', doctorName: '李医生', departmentId: 'd-waike', date: new Date(new Date().setDate(new Date().getDate()+3)).toISOString().slice(0,10), time: '13:30-14:30', slotType: 'expert', complaint: '皮肤过敏', payment: { method: 'alipay', status: 'pending' }, status: 'pending', createdAt: new Date().toISOString(), voucher: { code: 'VCHR2', instructions: '凭证请保留' }
  },
  {
    orderId: 'ap_sample3', patientId: 'p3', patientSnapshot: null, hospitalId: 'h2', hospitalName: '海淀区人民医院', doctorId: 'doc3', doctorName: '王医生', departmentId: 'd-children', date: new Date(new Date().setDate(new Date().getDate()-5)).toISOString().slice(0,10), time: '16:00-17:00', slotType: 'special', complaint: '儿童发热', payment: { method: null, status: 'none' }, status: 'completed', createdAt: new Date().toISOString(), voucher: { code: 'VCHR3', instructions: '已完成就诊' }
  }
  ,
  {
    orderId: 'ap_sample4', patientId: 'p1', patientSnapshot: null, hospitalId: 'h3', hospitalName: '朝阳区中心医院', doctorId: 'doc4', doctorName: '赵医生', departmentId: 'd-ent', date: new Date(new Date().setDate(new Date().getDate()+1)).toISOString().slice(0,10), time: '10:00-11:00', slotType: 'normal', complaint: '耳鸣', payment: { method: 'wechat', status: 'paid' }, status: 'paid', createdAt: new Date().toISOString(), voucher: { code: 'VCHR4', instructions: '请携带病例复印件' }
  },
  {
    orderId: 'ap_sample5', patientId: 'p2', patientSnapshot: null, hospitalId: 'h1', hospitalName: '北京协和医院', doctorId: 'doc5', doctorName: '陈医生', departmentId: 'd-cardiology', date: new Date(new Date().setDate(new Date().getDate()+7)).toISOString().slice(0,10), time: '15:00-15:30', slotType: 'expert', complaint: '心悸', payment: { method: 'alipay', status: 'pending' }, status: 'pending', createdAt: new Date().toISOString(), voucher: { code: 'VCHR5', instructions: '请按预约时间到门诊' }
  },
  {
    orderId: 'ap_sample6', patientId: 'p4', patientSnapshot: null, hospitalId: 'h2', hospitalName: '海淀区人民医院', doctorId: 'doc6', doctorName: '孙医生', departmentId: 'd-ortho', date: new Date(new Date().setDate(new Date().getDate()-10)).toISOString().slice(0,10), time: '11:00-11:30', slotType: 'normal', complaint: '腰痛', payment: { method: null, status: 'none' }, status: 'completed', createdAt: new Date().toISOString(), voucher: { code: 'VCHR6', instructions: '已完成就诊' }
  }
];

function genId(prefix='o') { return prefix + Math.random().toString(36).slice(2,9); }

export async function createAppointment(payload: Partial<AppointmentOrder>): Promise<AppointmentOrder> {
  const order: AppointmentOrder = {
    orderId: genId('ap'),
    patientId: payload.patientId || 'p1',
    patientSnapshot: null,
    hospitalId: payload.hospitalId || 'h1',
    hospitalName: payload.hospitalName || '示例医院',
    doctorId: payload.doctorId || 'doc1',
    doctorName: payload.doctorName || '示例医生',
    departmentId: payload.departmentId || 'd-nei',
    date: payload.date || new Date().toISOString().slice(0,10),
    time: payload.time || '09:00-10:00',
    slotType: payload.slotType || 'normal',
    complaint: payload.complaint || '',
    payment: { method: payload.payment?.method || null, status: 'pending' },
    status: 'pending',
    createdAt: new Date().toISOString(),
    voucher: { code: Math.random().toString(36).slice(2,8).toUpperCase(), instructions: '请携带病历卡到门诊一楼挂号处' }
  } as AppointmentOrder;
  ORDERS.unshift(order);
  return new Promise(resolve => setTimeout(() => resolve({ ...order }), 160));
}

export async function fetchAppointments(userId?: string): Promise<AppointmentOrder[]> {
  // ignore userId filter in mock but reference param to avoid diagnostics
  void userId;
  return new Promise(resolve => setTimeout(() => resolve(ORDERS.map(o => ({ ...o }))), 120));
}

export async function cancelAppointment(orderId: string, reason?: string): Promise<{ success: boolean; refunded?: boolean }> {
  // reference reason to avoid unused param diagnostics
  void reason;
  const idx = ORDERS.findIndex(o => o.orderId === orderId);
  if (idx === -1) return { success: false };
  const ord = ORDERS[idx];
  if (!ord) return { success: false };
  ord.status = 'cancelled';
  if (ord.payment) ord.payment.status = 'refunded';
  return new Promise(resolve => setTimeout(() => resolve({ success: true, refunded: true }), 200));
}
