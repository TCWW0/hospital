// Mock patient data for prototype
export interface PatientSummary {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  phone?: string;
  lastVisit?: string; // ISO date
  department?: string;
  triage: 'high' | 'medium' | 'low';
  status: 'ongoing' | 'completed'; // 新增：就诊状态
  unreadMessages?: number;
}

const patients: PatientSummary[] = [
  { id: 'p1', name: '张三', age: 45, gender: 'M', phone: '13800000001', lastVisit: '2025-09-18T10:00:00Z', department: '内科', triage: 'high', status: 'ongoing', unreadMessages: 2 },
  { id: 'p2', name: '李四', age: 32, gender: 'F', phone: '13800000002', lastVisit: '2025-09-15T09:30:00Z', department: '外科', triage: 'medium', status: 'completed', unreadMessages: 0 },
  { id: 'p3', name: '王五', age: 67, gender: 'M', phone: '13800000003', lastVisit: '2025-09-10T14:20:00Z', department: '内科', triage: 'low', status: 'ongoing', unreadMessages: 1 },
  { id: 'p4', name: '赵六', age: 53, gender: 'F', phone: '13800000004', lastVisit: '2025-09-19T11:45:00Z', department: '皮肤科', triage: 'high', status: 'completed', unreadMessages: 5 },
  { id: 'p5', name: '钱七', age: 29, gender: 'M', phone: '13800000005', lastVisit: '2025-09-11T08:20:00Z', department: '儿科', triage: 'medium', status: 'ongoing', unreadMessages: 0 },
];

export function fetchPatients(_managedBy?: string) {
  // In real API, `_managedBy` filters by doctor id. Here ignore and return all.
  return new Promise<PatientSummary[]>((resolve) => {
    setTimeout(() => resolve(patients), 300);
  });
}

export function fetchPatientById(id: string) {
  return new Promise<PatientSummary | null>((resolve) => {
    setTimeout(() => {
      const p = patients.find(x => x.id === id) || null;
      resolve(p);
    }, 200);
  });
}
