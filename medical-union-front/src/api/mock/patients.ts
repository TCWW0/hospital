// Mock patient data for prototype
// Simplified mock patient data used by the front-end demo
export interface PatientSummary {
  id: string;
  name: string;
  phone?: string;
  relation?: string; // 与本人关系
}

const patients: PatientSummary[] = [
  { id: 'p1', name: '张三', phone: '13800000001', relation: '本人' },
  { id: 'p2', name: '李四', phone: '13800000002', relation: '配偶' },
  { id: 'p3', name: '王五', phone: '13800000003', relation: '子女' },
];

export function fetchPatients(_managedBy?: string) {
  // In real API, `_managedBy` filters by doctor id. Here ignore and return all.
  return new Promise<PatientSummary[]>((resolve) => {
    setTimeout(() => resolve(patients.map(p => ({ ...p }))), 200);
  });
}

export function fetchPatientById(id: string) {
  return new Promise<PatientSummary | null>((resolve) => {
    setTimeout(() => {
      const p = patients.find(x => x.id === id) || null;
      resolve(p ? { ...p } : null);
    }, 120);
  });
}
