// Mock telemedicine applications for prototype
export interface TelemedicineApp {
  id: string;
  patientId: string;
  patientName?: string;
  description?: string;
  attachments?: string[]; // placeholder
  preferredMethod?: 'phone' | 'video';
  preferredTime?: string;
  status: 'pending' | 'scheduled' | 'completed' | 'rejected';
  assignedDoctor?: string;
  createdAt: string;
  note?: string;
}

const APPS: TelemedicineApp[] = [];

function genId(prefix = 't') { return prefix + Math.random().toString(36).slice(2,9); }

export async function createTelemedicineApplication(payload: Partial<TelemedicineApp>): Promise<TelemedicineApp> {
  const app: TelemedicineApp = {
    id: genId('tm'),
    patientId: payload.patientId || 'p1',
    patientName: payload.patientName || '示例患者',
    description: payload.description || '',
    attachments: payload.attachments || [],
    preferredMethod: payload.preferredMethod || 'phone',
    preferredTime: payload.preferredTime || '',
    status: 'pending',
    assignedDoctor: payload.assignedDoctor || undefined,
    createdAt: new Date().toISOString(),
    note: payload.note || undefined,
  };
  APPS.unshift(app);
  return new Promise(resolve => setTimeout(() => resolve({ ...app }), 160));
}

export async function fetchTelemedicineApplications(patientId?: string): Promise<TelemedicineApp[]> {
  // if patientId provided, filter; otherwise return all
  const list = patientId ? APPS.filter(a => a.patientId === patientId) : APPS.slice();
  return new Promise(resolve => setTimeout(() => resolve(list.map(a => ({ ...a }))), 120));
}

export async function fetchTelemedicineForDoctor(doctorId: string): Promise<TelemedicineApp[]> {
  // return assigned to this doctor or pending
  const list = APPS.filter(a => a.status === 'pending' || a.assignedDoctor === doctorId);
  return new Promise(resolve => setTimeout(() => resolve(list.map(a => ({ ...a }))), 120));
}

export async function updateTelemedicineStatus(id: string, status: TelemedicineApp['status'], note?: string, assignedDoctor?: string): Promise<TelemedicineApp | null> {
  const idx = APPS.findIndex(a => a.id === id);
  if (idx === -1) return new Promise(resolve => setTimeout(() => resolve(null), 120));
  const app = APPS[idx]!;
  app.status = status;
  if (note) app.note = note;
  if (assignedDoctor) app.assignedDoctor = assignedDoctor;
  return new Promise(resolve => setTimeout(() => resolve({ ...app } as TelemedicineApp), 120));
}
