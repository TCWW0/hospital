// Mock visits API for patient visit history
// Provides deterministic, paginated, time-sorted visit records

export type VisitType = '门诊' | '急诊' | '住院' | '复查';
export type VisitStatus = '已完成' | '进行中' | '已预约' | '已取消';

export interface VisitRecord {
  id: string;
  patientId: string;
  patientName?: string;
  hospitalId: string;
  hospitalName: string;
  department: string;
  doctorId: string;
  doctorName: string;
  doctorPhone?: string;
  diagnosis: string;
  illnessBrief?: string;
  visitType: VisitType;
  status: VisitStatus;
  startTime: string; // ISO string
  endTime?: string;  // ISO string
  cost?: number;     // RMB
  notes?: string;
  paymentMethod?: '微信' | '支付宝' | '银行卡' | '现金' | string;
  paymentCode?: string;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

// Utilities
function pad(n: number) { return n < 10 ? `0${n}` : `${n}`; }
function toISO(dt: Date) {
  const y = dt.getFullYear();
  const m = pad(dt.getMonth() + 1);
  const d = pad(dt.getDate());
  const hh = pad(dt.getHours());
  const mm = pad(dt.getMinutes());
  const ss = pad(dt.getSeconds());
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
}

// Seed data generators
const hospitals = [
  { id: 'h1', name: '北京协和医院' },
  { id: 'h2', name: '北京大学第一医院' },
  { id: 'h3', name: '北京天坛医院' },
  { id: 'h4', name: '中日友好医院' },
];

const departments = ['心内科', '消化内科', '神经内科', '骨科', '呼吸内科', '儿科', '妇产科'];
const doctors = ['李医生', '王医生', '张医生', '刘医生', '赵医生', '陈医生'];
const diagnoses = ['高血压复查', '胃炎随访', '偏头痛复诊', '骨折复查', '支气管炎', '体检', '糖尿病复查'];
const visitTypes: VisitType[] = ['门诊', '复查', '急诊', '住院'];
const statuses: VisitStatus[] = ['已完成', '进行中', '已预约', '已取消'];
const patientNames = ['张三', '李四', '王五', '赵六', '钱七', '孙八'];
const illnessBriefs = ['胃溃疡', '高血压', '糖尿病', '偏头痛', '骨关节炎', '支气管炎'];
const paymentMethods: Array<Required<VisitRecord>['paymentMethod']> = ['微信', '支付宝', '银行卡', '现金'];

// Deterministic pseudo-random helper
function pick<T>(arr: T[], seed: number) { return arr[seed % arr.length]; }

// Build 36 visits within last ~180 days
const now = Date.now();
const visitsData: VisitRecord[] = Array.from({ length: 36 }).map((_, i) => {
  const dayOffset = i * 5 + (i % 3); // spread out
  const start = new Date(now - dayOffset * 24 * 3600 * 1000 - (i % 5) * 3600 * 1000);
  const durationMin = 20 + (i % 6) * 15; // 20~95 minutes
  const end = new Date(start.getTime() + durationMin * 60 * 1000);
  const h = hospitals[i % hospitals.length]!; // non-null assertion since length>0
  const dept = pick(departments, i + 7);
  const doc = pick(doctors, i + 13);
  const diag = pick(diagnoses, i + 31);
  const vtype = pick(visitTypes, i + 19);
  const status = pick(statuses, i + 23);
  const cost = 20 + (i % 8) * 15 + (vtype === '住院' ? 600 : 0);
  const phone = `138-${pad((i % 1000)).padStart(3,'0')}-${pad(((i+37) % 10000)).padStart(4,'0')}`.replace(/-/g, '-');
  const pname = pick(patientNames, i + 5);
  const ibrief = pick(illnessBriefs, i + 9);
  const payMethod = pick(paymentMethods, i + 11);
  const payCode = `PAY-${(i + 1).toString().padStart(3,'0')}-${(2024 + (i%2)).toString().slice(-2)}${pad((i*7)%12+1)}${pad((i*11)%28+1)}`;

  return {
    id: `v${i + 1}`,
    patientId: 'p1',
    patientName: pname,
    hospitalId: h.id,
    hospitalName: '本院（示例）',
    department: dept,
    doctorId: `d${(i % 12) + 1}`,
    doctorName: doc,
    doctorPhone: phone,
    diagnosis: diag,
    illnessBrief: ibrief,
    visitType: vtype,
    status,
    startTime: toISO(start),
    endTime: toISO(end),
    cost,
    notes: '—',
    paymentMethod: payMethod,
    paymentCode: payCode
  } as VisitRecord;
});

const STATUS_PRIORITY: Record<VisitStatus, number> = {
  '进行中': 4,
  '已预约': 3,
  '已完成': 2,
  '已取消': 1,
};
const TYPE_PRIORITY: Record<VisitType, number> = {
  '急诊': 4,
  '住院': 3,
  '门诊': 2,
  '复查': 1,
};

function compareVisit(a: VisitRecord, b: VisitRecord) {
  const sp = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
  if (sp !== 0) return -sp; // higher first
  const tp = TYPE_PRIORITY[a.visitType] - TYPE_PRIORITY[b.visitType];
  if (tp !== 0) return -tp; // higher first
  // finally by time desc (nearer first)
  return a.startTime < b.startTime ? 1 : -1;
}

// Sort descending by composite priority
visitsData.sort(compareVisit);

export function fetchPatientVisits(params?: { page?: number; pageSize?: number; patientId?: string; type?: VisitType | ''; status?: VisitStatus | ''; statuses?: VisitStatus[]; range?: '' | '7d' | '30d'; }) {
  const page = Math.max(1, params?.page || 1);
  const pageSize = Math.max(1, params?.pageSize || 6);
  const pid = params?.patientId || 'p1';

  let all = visitsData.filter(v => v.patientId === pid);
  if (params?.type) all = all.filter(v => v.visitType === params.type);
  if (params?.status) all = all.filter(v => v.status === params.status);
  if (params?.statuses && params.statuses.length > 0) all = all.filter(v => params.statuses!.includes(v.status));
  if (params?.range) {
    const nowTs = Date.now();
    const delta = params.range === '7d' ? 7 : params.range === '30d' ? 30 : 0;
    if (delta > 0) {
      const threshold = nowTs - delta * 24 * 3600 * 1000;
      all = all.filter(v => new Date(v.startTime).getTime() >= threshold);
    }
  }
  all = all.slice().sort(compareVisit);
  const total = all.length;
  const startIdx = (page - 1) * pageSize;
  const items = all.slice(startIdx, startIdx + pageSize);

  return new Promise<PagedResult<VisitRecord>>((resolve) => {
    setTimeout(() => resolve({ items, page, pageSize, total }), 260);
  });
}

export function fetchPatientVisitById(id: string) {
  const v = visitsData.find(x => x.id === id) || null;
  return new Promise<VisitRecord | null>((resolve) => setTimeout(() => resolve(v ? { ...v } : null), 160));
}
