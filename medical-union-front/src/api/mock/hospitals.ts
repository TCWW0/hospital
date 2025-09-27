// Mock hospitals data and API for prototype
export interface HospitalSummary {
  id: string;
  name: string;
  level: '三级甲等' | '二级甲等' | '其他';
  region: string;
  shortIntro?: string;
  address?: string;
  phone?: string;
  rating?: number;
  departments?: { id: string; name: string }[];
  availableCount?: number;
}

export interface HospitalDetail extends HospitalSummary {
  fullIntro?: string;
}

const HOSPITALS: HospitalDetail[] = [
  {
    id: 'h1',
    name: '北京协和医院',
    level: '三级甲等',
    region: '北京市',
    shortIntro: '国内知名综合性医院',
    fullIntro: '北京协和医院简介：...（示例）',
    address: '北京市东城区xxx',
    phone: '010-12345678',
    rating: 4.8,
    departments: [
      { id: 'd-nei', name: '内科' },
      { id: 'd-waike', name: '外科' },
      { id: 'd-guke', name: '骨科' }
    ],
    availableCount: 12,
  },
  {
    id: 'h2',
    name: '海淀区人民医院',
    level: '二级甲等',
    region: '北京市',
    shortIntro: '社区综合医院',
    fullIntro: '海淀区人民医院简介：...（示例）',
    address: '北京市海淀区yyy',
    phone: '010-87654321',
    rating: 4.2,
    departments: [ { id: 'd-children', name: '儿科' } ],
    availableCount: 5,
  }
];

export interface HospitalQuery { page?: number; pageSize?: number; q?: string; region?: string; level?: string; departmentId?: string }

export interface HospitalListResult { items: HospitalSummary[]; total: number }

export async function fetchHospitals(query: HospitalQuery = {}): Promise<HospitalListResult> {
  const { page = 1, pageSize = 10, q, region, level, departmentId } = query;
  let list = HOSPITALS.slice();
  if (q) { const s = q.toLowerCase(); list = list.filter(h => h.name.toLowerCase().includes(s) || (h.shortIntro||'').toLowerCase().includes(s)); }
  if (region) list = list.filter(h => h.region === region);
  if (level) list = list.filter(h => h.level === level);
  if (departmentId) list = list.filter(h => (h.departments||[]).some(d => d.id === departmentId));
  const total = list.length;
  const start = (page - 1) * pageSize;
  const items = list.slice(start, start + pageSize).map(h => ({ ...h }));
  return new Promise(resolve => setTimeout(() => resolve({ items, total }), 120));
}

export async function fetchHospitalById(id: string): Promise<HospitalDetail | null> {
  const found = HOSPITALS.find(h => h.id === id) || null;
  return new Promise(resolve => setTimeout(() => resolve(found ? { ...found } : null), 80));
}
