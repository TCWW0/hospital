// Mock doctors data
export interface DoctorSummary {
  id: string;
  name: string;
  title: string; // 职称
  specialties: string[]; // 专业方向
  rating?: number;
  hospitalId?: string;
  departmentId?: string;
  avatar?: string; // 可选头像 URL（mock）
  intro?: string;
}

const DOCTORS: DoctorSummary[] = [
  { id: 'doc1', name: '王医生', title: '主任医师', specialties: ['心血管'], rating: 4.9, hospitalId: 'h1', departmentId: 'd-nei', avatar: 'https://i.pravatar.cc/160?u=doc1', intro: '王主任，心血管专家' },
  { id: 'doc2', name: '李医生', title: '副主任医师', specialties: ['普外'], rating: 4.5, hospitalId: 'h1', departmentId: 'd-waike', avatar: '', intro: '李医师，外科手术经验丰富' },
  { id: 'doc3', name: '赵医生', title: '主治医师', specialties: ['儿科'], rating: 4.3, hospitalId: 'h2', departmentId: 'd-children', avatar: 'https://i.pravatar.cc/160?u=doc3', intro: '儿科专长' }
];

export interface DoctorQuery { hospitalId?: string; departmentId?: string; q?: string; page?: number; pageSize?: number }
export interface DoctorListResult { items: DoctorSummary[]; total: number }

export async function fetchDoctors(query: DoctorQuery = {}): Promise<DoctorListResult> {
  const { hospitalId, departmentId, q, page = 1, pageSize = 10 } = query;
  let list = DOCTORS.slice();
  if (hospitalId) list = list.filter(d => d.hospitalId === hospitalId);
  if (departmentId) list = list.filter(d => d.departmentId === departmentId);
  if (q) { const s = q.toLowerCase(); list = list.filter(d => d.name.toLowerCase().includes(s) || (d.specialties||[]).join(' ').toLowerCase().includes(s)); }
  const total = list.length;
  const start = (page - 1) * pageSize;
  const items = list.slice(start, start + pageSize).map(d => ({ ...d }));
  return new Promise(resolve => setTimeout(() => resolve({ items, total }), 100));
}

export async function fetchDoctorById(id: string): Promise<DoctorSummary | null> {
  const found = DOCTORS.find(d => d.id === id) || null;
  return new Promise(resolve => setTimeout(() => resolve(found ? { ...found } : null), 80));
}
