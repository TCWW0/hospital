export interface ReferralSummary {
  id: string;
  patientName: string;
  patientId?: string;
  fromHospital: string;
  toHospital: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  direction?: 'inbound' | 'outbound'; // inbound: from other hospital to current
  note?: string; // processing note or request note
  handledBy?: string;
  handledAt?: string;
}

const SAMPLE: ReferralSummary[] = [
  { id: 'r1', patientId: 'p1', patientName: '张三', fromHospital: '北京协和医院', toHospital: '北京同仁医院', status: 'pending', createdAt: '2025-09-10', direction: 'outbound' },
  { id: 'r2', patientId: 'p2', patientName: '李四', fromHospital: '外院 - 天津市医院', toHospital: '北京协和医院', status: 'accepted', createdAt: '2025-09-09', direction: 'inbound', note: '已预约会诊', handledBy: 'doctor1', handledAt: '2025-09-09' },
  { id: 'r3', patientId: 'p3', patientName: '王五', fromHospital: '北京协和医院', toHospital: '北京大学人民医院', status: 'rejected', createdAt: '2025-09-08', direction: 'outbound', note: '病情不适合转诊', handledBy: 'doctor2', handledAt: '2025-09-08' },
  { id: 'r4', patientId: 'p4', patientName: '赵六', fromHospital: '北京协和医院', toHospital: '北京安贞医院', status: 'pending', createdAt: '2025-09-07', direction: 'outbound' },
  { id: 'r5', patientId: 'p5', patientName: '钱七', fromHospital: '外院 - 河北医大', toHospital: '北京协和医院', status: 'pending', createdAt: '2025-09-06', direction: 'inbound' }
];

export interface ReferralQuery {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: 'pending' | 'accepted' | 'rejected' | 'all';
}

export interface ReferralListResult {
  items: ReferralSummary[];
  total: number;
}

function applyFilter(list: ReferralSummary[], q?: string, status?: string) {
  let res = list.slice();
  if (q) {
    const s = q.toLowerCase();
    res = res.filter(r => (r.patientName || '').toLowerCase().includes(s) || (r.fromHospital || '').toLowerCase().includes(s) || (r.toHospital || '').toLowerCase().includes(s));
  }
  if (status && status !== 'all') {
    res = res.filter(r => r.status === status);
  }
  return res;
}

export async function fetchReferrals(query: ReferralQuery = {}): Promise<ReferralListResult> {
  const { page = 1, pageSize = 10, q, status } = query;
  let filtered = applyFilter(SAMPLE, q, status as string | undefined);
  // sort: pending first, then accepted, then rejected; within each group sort by createdAt desc
  const order = { pending: 0, accepted: 1, rejected: 2 } as Record<string, number>;
  filtered.sort((a, b) => {
    const pa = order[a.status] ?? 3;
    const pb = order[b.status] ?? 3;
    if (pa !== pb) return pa - pb;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);
  return new Promise((resolve) => setTimeout(() => resolve({ items, total }), 150));
}

export async function fetchReferralById(id: string): Promise<ReferralSummary | null> {
  const found = SAMPLE.find(r => r.id === id);
  return new Promise((resolve) => setTimeout(() => resolve(found || null), 80));
}

export async function updateReferralStatus(id: string, status: ReferralSummary['status'], note?: string): Promise<ReferralSummary | null> {
  const idx = SAMPLE.findIndex(s => s.id === id);
  if (idx === -1) return new Promise((resolve) => setTimeout(() => resolve(null), 80));
  const found = SAMPLE[idx];
  if (!found) return new Promise((resolve) => setTimeout(() => resolve(null), 80));
  found.status = status;
  if (note) found.note = note;
  found.handledBy = 'doctor1';
  found.handledAt = new Date().toISOString().slice(0,10);
  const result: ReferralSummary = { ...found } as ReferralSummary;
  return new Promise((resolve) => setTimeout(() => resolve(result), 120));
}
