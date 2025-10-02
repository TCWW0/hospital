import type {
  AssignPayload,
  CreateTelemedicinePayload,
  ExpertSummary,
  FeedbackPayload,
  ReportPayload,
  TelemedicineApp,
  TelemedicineDiagnosisAccess,
  TelemedicineFilters,
  TelemedicineHistoryEntry,
  PatientConfirmPayload
} from './telemedicine.types';

export type {
  TelemedicineMethod,
  TelemedicineStatus,
  TelemedicineServiceType,
  TelemedicineSupportTag,
  TelemedicineServiceStage,
  TelemedicineSchedule,
  TelemedicineReport,
  TelemedicineServiceEvaluation,
  TelemedicineFeedback,
  TelemedicineHistoryEntry,
  TelemedicineDiagnosisAccess,
  TelemedicinePatientConfirmation,
  TelemedicineApp,
  AssignPayload,
  ReportPayload,
  FeedbackPayload,
  TelemedicineFilters,
  ExpertSummary,
  CreateTelemedicinePayload,
  PatientConfirmPayload
} from './telemedicine.types';

import { addApp, ensureSeedApps, findApp, getAppsSnapshot, updateApp } from './telemedicine.repository';

// Telemedicine mock API for rapid prototyping

const EXPERTS: ExpertSummary[] = [
  { id: 'exp-001', name: '周兰', specialty: '心内科', hospital: '市人民医院' },
  { id: 'exp-002', name: '李青', specialty: '呼吸科', hospital: '省立医院' },
  { id: 'exp-003', name: '王强', specialty: '神经内科', hospital: '协和医院' }
];

function genId(prefix = 'tm') {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function pushHistory(app: TelemedicineApp, entry: Omit<TelemedicineHistoryEntry, 'at'>) {
  app.history.unshift({ ...entry, at: new Date().toISOString() });
}

const SEED_SIGNATURE = 'telemedicine-seed-v1';

function buildSeedApps(): TelemedicineApp[] {
  const now = new Date();
  const doctorName = '李医生';
  const doctorHospital = '朝阳社区卫生服务中心';

  function hours(offset: number) {
    return new Date(now.getTime() + offset * 60 * 60 * 1000).toISOString();
  }

  const inConsult: TelemedicineApp = {
    id: 'seed-in-progress',
    patientId: 'p1',
    patientName: '张三',
    description: '胸闷气短三天，既往有高血压史，需要心内科专家协同评估远程治疗方案。',
    attachments: ['血压记录.pdf'],
    preferredMethod: 'video',
    preferredTime: '2025-09-28 15:00',
    serviceType: 'video_consult',
    supportTags: ['cloud_imaging', 'multidisciplinary'],
    status: 'scheduled',
    serviceStage: 'in_consult',
    createdAt: hours(-12),
    createdByDoctorId: 'doc-001',
    createdByDoctorName: doctorName,
    createdByDoctorHospital: doctorHospital,
    assignedExpertId: 'exp-001',
    assignedExpertName: '周兰',
    schedule: {
      scheduledAt: hours(2),
      method: 'video',
      meetingUrl: 'https://example.com/meet/heart-001',
      note: '请患者准备近期检查单',
      assignedBy: 'admin-001'
    },
    diagnosisAccess: {
      provider: 'external',
      url: 'https://virtualclinic.example.com/session/seed-in-progress',
      accessCode: 'HX-2025',
      note: '预留第三方视频会诊入口（示例）',
      lastUpdated: hours(-1)
    },
    report: undefined,
    feedback: undefined,
    serviceEvaluation: undefined,
    patientConfirmation: undefined,
    history: []
  };
  pushHistory(inConsult, { actor: '周兰', action: '启动远程诊断会话（预留接口）', type: 'note' });
  pushHistory(inConsult, { actor: '管理员', action: '审核通过，指派专家周兰', type: 'status' });
  pushHistory(inConsult, { actor: doctorName, action: '医生发起远程医疗申请', type: 'status' });

  const awaitingEvaluation: TelemedicineApp = {
    id: 'seed-awaiting-eval',
    patientId: 'p2',
    patientName: '李梅',
    description: '患者出现持续性头痛伴视觉模糊，疑似偏头痛发作，请求神经内科远程联合门诊。',
    attachments: ['头颅MRI.pdf', '化验单.xlsx'],
    preferredMethod: 'video',
    preferredTime: '2025-09-27 10:30',
    serviceType: 'joint_clinic',
    supportTags: ['cloud_lab'],
    status: 'completed',
    serviceStage: 'report_submitted',
    createdAt: hours(-36),
    createdByDoctorId: 'doc-001',
    createdByDoctorName: doctorName,
    createdByDoctorHospital: doctorHospital,
    assignedExpertId: 'exp-003',
    assignedExpertName: '王强',
    schedule: {
      scheduledAt: hours(-6),
      method: 'video',
      meetingUrl: 'https://example.com/meet/brain-009',
      note: '会前请上传最新影像报告',
      assignedBy: 'admin-001'
    },
    diagnosisAccess: {
      provider: 'external',
      url: 'https://virtualclinic.example.com/session/seed-awaiting',
      accessCode: 'NEURO-2025',
      note: '采用三方视频平台对接',
      lastUpdated: hours(-7)
    },
    report: {
      conclusion: '考虑偏头痛伴闪辉，建议继续规范用药并联动眼科复查。',
      advice: '推荐使用托吡酯进行预防治疗，维持2周随访一次；如症状加重及时复诊。',
      attachments: ['会诊总结.docx'],
      submittedAt: hours(-5),
      submittedBy: 'exp-003'
    },
    feedback: undefined,
    serviceEvaluation: undefined,
    patientConfirmation: undefined,
    history: []
  };
  pushHistory(awaitingEvaluation, { actor: '王强', action: '提交诊断报告', type: 'report' });
  pushHistory(awaitingEvaluation, { actor: '王强', action: '启动远程诊断会话（预留接口）', type: 'note' });
  pushHistory(awaitingEvaluation, { actor: '管理员', action: '审核通过，指派专家王强', type: 'status' });
  pushHistory(awaitingEvaluation, { actor: doctorName, action: '医生发起远程医疗申请', type: 'status' });

  const closedCase: TelemedicineApp = {
    id: 'seed-closed-case',
    patientId: 'p3',
    patientName: '赵云',
    description: '慢性阻塞性肺病患者，需远程查房评估运动耐量并优化吸入方案。',
    attachments: ['肺功能报告.pdf'],
    preferredMethod: 'phone',
    preferredTime: '2025-09-25 09:00',
    serviceType: 'ward_round',
    supportTags: ['education', 'multidisciplinary'],
    status: 'completed',
    serviceStage: 'closed',
    createdAt: hours(-72),
    createdByDoctorId: 'doc-001',
    createdByDoctorName: doctorName,
    createdByDoctorHospital: doctorHospital,
    assignedExpertId: 'exp-002',
    assignedExpertName: '李青',
    schedule: {
      scheduledAt: hours(-40),
      method: 'phone',
      meetingUrl: undefined,
      note: '使用医院远程查房系统回拨',
      assignedBy: 'admin-001'
    },
    diagnosisAccess: {
      provider: 'in_app',
      note: '通过医院远程查房模块访问病区音视频设备',
      lastUpdated: hours(-41)
    },
    report: {
      conclusion: '病情稳定，建议维持现有吸入方案并增加肺康复训练。',
      advice: '推荐每周2次远程康复指导，观察两周后复评；若出现呼吸困难加重及时提示。',
      attachments: ['查房记录.pdf'],
      submittedAt: hours(-39),
      submittedBy: 'exp-002'
    },
    feedback: {
      rating: 5,
      comment: '专家针对呼吸训练给出详细指导，患者体验良好。',
      submittedAt: hours(-34),
      submittedBy: 'p3'
    },
    patientConfirmation: {
      confirmedAt: hours(-42),
      confirmedBy: '赵云',
      note: '已安排家属陪同，确保按时参加远程查房。'
    },
    serviceEvaluation: {
      rating: 5,
      comment: '远程查房流程顺畅，建议推广肺康复随访模板。',
      evaluator: '管理员',
      submittedAt: hours(-30)
    },
    history: []
  };
  pushHistory(closedCase, { actor: '管理员', action: '填写远程医疗服务评价并归档', type: 'feedback' });
  pushHistory(closedCase, { actor: '赵云', action: '提交诊疗评价', type: 'feedback' });
  pushHistory(closedCase, { actor: '李青', action: '提交诊断报告', type: 'report' });
  pushHistory(closedCase, { actor: '李青', action: '启动远程诊断会话（预留接口）', type: 'note' });
  pushHistory(closedCase, { actor: '管理员', action: '审核通过，指派专家李青', type: 'status' });
  pushHistory(closedCase, { actor: doctorName, action: '医生发起远程医疗申请', type: 'status' });

  return [inConsult, awaitingEvaluation, closedCase];
}

ensureSeedApps(buildSeedApps, SEED_SIGNATURE);

export async function fetchTelemedicineExperts(): Promise<ExpertSummary[]> {
  return new Promise((resolve) => setTimeout(() => resolve(clone(EXPERTS)), 100));
}

export async function createTelemedicineApplication(payload: CreateTelemedicinePayload): Promise<TelemedicineApp> {
  const app: TelemedicineApp = {
    id: genId(),
    patientId: payload.patientId,
    patientName: payload.patientName,
    description: payload.description,
    attachments: clone(payload.attachments || []),
    preferredMethod: payload.preferredMethod,
    preferredTime: payload.preferredTime,
    serviceType: payload.serviceType,
    supportTags: clone(payload.supportTags || []),
    status: 'pending',
    serviceStage: 'applied',
    createdAt: new Date().toISOString(),
    createdByDoctorId: payload.doctorId,
    createdByDoctorName: payload.doctorName,
    createdByDoctorHospital: payload.doctorHospital,
    diagnosisAccess: undefined,
    history: []
  };
  pushHistory(app, { actor: payload.doctorName, action: '医生发起远程医疗申请', type: 'status' });
  const stored = addApp(app);
  return new Promise((resolve) => setTimeout(() => resolve(stored), 160));
}

export async function fetchTelemedicineApplications(filters: TelemedicineFilters = {}): Promise<TelemedicineApp[]> {
  const list = getAppsSnapshot().filter((app) => {
    if (filters.patientId && app.patientId !== filters.patientId) return false;
    if (filters.status && app.status !== filters.status) return false;
    if (filters.doctorId && app.createdByDoctorId !== filters.doctorId) return false;
    return true;
  });
  return new Promise((resolve) => setTimeout(() => resolve(list), 120));
}

export async function fetchTelemedicineCases(filters: TelemedicineFilters = {}): Promise<TelemedicineApp[]> {
  return fetchTelemedicineApplications(filters);
}

export async function fetchTelemedicineByDoctor(doctorId: string): Promise<TelemedicineApp[]> {
  return fetchTelemedicineApplications({ doctorId });
}

export async function fetchTelemedicineDetail(id: string): Promise<TelemedicineApp | null> {
  const found = findApp(id);
  return new Promise((resolve) => setTimeout(() => resolve(found), 120));
}

export async function markTelemedicineUnderReview(id: string, actor = '管理员'): Promise<TelemedicineApp | null> {
  const updated = updateApp(id, (draft) => {
    if (draft.serviceStage !== 'applied') return;
    draft.serviceStage = 'review';
    draft.status = 'pending';
    pushHistory(draft, { actor, action: '开始审核远程医疗申请', type: 'status' });
  });
  return new Promise((resolve) => setTimeout(() => resolve(updated), 120));
}

export async function assignTelemedicineCase(id: string, payload: AssignPayload): Promise<TelemedicineApp | null> {
  const updated = updateApp(id, (draft) => {
    draft.status = 'scheduled';
    draft.serviceStage = 'scheduled';
    draft.assignedExpertId = payload.expertId;
    draft.assignedExpertName = payload.expertName;
    draft.schedule = {
      scheduledAt: payload.scheduledAt,
      method: payload.method,
      meetingUrl: payload.meetingUrl,
      note: payload.note,
      assignedBy: payload.assignedBy
    };
    const methodLabel = payload.method === 'video' ? '视频' : payload.method === 'phone' ? '电话' : '图文';
    pushHistory(draft, { actor: payload.assignedBy, action: `安排专家 ${payload.expertName} 进行${methodLabel}会诊`, type: 'assignment' });
  });
  return new Promise((resolve) => setTimeout(() => resolve(updated), 150));
}

export async function rejectTelemedicineCase(id: string, reason: string, actor = '管理员'): Promise<TelemedicineApp | null> {
  const updated = updateApp(id, (draft) => {
    draft.status = 'rejected';
    draft.serviceStage = 'closed';
    pushHistory(draft, { actor, action: `拒绝申请：${reason}`, type: 'status' });
  });
  return new Promise((resolve) => setTimeout(() => resolve(updated), 150));
}

export async function fetchTelemedicineForExpert(expertId: string): Promise<TelemedicineApp[]> {
  const list = getAppsSnapshot().filter(
    (app) => app.assignedExpertId === expertId && app.status !== 'rejected'
  );
  return new Promise((resolve) => setTimeout(() => resolve(list), 120));
}

export async function submitTelemedicineReport(id: string, report: ReportPayload): Promise<TelemedicineApp | null> {
  const updated = updateApp(id, (draft) => {
    draft.report = {
      conclusion: report.conclusion,
      advice: report.advice,
      attachments: clone(report.attachments || []),
      submittedAt: new Date().toISOString(),
      submittedBy: report.expertId
    };
    draft.status = 'completed';
    draft.serviceStage = 'report_submitted';
    pushHistory(draft, { actor: draft.assignedExpertName || '专家', action: '提交诊断报告', type: 'report' });
  });
  return new Promise((resolve) => setTimeout(() => resolve(updated), 160));
}

export async function submitTelemedicineFeedback(id: string, feedback: FeedbackPayload): Promise<TelemedicineApp | null> {
  const updated = updateApp(id, (draft) => {
    draft.feedback = {
      rating: feedback.rating,
      comment: feedback.comment,
      submittedAt: new Date().toISOString(),
      submittedBy: feedback.patientId
    };
    if (draft.serviceStage === 'report_submitted') {
      draft.serviceStage = 'evaluated';
    }
    pushHistory(draft, { actor: draft.patientName, action: '提交诊疗评价', type: 'feedback' });
  });
  return new Promise((resolve) => setTimeout(() => resolve(updated), 120));
}

export async function confirmTelemedicineAttendance(
  id: string,
  payload: PatientConfirmPayload
): Promise<TelemedicineApp | null> {
  const updated = updateApp(id, (draft) => {
    if (!['scheduled', 'in_consult'].includes(draft.serviceStage)) return;
    if (!draft.schedule) return;
    if (draft.patientId !== payload.patientId) return;
    const timestamp = new Date().toISOString();
    draft.patientConfirmation = {
      confirmedAt: timestamp,
      confirmedBy: payload.patientName,
      note: payload.note?.trim() || undefined
    };
    const movedToConsult = draft.serviceStage === 'scheduled';
    if (movedToConsult) {
      draft.serviceStage = 'in_consult';
    }
    const action = movedToConsult
      ? '确认按时参加远程会诊，流程进入诊断准备'
      : '更新了会诊出席确认信息';
    pushHistory(draft, { actor: payload.patientName, action, type: 'confirmation' });
  });
  return new Promise((resolve) => setTimeout(() => resolve(updated), 120));
}

export async function startTelemedicineSession(
  id: string,
  actor: string,
  access: Partial<Omit<TelemedicineDiagnosisAccess, 'lastUpdated'>> = {}
): Promise<TelemedicineApp | null> {
  const updated = updateApp(id, (draft) => {
    draft.serviceStage = 'in_consult';
    draft.diagnosisAccess = {
      provider: access.provider || draft.diagnosisAccess?.provider || 'external',
      url: access.url || draft.diagnosisAccess?.url,
      accessCode: access.accessCode || draft.diagnosisAccess?.accessCode,
      note: access.note || draft.diagnosisAccess?.note,
      lastUpdated: new Date().toISOString()
    };
    pushHistory(draft, { actor, action: '启动远程诊断会话（预留接口）', type: 'note' });
  });
  return new Promise((resolve) => setTimeout(() => resolve(updated), 140));
}

export async function closeTelemedicineService(
  id: string,
  evaluator: { name: string; comment?: string; rating?: number }
): Promise<TelemedicineApp | null> {
  const updated = updateApp(id, (draft) => {
    draft.status = 'completed';
    draft.serviceStage = 'closed';
    if (typeof evaluator.rating === 'number') {
      draft.serviceEvaluation = {
        rating: evaluator.rating,
        comment: evaluator.comment,
        evaluator: evaluator.name,
        submittedAt: new Date().toISOString()
      };
      pushHistory(draft, { actor: evaluator.name, action: '填写远程医疗服务评价并归档', type: 'feedback' });
    } else {
      draft.serviceEvaluation = undefined;
      pushHistory(draft, { actor: evaluator.name, action: '关闭远程医疗服务记录', type: 'status' });
    }
  });
  return new Promise((resolve) => setTimeout(() => resolve(updated), 140));
}
