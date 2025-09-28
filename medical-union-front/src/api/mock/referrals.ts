export type ReferralStatus =
  | 'pending'
  | 'accepted'
  | 'outpatient-completed'
  | 'inpatient-completed'
  | 'followed-up'
  | 'rejected';

export interface ReferralAuditItem {
  step:
    | 'submitted'
    | 'patient-informed'
    | 'accepted'
    | 'rejected'
    | 'outpatient-completed'
    | 'inpatient-completed'
    | 'down-referral-submitted'
    | 'followed-up'
    | 'note';
  by: string;
  at: string;
  note?: string;
}

export interface ReferralOutpatientReport {
  diagnosis: string;
  treatment: string;
  advice: string;
  attachments: string[];
  completedAt: string;
}

export interface ReferralInpatientReport {
  admissionDate: string;
  dischargeDate?: string;
  summary?: string;
  advice?: string;
  attachments: string[];
}

export interface ReferralFollowUpRecord {
  doctorId: string;
  doctorName: string;
  visitedAt: string;
  remarks: string;
}

export interface PatientInstructionRecord {
  confirmedAt: string;
  notes?: string;
  doctorId?: string;
  doctorName?: string;
}

export interface DownReferralForm {
  type: 'outpatient' | 'inpatient';
  submittedAt: string;
  doctorName: string;
  doctorId?: string;
  diagnosisOrSummary: string;
  treatmentPlan: string;
  advice: string;
  attachments: string[];
}

export interface ReferralCase {
  id: string;
  patientId: string;
  patientName: string;
  fromHospital: string;
  toHospital: string;
  direction: 'inbound' | 'outbound';
  transferType: 'outpatient' | 'inpatient';
  tags: string[];
  attachments: string[];
  attentionNotes: string[];
  status: ReferralStatus;
  note?: string;
  handledBy?: string;
  handledAt?: string;
  submittedById?: string;
  submittedByName?: string;
  submitterRole?: 'community-doctor' | 'hospital-doctor';
  treatmentPlan?: ReferralOutpatientReport;
  inpatientReport?: ReferralInpatientReport;
  informedPatient?: PatientInstructionRecord;
  downReferral?: DownReferralForm;
  followUps?: ReferralFollowUpRecord[];
  auditTrail: ReferralAuditItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateReferralPayload {
  patientId: string;
  patientName: string;
  fromHospital: string;
  toHospital: string;
  direction: 'inbound' | 'outbound';
  transferType: 'outpatient' | 'inpatient';
  tags?: string[];
  attachments?: string[];
  attentionNotes?: string[];
  note?: string;
  submittedById?: string;
  submittedByName?: string;
  submitterRole?: 'community-doctor' | 'hospital-doctor';
}

export interface ReferralQuery {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: ReferralStatus | 'all';
  direction?: 'inbound' | 'outbound';
  transferType?: 'outpatient' | 'inpatient';
  patientId?: string;
}

export interface ReferralListResult {
  items: ReferralCase[];
  total: number;
}

const STORAGE_KEY = 'medical_union_referrals_v2';

const seedReferrals: ReferralCase[] = [
  {
    id: 'r-up-001',
    patientId: 'p1',
    patientName: '张三',
    fromHospital: '朝阳社区卫生服务中心',
    toHospital: '北京协和医院内分泌科',
    direction: 'outbound',
    transferType: 'outpatient',
    tags: ['糖尿病', '血糖控制'],
    attachments: ['lab-20250910.pdf', 'med-history-202508.csv'],
    attentionNotes: ['请患者空腹前往门诊', '携带现用药物清单'],
    status: 'outpatient-completed',
    note: '患者长期血糖控制不佳，请安排专科评估。',
    handledBy: '郭毅',
    handledAt: '2025-09-10T16:20:00Z',
    submittedById: 'doctor.community01',
    submittedByName: '李责任',
    submitterRole: 'community-doctor',
    informedPatient: {
      confirmedAt: '2025-09-09T08:40:00Z',
      notes: '已向患者及家属说明转诊注意事项并交付随访手册'
    },
    treatmentPlan: {
      diagnosis: '2 型糖尿病伴周围神经病变',
      treatment: '调整胰岛素剂量，增加舍曲林辅助疗法',
      advice: '2 周后回社区复诊，监测空腹血糖并记录。',
      attachments: ['plan-20250912.pdf'],
      completedAt: '2025-09-12T09:45:00Z'
    },
    downReferral: {
      type: 'outpatient',
      submittedAt: '2025-09-12T09:50:00Z',
      doctorName: '郭毅',
      doctorId: 'doctor.he001',
      diagnosisOrSummary: '2 型糖尿病伴周围神经病变',
      treatmentPlan: '调整胰岛素剂量，增加舍曲林辅助疗法',
      advice: '2 周后回社区复诊，监测空腹血糖并记录。',
      attachments: ['plan-20250912.pdf']
    },
    auditTrail: [
      { step: 'submitted', by: '李责任（社区）', at: '2025-09-09T08:30:00Z', note: '初诊空腹血糖 12.5mmol/L。' },
      { step: 'patient-informed', by: '李责任（社区）', at: '2025-09-09T08:40:00Z', note: '已完成患者宣教并提交注意事项。' },
      { step: 'accepted', by: '郭毅（协和内分泌）', at: '2025-09-10T08:10:00Z', note: '安排 9 月 12 日门诊。' },
      { step: 'outpatient-completed', by: '郭毅（协和内分泌）', at: '2025-09-12T09:50:00Z', note: '完成门诊评估并更新处方。' },
      { step: 'down-referral-submitted', by: '郭毅（协和内分泌）', at: '2025-09-12T09:50:00Z', note: '门诊下转单已提交社区跟进。' },
      { step: 'followed-up', by: '李责任（社区）', at: '2025-09-20T07:30:00Z', note: '患者血糖下降至 8.2mmol/L。' }
    ],
    followUps: [
      {
        doctorId: 'doctor.community01',
        doctorName: '李责任',
        visitedAt: '2025-09-20T07:30:00Z',
        remarks: '患者自述饮食控制改善，遵医嘱情况良好。'
      }
    ],
    createdAt: '2025-09-09T08:30:00Z',
    updatedAt: '2025-09-20T07:30:00Z'
  },
  {
    id: 'r-in-002',
    patientId: 'p2',
    patientName: '李四',
    fromHospital: '外院-天津市第一中心医院',
    toHospital: '北京协和医院心内科',
    direction: 'inbound',
    transferType: 'inpatient',
    tags: ['心衰', '高血压'],
    attachments: ['echo-20250905.mp4', 'lab-ntprobnp.pdf'],
    attentionNotes: ['转运时需吸氧', '携带原院出院记录'],
    status: 'inpatient-completed',
    note: '患者出现反复胸闷，疑似加重。',
    handledBy: '王心安',
    handledAt: '2025-09-08T10:00:00Z',
    submittedById: 'doctor.he-temp',
    submittedByName: '赵诚',
    submitterRole: 'hospital-doctor',
    inpatientReport: {
      admissionDate: '2025-09-08',
      dischargeDate: '2025-09-18',
      summary: '入院后给予利尿、扩血管治疗，症状改善，心超复查左室射血分数 45%。',
      advice: '继续口服依那普利，1 周内回社区复诊；如再现胸闷立即就医。',
      attachments: ['discharge-summary-20250918.pdf']
    },
    downReferral: {
      type: 'inpatient',
      submittedAt: '2025-09-18T17:20:00Z',
      doctorName: '王心安',
      doctorId: 'doctor.he002',
      diagnosisOrSummary: '心衰住院诊疗总结',
      treatmentPlan: '维持利尿扩血管治疗，优化心衰管理方案',
      advice: '继续口服依那普利，1 周内回社区复诊；如再现胸闷立即就医。',
      attachments: ['discharge-summary-20250918.pdf']
    },
    auditTrail: [
      { step: 'submitted', by: '赵诚（天津一中心）', at: '2025-09-07T11:20:00Z', note: '上传外院资料。' },
      { step: 'accepted', by: '王心安（协和心内）', at: '2025-09-08T09:10:00Z', note: '安排心内科住院床位。' },
      { step: 'inpatient-completed', by: '王心安（协和心内）', at: '2025-09-18T17:20:00Z', note: '患者病情稳定，拟下转社区管理。' },
      { step: 'down-referral-submitted', by: '王心安（协和心内）', at: '2025-09-18T17:20:00Z', note: '住院下转材料已上交社区。' }
    ],
    createdAt: '2025-09-07T11:20:00Z',
    updatedAt: '2025-09-18T17:20:00Z'
  },
  {
    id: 'r-up-003',
    patientId: 'p3',
    patientName: '王五',
    fromHospital: '海淀社区卫生服务中心',
    toHospital: '北京大学人民医院呼吸科',
    direction: 'outbound',
    transferType: 'outpatient',
    tags: ['慢性咳嗽'],
    attachments: ['xray-20250901.jpg'],
    attentionNotes: ['提醒患者携带 CT 影像光盘'],
    status: 'pending',
    note: '怀疑支气管扩张，需要进一步确诊。',
    submittedById: 'doctor.community02',
    submittedByName: '陈晓',
    submitterRole: 'community-doctor',
    auditTrail: [
      { step: 'submitted', by: '陈晓（海淀社区）', at: '2025-09-11T09:00:00Z', note: '患者夜间咳嗽加重。' }
    ],
    createdAt: '2025-09-11T09:00:00Z',
    updatedAt: '2025-09-11T09:00:00Z'
  }
];

function clone<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

const hasWindow = typeof window !== 'undefined';

function loadStore(): ReferralCase[] {
  if (!hasWindow) {
    return clone(seedReferrals);
  }
  const cached = window.localStorage.getItem(STORAGE_KEY);
  if (!cached) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seedReferrals));
    return clone(seedReferrals);
  }
  try {
    const parsed = JSON.parse(cached) as ReferralCase[];
    if (!Array.isArray(parsed) || !parsed.length) throw new Error('invalid cache');
    return clone(parsed);
  } catch (_err) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seedReferrals));
    return clone(seedReferrals);
  }
}

let referrals = loadStore();

function persist() {
  if (hasWindow) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(referrals));
  }
}

function generateReferralId() {
  return `r-${Math.random().toString(36).slice(2, 9)}`;
}

function matchesSearch(item: ReferralCase, keyword?: string) {
  if (!keyword) return true;
  const value = keyword.toLowerCase();
  return (
    item.patientName.toLowerCase().includes(value) ||
    item.fromHospital.toLowerCase().includes(value) ||
    item.toHospital.toLowerCase().includes(value) ||
    item.tags.some(tag => tag.toLowerCase().includes(value))
  );
}

function withinFilters(item: ReferralCase, query: ReferralQuery) {
  if (query.status && query.status !== 'all' && item.status !== query.status) return false;
  if (query.direction && item.direction !== query.direction) return false;
  if (query.transferType && item.transferType !== query.transferType) return false;
  if (query.patientId && item.patientId !== query.patientId) return false;
  return true;
}

function sortReferrals(list: ReferralCase[]) {
  const order: Record<ReferralStatus, number> = {
    pending: 0,
    accepted: 1,
    'outpatient-completed': 2,
    'inpatient-completed': 2,
    'followed-up': 3,
    rejected: 4
  };
  return list
    .slice()
    .sort((a, b) => {
      const oa = order[a.status];
      const ob = order[b.status];
      if (oa !== ob) return oa - ob;
      const timeA = new Date(a.updatedAt || a.createdAt).getTime();
      const timeB = new Date(b.updatedAt || b.createdAt).getTime();
      if (timeA !== timeB) return timeB - timeA;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
}

export async function fetchReferrals(query: ReferralQuery = {}): Promise<ReferralListResult> {
  const { page = 1, pageSize = 10, q } = query;
  const filtered = referrals.filter(item => withinFilters(item, query) && matchesSearch(item, q));
  const sorted = sortReferrals(filtered);
  const total = sorted.length;
  const start = (page - 1) * pageSize;
  const items = sorted.slice(start, start + pageSize).map(clone);
  return new Promise(resolve => setTimeout(() => resolve({ items, total }), 120));
}

export async function fetchReferralById(id: string): Promise<ReferralCase | null> {
  const found = referrals.find(item => item.id === id);
  return new Promise(resolve => setTimeout(() => resolve(found ? clone(found) : null), 80));
}

export async function createReferral(payload: CreateReferralPayload): Promise<ReferralCase> {
  const now = new Date().toISOString();
  const tags = (payload.tags || []).map(tag => tag.trim()).filter(tag => tag.length > 0);
  const attentionNotes = (payload.attentionNotes || []).map(note => note.trim()).filter(note => note.length > 0);
  const attachments = (payload.attachments || []).slice();
  const note = payload.note?.trim();
  const submitterName = payload.submittedByName?.trim();
  const submitterId = payload.submittedById?.trim();
  const referral: ReferralCase = {
    id: generateReferralId(),
    patientId: payload.patientId || 'unknown',
    patientName: payload.patientName || '未命名患者',
    fromHospital: payload.fromHospital || '未知医院',
    toHospital: payload.toHospital || '未知医院',
    direction: payload.direction || 'outbound',
    transferType: payload.transferType || 'outpatient',
    tags,
    attachments,
    attentionNotes,
    status: 'pending',
    note: note && note.length ? note : undefined,
    submittedById: submitterId,
    submittedByName: submitterName,
    submitterRole: payload.submitterRole,
    auditTrail: [
      {
    step: 'submitted',
    by: submitterName || submitterId || '提交医生',
    at: now,
    note: note
      }
    ],
    createdAt: now,
    updatedAt: now
  };
  referrals.unshift(referral);
  persist();
  return new Promise(resolve => setTimeout(() => resolve(clone(referral)), 120));
}

export async function updateReferralStatus(
  id: string,
  status: ReferralStatus,
  note?: string,
  handledBy = 'doctor.current'
): Promise<ReferralCase | null> {
  const found = referrals.find(item => item.id === id);
  if (!found) return new Promise(resolve => setTimeout(() => resolve(null), 80));
  const now = new Date().toISOString();
  found.status = status;
  found.note = note ?? found.note;
  found.handledBy = handledBy;
  found.handledAt = now;
  found.updatedAt = now;
  found.auditTrail.push({ step: status as ReferralAuditItem['step'], by: handledBy, at: now, note });
  persist();
  return new Promise(resolve => setTimeout(() => resolve(clone(found)), 120));
}

export async function attachTreatmentReport(
  id: string,
  report: {
    type: 'outpatient' | 'inpatient';
    payload: ReferralOutpatientReport | ReferralInpatientReport;
    handledBy?: string;
    handledById?: string;
    downReferral?: {
      diagnosisOrSummary?: string;
      treatmentPlan?: string;
      advice?: string;
      attachments?: string[];
    };
  }
): Promise<ReferralCase | null> {
  const found = referrals.find(item => item.id === id);
  if (!found) return new Promise(resolve => setTimeout(() => resolve(null), 80));
  const now = new Date().toISOString();
  const handler = report.handledBy || 'doctor.current';
  const handlerId = report.handledById;
  const downReferralInput = report.downReferral || {};
  if (report.type === 'outpatient') {
    found.treatmentPlan = report.payload as ReferralOutpatientReport;
    found.status = 'outpatient-completed';
    found.auditTrail.push({ step: 'outpatient-completed', by: handler, at: now, note: '门诊诊疗完成' });
  } else {
    found.inpatientReport = report.payload as ReferralInpatientReport;
    found.status = 'inpatient-completed';
    found.auditTrail.push({ step: 'inpatient-completed', by: handler, at: now, note: '住院诊疗完成' });
  }
  const diagnosisOrSummary =
    downReferralInput.diagnosisOrSummary ||
    (report.type === 'outpatient'
      ? (report.payload as ReferralOutpatientReport).diagnosis
      : (report.payload as ReferralInpatientReport).summary || '住院诊疗总结');
  const treatmentPlan =
    downReferralInput.treatmentPlan ||
    (report.type === 'outpatient'
      ? (report.payload as ReferralOutpatientReport).treatment
      : '继续依医嘱治疗');
  const advice =
    downReferralInput.advice ||
    (report.type === 'outpatient'
      ? (report.payload as ReferralOutpatientReport).advice
      : (report.payload as ReferralInpatientReport).advice || '请社区继续随访');
  const attachments = downReferralInput.attachments ||
    (report.type === 'outpatient'
      ? (report.payload as ReferralOutpatientReport).attachments
      : (report.payload as ReferralInpatientReport).attachments || []);

  found.downReferral = {
    type: report.type,
    submittedAt: now,
    doctorName: handler,
    doctorId: handlerId,
    diagnosisOrSummary,
    treatmentPlan,
    advice,
    attachments
  };
  found.auditTrail.push({
    step: 'down-referral-submitted',
    by: handler,
    at: now,
    note: `已提交${report.type === 'outpatient' ? '门诊' : '住院'}下转单`
  });
  found.handledBy = handler;
  found.handledAt = now;
  found.updatedAt = now;
  persist();
  return new Promise(resolve => setTimeout(() => resolve(clone(found)), 120));
}

export async function recordPatientInstruction(
  id: string,
  instruction: PatientInstructionRecord
): Promise<ReferralCase | null> {
  const found = referrals.find(item => item.id === id);
  if (!found) return new Promise(resolve => setTimeout(() => resolve(null), 80));
  const name = instruction.doctorName || instruction.doctorId || '责任医生';
  const timestamp = instruction.confirmedAt || new Date().toISOString();
  found.informedPatient = {
    ...instruction,
    confirmedAt: timestamp,
    doctorName: name
  };
  found.auditTrail.push({
    step: 'patient-informed',
    by: name,
    at: timestamp,
    note: instruction.notes
  });
  found.updatedAt = timestamp;
  persist();
  return new Promise(resolve => setTimeout(() => resolve(clone(found)), 120));
}

export async function recordFollowUp(
  id: string,
  followUp: ReferralFollowUpRecord
): Promise<ReferralCase | null> {
  const found = referrals.find(item => item.id === id);
  if (!found) return new Promise(resolve => setTimeout(() => resolve(null), 80));
  const visitedAt = followUp.visitedAt || new Date().toISOString();
  const doctorName = followUp.doctorName || followUp.doctorId || '社区医生';
  if (!found.followUps) {
    found.followUps = [];
  }
  found.followUps.push({
    ...followUp,
    doctorName,
    visitedAt
  });
  found.status = 'followed-up';
  found.updatedAt = visitedAt;
  found.auditTrail.push({
    step: 'followed-up',
    by: doctorName,
    at: visitedAt,
    note: followUp.remarks
  });
  persist();
  return new Promise(resolve => setTimeout(() => resolve(clone(found)), 120));
}

export async function exportReferral(id: string): Promise<string | null> {
  const found = referrals.find(item => item.id === id);
  if (!found) return new Promise(resolve => setTimeout(() => resolve(null), 60));
  const lines: string[] = [];
  lines.push(`患者：${found.patientName}`);
  lines.push(`转诊方向：${found.direction === 'outbound' ? '上转' : '下转'}`);
  lines.push(`类型：${found.transferType === 'outpatient' ? '门诊' : '住院'}`);
  lines.push(`来源医院：${found.fromHospital}`);
  lines.push(`目标医院：${found.toHospital}`);
  lines.push(`注意事项：${found.attentionNotes.join('；') || '无'}`);
  if (found.treatmentPlan) {
    lines.push('— 门诊反馈 —');
    lines.push(`诊断：${found.treatmentPlan.diagnosis}`);
    lines.push(`治疗：${found.treatmentPlan.treatment}`);
    lines.push(`建议：${found.treatmentPlan.advice}`);
  }
  if (found.inpatientReport) {
    lines.push('— 住院反馈 —');
    lines.push(`入院时间：${found.inpatientReport.admissionDate}`);
    lines.push(`出院时间：${found.inpatientReport.dischargeDate ?? '未出院'}`);
    lines.push(`总结：${found.inpatientReport.summary ?? '—'}`);
    lines.push(`建议：${found.inpatientReport.advice ?? '—'}`);
  }
  if (found.downReferral) {
    lines.push('— 下转交接 —');
    lines.push(`提交人：${found.downReferral.doctorName}`);
    lines.push(`诊疗总结：${found.downReferral.diagnosisOrSummary}`);
    lines.push(`治疗方案：${found.downReferral.treatmentPlan}`);
    lines.push(`继续医嘱：${found.downReferral.advice}`);
  }
  if (found.followUps && found.followUps.length) {
    lines.push('— 社区随访 —');
    found.followUps.forEach((item, index) => {
      lines.push(`随访 ${index + 1}：${item.doctorName || item.doctorId}`);
      lines.push(`时间：${new Date(item.visitedAt).toLocaleString()}`);
      lines.push(`记录：${item.remarks}`);
    });
  }
  return new Promise(resolve => setTimeout(() => resolve(lines.join('\n')), 60));
}
