import type {
  CloseEnrollmentPayload,
  CompileLectureReportPayload,
  CreateTeachingLecturePayload,
  LectureHistoryEntry,
  LectureParticipant,
  LectureVisibilityMatrix,
  LectureViewerContext,
  MarkLectureLivePayload,
  PublishLectureNoticePayload,
  RecordLectureVerificationPayload,
  ReviewTeachingLecturePayload,
  TeachingLecture,
  TeachingLectureFilters,
  TeachingMaterial,
  UploadLectureMaterialPayload,
  VerificationPhase,
  VerificationOutcome
} from './teaching.types';

export type {
  LectureStage,
  LectureStatus,
  LectureCategory,
  LectureAudience,
  LectureVisibility,
  LectureVisibilityMatrix,
  LectureViewerRole,
  LectureViewerContext,
  VerificationPhase,
  VerificationOutcome,
  TeachingLecture,
  TeachingLectureFilters,
  CreateTeachingLecturePayload,
  ReviewTeachingLecturePayload,
  PublishLectureNoticePayload,
  MarkLectureLivePayload,
  RecordLectureVerificationPayload,
  UploadLectureMaterialPayload,
  CompileLectureReportPayload,
  CloseEnrollmentPayload
} from './teaching.types';

import {
  addLecture,
  ensureSeedLectures,
  findLecture,
  getLecturesSnapshot,
  updateLecture
} from './teaching.repository';

const SEED_SIGNATURE = 'teaching.lectures.seed.v5';

let uidCounter = 0;
function genId(prefix = 'lec'): string {
  uidCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${uidCounter.toString(36)}`;
}

const VISIBILITY_RULES: Record<TeachingLecture['visibility'], LectureVisibilityMatrix> = {
  private: {
    organizer: true,
    sameOrganization: false,
    networkDoctors: false,
    public: false
  },
  internal: {
    organizer: true,
    sameOrganization: true,
    networkDoctors: false,
    public: false
  },
  network: {
    organizer: true,
    sameOrganization: true,
    networkDoctors: true,
    public: false
  },
  public: {
    organizer: true,
    sameOrganization: true,
    networkDoctors: true,
    public: true
  }
};
function normalizeOrganization(value?: string | null): string | null {
  if (!value) return null;
  return value.trim().toLowerCase() || null;
}

function matchParticipant(lecture: TeachingLecture, participantId?: string): boolean {
  if (!participantId) return false;
  return lecture.participants.some((participant) => participant.id === participantId);
}

function canViewerAccessLecture(lecture: TeachingLecture, viewer?: LectureViewerContext): boolean {
  if (!viewer) return true;

  const viewerUserId = viewer.userId != null ? String(viewer.userId) : undefined;
  if (viewer.role === 'admin') return true;
  if (viewerUserId && viewerUserId === lecture.organizerId) return true;
  if (matchParticipant(lecture, viewer.participantId)) return true;

  const rules = VISIBILITY_RULES[lecture.visibility];
  if (!rules) return false;

  const viewerOrganization = normalizeOrganization(viewer.organization);
  const organizerOrganization = normalizeOrganization(lecture.organizerHospital);

  if (viewerOrganization && organizerOrganization && viewerOrganization === organizerOrganization) {
    return rules.sameOrganization;
  }

  if (viewer.role === 'doctor' || viewer.role === 'nurse') {
    return rules.networkDoctors;
  }

  if (viewer.role === 'patient') {
    return rules.public;
  }

  return rules.public;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function nowISO() {
  return new Date().toISOString();
}

function pushHistory(lecture: TeachingLecture, entry: Omit<LectureHistoryEntry, 'id' | 'at'>) {
  lecture.history.unshift({ id: genId('his'), at: nowISO(), ...entry });
  lecture.updatedAt = nowISO();
}

function ensureParticipantPhase(participant: LectureParticipant, phase: VerificationPhase, outcome: VerificationOutcome) {
  if (!participant.verifiedPhases.includes(phase)) {
    participant.verifiedPhases.push(phase);
  }
  if (outcome === 'failed') {
    participant.verificationStatus = 'failed';
  } else if (outcome === 'passed' && participant.verificationStatus !== 'failed') {
    participant.verificationStatus = 'passed';
  }
}

function buildSeedLectures(): TeachingLecture[] {
  const now = new Date();

  const fmt = (offsetHours: number) => new Date(now.getTime() + offsetHours * 3600 * 1000).toISOString();

  const lecture1: TeachingLecture = {
    id: 'lec-seed-001',
    title: '基层心血管疾病远程讲座',
    category: 'lecture_training',
    targetAudience: 'medical_staff',
    visibility: 'internal',
    tags: ['心血管', '基层培训'],
    summary: '面向基层医生的高血压诊疗规范分享，涵盖案例讨论与远程随访经验。',
    objectives: ['统一诊疗路径', '掌握远程随访技巧'],
    organizerId: 'doc-001',
    organizerName: '李医生',
    organizerHospital: '吉林大学第二医院',
    organizerDepartment: '心内科',
    lecturer: {
      id: 'exp-001',
      name: '周兰',
      title: '主任医师',
      specialty: '心血管内科',
      hospital: '吉林大学第二医院'
    },
    stage: 'notice_published',
    status: 'active',
    createdAt: fmt(-48),
    updatedAt: fmt(-3),
    plannedAt: fmt(24),
    durationMinutes: 90,
    notice: {
      publishedAt: fmt(-4),
      publishedBy: 'admin-001',
      channel: 'platform',
      summary: '请相关社区医生准时参加，并提前完成身份验证。',
      audience: 'medical_staff',
      enrollmentClosesAt: fmt(6)
    },
    session: {
      scheduledAt: fmt(24),
      durationMinutes: 90,
      meetingUrl: 'https://example.com/live/cv-2025',
      accessCode: 'CV-2025',
      livestreamProvider: 'external',
      host: '张护士',
      techSupportContact: '400-123-4567'
    },
    materials: [
      {
        id: 'mat-001',
        name: '讲座大纲.pdf',
        type: 'document',
        uploader: 'doc-001',
        uploadedAt: fmt(-5),
        audience: 'medical_staff',
        url: 'https://cdn.example.com/materials/outline.pdf'
      }
    ],
    participants: [
      {
        id: 'doc-201',
        name: '王卫',
        role: 'doctor',
        organization: '吉林大学第二医院',
        verifiedPhases: ['pre_check'],
        verificationStatus: 'passed',
        note: '吉林大学第二医院朝阳社区卫生服务中心'
      },
      {
        id: 'doc-202',
        name: '刘峰',
        role: 'doctor',
        organization: '吉林大学第二医院',
        verifiedPhases: [],
        verificationStatus: 'pending',
        note: '临床教学部'
      }
    ],
    verificationRecords: [
      {
        id: 'ver-001',
        phase: 'pre_check',
        performedBy: 'admin-001',
        status: 'passed',
        note: '社区医生完成工号验证',
        createdAt: fmt(-6),
        targetParticipantIds: ['doc-201']
      }
    ],
    history: []
  };
  pushHistory(lecture1, { actor: '管理员', action: '发布讲座开课通知', type: 'notice' });
  pushHistory(lecture1, { actor: '管理员', action: '审核通过讲座申请', type: 'status' });
  pushHistory(lecture1, { actor: '李医生', action: '提交讲座申请', type: 'status' });

  const lecture2: TeachingLecture = {
    id: 'lec-seed-002',
    title: '远程查房示范：糖尿病足救治',
    category: 'ward_round',
    targetAudience: 'medical_staff',
    visibility: 'network',
    tags: ['内分泌', '查房', '医联体'],
    summary: '示范医联体合作下的远程糖尿病足查房流程，涵盖跨院会诊与术后护理评估。',
    objectives: ['理解跨院远程查房流程', '掌握术后康复要点'],
    organizerId: 'doc-002',
    organizerName: '赵医生',
  organizerHospital: '吉林大学第二医院',
    organizerDepartment: '内分泌科',
    lecturer: {
      id: 'exp-004',
      name: '韩明',
      title: '副主任医师',
      specialty: '内分泌',
  hospital: '吉林大学第二医院'
    },
    stage: 'in_session',
    status: 'active',
    createdAt: fmt(-72),
    updatedAt: fmt(-1),
    plannedAt: fmt(-1),
    durationMinutes: 60,
    notice: {
      publishedAt: fmt(-30),
      publishedBy: 'admin-001',
      channel: 'platform',
      summary: '请相关病区护士提前准备远程查房终端。',
      audience: 'medical_staff'
    },
    session: {
      scheduledAt: fmt(-1),
      durationMinutes: 60,
      meetingUrl: 'https://example.com/live/ward-2025',
      livestreamProvider: 'hybrid',
      host: '赵医生'
    },
    materials: [
      {
        id: 'mat-002',
        name: '病例介绍.pptx',
        type: 'slides',
        uploader: 'doc-002',
        uploadedAt: fmt(-40),
        audience: 'medical_staff'
      }
    ],
    participants: [
      {
        id: 'nurse-301',
        name: '李娜',
        role: 'nurse',
        organization: '吉林大学第二医院',
        verifiedPhases: ['pre_check', 'live_check'],
        verificationStatus: 'passed',
        note: '内分泌科护理组'
      },
      {
        id: 'doc-203',
        name: '陈志',
        role: 'doctor',
        organization: '吉林大学第二医院',
        verifiedPhases: ['pre_check'],
        verificationStatus: 'passed',
        note: '吉林大学第二医院顺义社区门诊部'
      }
    ],
    verificationRecords: [
      {
        id: 'ver-002',
        phase: 'pre_check',
        performedBy: 'admin-001',
        status: 'passed',
        createdAt: fmt(-32),
        note: '核验医护身份'
      },
      {
        id: 'ver-003',
        phase: 'live_check',
        performedBy: 'doc-002',
        status: 'passed',
        createdAt: fmt(-1),
        note: '直播点名确认'
      }
    ],
    history: []
  };
  pushHistory(lecture2, { actor: '赵医生', action: '启动远程查房直播', type: 'status' });
  pushHistory(lecture2, { actor: '管理员', action: '发布讲座开课通知', type: 'notice' });
  pushHistory(lecture2, { actor: '管理员', action: '审核通过讲座申请', type: 'status' });
  pushHistory(lecture2, { actor: '赵医生', action: '提交讲座申请', type: 'status' });

  const lecture4: TeachingLecture = {
    id: 'lec-seed-004',
    title: '卒中全流程应急演练与远程指导',
    category: 'teaching_discussion',
    targetAudience: 'mixed',
    visibility: 'network',
    tags: ['卒中', '应急演练', '流程梳理'],
    summary: '从患者分诊到再灌注的标准化演练，结合远程指导与术后随访案例。',
    objectives: ['梳理卒中绿色通道步骤', '明确多学科协同要点', '固化远程随访模板'],
    organizerId: 'doc-006',
    organizerName: '陈晓东',
  organizerHospital: '吉林大学第二医院',
    organizerDepartment: '神经内科',
    lecturer: {
      id: 'exp-009',
      name: '顾敏',
      title: '主任医师',
      specialty: '神经介入',
  hospital: '吉林大学第二医院卒中中心'
    },
    stage: 'post_verification',
    status: 'active',
    createdAt: fmt(-36),
    updatedAt: fmt(-2),
    plannedAt: fmt(-4),
    durationMinutes: 110,
    notice: {
      publishedAt: fmt(-30),
      publishedBy: 'admin-003',
      channel: 'mixed',
      summary: '面向卒中中心医护及基层转诊单位开放报名，需提前完成身份核验。',
      audience: 'mixed',
      enrollmentClosesAt: fmt(-6),
      enrollmentFormUrl: 'https://example.com/form/stroke-drill',
      attachments: ['演练说明.docx']
    },
    session: {
      scheduledAt: fmt(-4),
      durationMinutes: 110,
      meetingUrl: 'https://example.com/live/stroke-2025',
      accessCode: 'STROKE25',
      livestreamProvider: 'hybrid',
      host: '陈晓东',
      techSupportContact: '400-876-5678'
    },
    materials: [
      {
        id: 'mat-006',
        name: '卒中演练流程手册.pdf',
        type: 'document',
        uploader: 'doc-006',
        uploadedAt: fmt(-28),
        audience: 'medical_staff',
        url: 'https://cdn.example.com/materials/stroke-manual.pdf'
      },
      {
        id: 'mat-007',
        name: '公众宣教单张.jpg',
        type: 'other',
        uploader: 'admin-003',
        uploadedAt: fmt(-5),
        audience: 'mixed'
      }
    ],
    participants: [
      {
        id: 'doc-401',
        name: '彭珊',
        role: 'doctor',
        organization: '吉林大学第二医院',
        department: '急诊科',
        verifiedPhases: ['pre_check', 'live_check', 'post_check'],
        verificationStatus: 'passed',
        note: '吉林大学第二医院新区基层医疗站'
      },
      {
        id: 'nurse-501',
        name: '胡倩',
        role: 'nurse',
        organization: '吉林大学第二医院',
        department: '神经内科',
        verifiedPhases: ['pre_check', 'live_check'],
        verificationStatus: 'passed',
        note: '卒中中心联合护理组'
      },
      {
        id: 'patient-301',
        name: '模拟患者A',
        role: 'patient',
        verifiedPhases: ['pre_check'],
        verificationStatus: 'pending',
        note: '等待课后随访确认'
      }
    ],
    verificationRecords: [
      {
        id: 'ver-101',
        phase: 'pre_check',
        performedBy: 'admin-003',
        status: 'passed',
        createdAt: fmt(-18),
        note: '对接各单位名单并核验执业证书',
        attachments: ['precheck-list.xlsx']
      },
      {
        id: 'ver-102',
        phase: 'live_check',
        performedBy: 'doc-006',
        status: 'passed',
        createdAt: fmt(-4),
        note: '直播抽查身份并同步签到'
      },
      {
        id: 'ver-103',
        phase: 'post_check',
        performedBy: 'admin-003',
        status: 'pending',
        createdAt: fmt(-2),
        note: '等待各单位提交复盘记录'
      }
    ],
    history: []
  };
  pushHistory(lecture4, { actor: '陈晓东', action: '提交卒中演练讲座申请', type: 'status' });
  pushHistory(lecture4, { actor: '管理员', action: '通过申请并分配混合直播资源', type: 'status' });
  pushHistory(lecture4, { actor: '管理员', action: '发布演练报名通知', type: 'notice' });
  pushHistory(lecture4, { actor: '陈晓东', action: '上传演练资料与直播信息', type: 'material' });
  pushHistory(lecture4, { actor: '管理员', action: '录入身份验证记录', type: 'verification' });
  pushHistory(lecture4, { actor: '管理员', action: '等待课后复盘并汇总验证', type: 'system' });

    const lecture5: TeachingLecture = {
      id: 'lec-seed-005',
      title: '讲座彩排与资料确认会',
      category: 'teaching_discussion',
      targetAudience: 'medical_staff',
      visibility: 'private',
      tags: ['内部彩排', '流程校验'],
      summary: '组织团队内部的彩排会议，用于确认直播流程和资料完整性，仅限发起团队查看。',
      objectives: ['验证直播流程', '完善资料包'],
      organizerId: 'doc-001',
      organizerName: '李医生',
  organizerHospital: '吉林大学第二医院',
      organizerDepartment: '心内科',
      lecturer: {
        id: 'exp-001',
        name: '周兰',
        title: '主任医师',
        specialty: '心血管内科',
  hospital: '吉林大学第二医院'
      },
      stage: 'approved',
      status: 'pending',
      createdAt: fmt(-18),
      updatedAt: fmt(-2),
      plannedAt: fmt(18),
      durationMinutes: 45,
      materials: [
        {
          id: 'mat-009',
          name: '彩排流程检查表.xlsx',
          type: 'document',
          uploader: 'doc-001',
          uploadedAt: fmt(-3),
          audience: 'medical_staff'
        }
      ],
      participants: [
        {
          id: 'nurse-888',
          name: '宋晴',
          role: 'nurse',
    organization: '吉林大学第二医院',
          department: '心内科',
          verifiedPhases: [],
    verificationStatus: 'pending',
    note: '吉林大学第二医院朝阳社区卫生服务中心'
        }
      ],
      verificationRecords: [],
      history: []
    };
    pushHistory(lecture5, { actor: '李医生', action: '发起内部彩排会', type: 'status' });
    pushHistory(lecture5, { actor: '李医生', action: '上传彩排检查表', type: 'material' });

  const lecture3: TeachingLecture = {
    id: 'lec-seed-003',
    title: '健康教育：慢阻肺居家康复指导',
    category: 'knowledge_share',
    targetAudience: 'mixed',
    visibility: 'public',
    tags: ['慢病管理', '健康教育'],
    summary: '面向患者与家属的慢阻肺居家护理指南，包含呼吸操演示与注意事项。',
    objectives: ['普及慢阻肺知识', '指导患者家庭护理'],
    organizerId: 'doc-003',
    organizerName: '王医生',
  organizerHospital: '吉林大学第二医院',
    organizerDepartment: '呼吸科',
    lecturer: {
      id: 'exp-005',
      name: '李青',
      title: '主任医师',
      specialty: '呼吸与危重症',
  hospital: '吉林大学第二医院'
    },
    stage: 'archived',
    status: 'completed',
    createdAt: fmt(-168),
    updatedAt: fmt(-24),
    plannedAt: fmt(-96),
    durationMinutes: 75,
    notice: {
      publishedAt: fmt(-120),
      publishedBy: 'admin-002',
      channel: 'mixed',
      summary: '向患者开放报名，提供点播入口。',
      audience: 'mixed',
      enrollmentFormUrl: 'https://example.com/form/copd'
    },
    session: {
      scheduledAt: fmt(-96),
      durationMinutes: 75,
      meetingUrl: 'https://example.com/live/copd',
      livestreamProvider: 'external',
      host: '王医生'
    },
    materials: [
      {
        id: 'mat-003',
        name: '呼吸操视频.mp4',
        type: 'video',
        uploader: 'admin-002',
        uploadedAt: fmt(-95),
        audience: 'mixed',
        url: 'https://cdn.example.com/videos/copd.mp4'
      }
    ],
    participants: [
      {
        id: 'patient-101',
        name: '赵云',
        role: 'patient',
        verifiedPhases: ['pre_check', 'post_check'],
        verificationStatus: 'passed'
      },
      {
        id: 'patient-102',
        name: '刘敏',
        role: 'patient',
        verifiedPhases: ['pre_check'],
        verificationStatus: 'passed'
      }
    ],
    verificationRecords: [
      {
        id: 'ver-004',
        phase: 'pre_check',
        performedBy: 'admin-002',
        status: 'passed',
        createdAt: fmt(-110),
        note: '患者实名验证'
      },
      {
        id: 'ver-005',
        phase: 'post_check',
        performedBy: 'admin-002',
        status: 'passed',
        createdAt: fmt(-90),
        note: '完成问卷与结课确认'
      }
    ],
    report: {
      generatedAt: fmt(-80),
      generatedBy: 'admin-002',
      summary: '共有 180 名患者报名，实时参与 120 人，满意度 4.8/5。',
      attendanceRate: 0.77,
      satisfactionScore: 4.8,
      recommendations: ['上线点播回看功能', '增加康复器材演示'],
      attachments: ['讲座总结.pdf']
    },
    history: []
  };
  pushHistory(lecture3, { actor: '管理员', action: '生成讲座报告并归档', type: 'report' });
  pushHistory(lecture3, { actor: '李青', action: '上传讲座资料', type: 'material' });
  pushHistory(lecture3, { actor: '王医生', action: '执行讲座直播', type: 'status' });
  pushHistory(lecture3, { actor: '管理员', action: '发布讲座通知', type: 'notice' });
  pushHistory(lecture3, { actor: '管理员', action: '审核通过讲座申请', type: 'status' });
  pushHistory(lecture3, { actor: '王医生', action: '提交讲座申请', type: 'status' });

  return [lecture1, lecture2, lecture3, lecture4, lecture5];
}

ensureSeedLectures(buildSeedLectures, SEED_SIGNATURE);

function filterLectures(lectures: TeachingLecture[], filters: TeachingLectureFilters = {}) {
  return lectures.filter((lecture) => {
    if (filters.stage && lecture.stage !== filters.stage) return false;
    if (filters.status && lecture.status !== filters.status) return false;
    if (filters.organizerId && lecture.organizerId !== filters.organizerId) return false;
    if (filters.visibility && lecture.visibility !== filters.visibility) return false;
    if (filters.viewer && !canViewerAccessLecture(lecture, filters.viewer)) return false;
    if (filters.participantId) {
      const matched = lecture.participants.some((p) => p.id === filters.participantId);
      if (!matched) return false;
    }
    if (filters.search) {
      const target = `${lecture.title} ${lecture.summary} ${lecture.tags.join(' ')}`.toLowerCase();
      if (!target.includes(filters.search.toLowerCase())) return false;
    }
    return true;
  });
}

export async function fetchTeachingLectures(filters: TeachingLectureFilters = {}): Promise<TeachingLecture[]> {
  const list = filterLectures(getLecturesSnapshot(), filters);
  return new Promise((resolve) => setTimeout(() => resolve(list), 120));
}

export async function fetchTeachingLecturesByOrganizer(organizerId: string): Promise<TeachingLecture[]> {
  return fetchTeachingLectures({ organizerId });
}

export async function fetchTeachingLecturesForParticipant(participantId: string): Promise<TeachingLecture[]> {
  return fetchTeachingLectures({ participantId });
}

export async function fetchTeachingLecturesForViewer(
  viewer: LectureViewerContext,
  filters: Omit<TeachingLectureFilters, 'viewer'> = {}
): Promise<TeachingLecture[]> {
  return fetchTeachingLectures({ ...filters, viewer });
}

export async function fetchTeachingLectureDetail(
  id: string,
  options: { viewer?: LectureViewerContext } = {}
): Promise<TeachingLecture | null> {
  const detail = findLecture(id);
  if (!detail) {
    return new Promise((resolve) => setTimeout(() => resolve(null), 100));
  }
  if (!canViewerAccessLecture(detail, options.viewer)) {
    return new Promise((resolve) => setTimeout(() => resolve(null), 100));
  }
  return new Promise((resolve) => setTimeout(() => resolve(clone(detail)), 100));
}

export async function createTeachingLecture(payload: CreateTeachingLecturePayload): Promise<TeachingLecture> {
  const lecture: TeachingLecture = {
    id: genId(),
    title: payload.title,
    category: payload.category,
    targetAudience: payload.targetAudience,
    visibility: payload.visibility,
    tags: clone(payload.tags || []),
    summary: payload.summary,
    objectives: clone(payload.objectives || []),
    organizerId: payload.organizerId,
    organizerName: payload.organizerName,
    organizerHospital: payload.organizerHospital,
    organizerDepartment: payload.organizerDepartment,
    lecturer: clone(payload.lecturer),
    stage: 'applied',
    status: 'pending',
    createdAt: nowISO(),
    updatedAt: nowISO(),
    plannedAt: payload.plannedAt,
    durationMinutes: payload.durationMinutes,
    materials: [],
    participants: [],
    verificationRecords: [],
    history: []
  };
  pushHistory(lecture, { actor: payload.organizerName, action: '提交讲座申请', type: 'status' });
  const stored = addLecture(lecture);
  return new Promise((resolve) => setTimeout(() => resolve(clone(stored)), 150));
}

export async function reviewTeachingLecture(
  id: string,
  payload: ReviewTeachingLecturePayload
): Promise<TeachingLecture | null> {
  const updated = updateLecture(id, (draft) => {
    if (draft.stage !== 'applied' && draft.stage !== 'under_review') return;
    draft.stage = payload.decision === 'approved' ? 'approved' : 'rejected';
    draft.status = payload.decision === 'approved' ? 'pending' : 'rejected';
    pushHistory(draft, {
      actor: payload.reviewerName,
      action: payload.decision === 'approved' ? '审核通过讲座申请' : '驳回讲座申请',
      type: 'status'
    });
    if (payload.decision === 'rejected') {
      draft.notice = undefined;
      draft.session = undefined;
    }
  });
  return new Promise((resolve) => setTimeout(() => resolve(updated ? clone(updated) : null), 130));
}

export async function publishLectureNotice(
  id: string,
  payload: PublishLectureNoticePayload
): Promise<TeachingLecture | null> {
  const updated = updateLecture(id, (draft) => {
    if (!['approved', 'notice_published', 'enrollment_closed'].includes(draft.stage)) return;
    draft.stage = 'notice_published';
    draft.status = 'active';
    draft.notice = {
      publishedAt: nowISO(),
      publishedBy: payload.publishedBy,
      channel: payload.channel,
      summary: payload.summary,
      audience: payload.audience,
      enrollmentClosesAt: payload.enrollmentClosesAt,
      enrollmentFormUrl: payload.enrollmentFormUrl,
      attachments: clone(payload.attachments || [])
    };
    pushHistory(draft, {
      actor: payload.publishedByName,
      action: '发布讲座开课通知',
      type: 'notice'
    });
  });
  return new Promise((resolve) => setTimeout(() => resolve(updated ? clone(updated) : null), 140));
}

export async function closeLectureEnrollment(
  id: string,
  payload: CloseEnrollmentPayload
): Promise<TeachingLecture | null> {
  const updated = updateLecture(id, (draft) => {
    if (draft.stage !== 'notice_published') return;
    draft.stage = 'enrollment_closed';
    pushHistory(draft, {
      actor: payload.closedByName,
      action: payload.note ? `关闭报名：${payload.note}` : '关闭讲座报名',
      type: 'status'
    });
  });
  return new Promise((resolve) => setTimeout(() => resolve(updated ? clone(updated) : null), 120));
}

export async function markLectureLive(
  id: string,
  payload: MarkLectureLivePayload
): Promise<TeachingLecture | null> {
  const updated = updateLecture(id, (draft) => {
    if (!['enrollment_closed', 'notice_published', 'approved'].includes(draft.stage)) return;
    draft.stage = 'in_session';
    draft.status = 'active';
    draft.session = {
      scheduledAt: draft.session?.scheduledAt || nowISO(),
      durationMinutes: draft.session?.durationMinutes || 60,
      meetingUrl: payload.meetingUrl || draft.session?.meetingUrl,
      accessCode: payload.accessCode || draft.session?.accessCode,
      livestreamProvider: payload.livestreamProvider || draft.session?.livestreamProvider || 'platform',
      host: payload.host || draft.session?.host,
      techSupportContact: payload.techSupportContact || draft.session?.techSupportContact,
      onsiteLocation: draft.session?.onsiteLocation
    };
    pushHistory(draft, {
      actor: payload.host || '主持人',
      action: '启动讲座直播',
      type: 'status'
    });
  });
  return new Promise((resolve) => setTimeout(() => resolve(updated ? clone(updated) : null), 140));
}

export async function recordLectureVerification(
  id: string,
  payload: RecordLectureVerificationPayload
): Promise<TeachingLecture | null> {
  const updated = updateLecture(id, (draft) => {
    draft.verificationRecords.unshift({
      id: genId('ver'),
      phase: payload.phase,
      performedBy: payload.performedBy,
      status: payload.status,
      note: payload.note,
      attachments: clone(payload.attachments || []),
      targetParticipantIds: clone(payload.targetParticipantIds || []),
      createdAt: nowISO()
    });

    if (payload.targetParticipantIds?.length) {
      const set = new Set(payload.targetParticipantIds);
      draft.participants.forEach((participant) => {
        if (set.has(participant.id)) {
          ensureParticipantPhase(participant, payload.phase, payload.status);
        }
      });
    }

    if (!payload.targetParticipantIds?.length && payload.status === 'passed') {
      draft.participants.forEach((participant) => {
        ensureParticipantPhase(participant, payload.phase, payload.status);
      });
    }

    if (payload.phase === 'post_check' && draft.stage === 'in_session') {
      draft.stage = 'post_verification';
    }

    pushHistory(draft, {
      actor: payload.performerName,
      action: `记录${payload.phase === 'pre_check' ? '课前' : payload.phase === 'live_check' ? '课堂' : '课后'}身份验证`,
      type: 'verification'
    });
  });
  return new Promise((resolve) => setTimeout(() => resolve(updated ? clone(updated) : null), 130));
}

export async function uploadLectureMaterial(
  id: string,
  payload: UploadLectureMaterialPayload
): Promise<TeachingLecture | null> {
  const updated = updateLecture(id, (draft) => {
    const material: TeachingMaterial = {
      id: genId('mat'),
      name: payload.name,
      type: payload.type,
      uploader: payload.uploader,
      uploadedAt: nowISO(),
      url: payload.url,
      audience: payload.audience
    };
    draft.materials.unshift(material);
    pushHistory(draft, {
      actor: payload.uploaderName,
      action: `上传资料：${payload.name}`,
      type: 'material'
    });
  });
  return new Promise((resolve) => setTimeout(() => resolve(updated ? clone(updated) : null), 110));
}

export async function compileLectureReport(
  id: string,
  payload: CompileLectureReportPayload
): Promise<TeachingLecture | null> {
  const updated = updateLecture(id, (draft) => {
    draft.stage = 'report_ready';
    draft.status = 'completed';
    draft.report = {
      generatedAt: nowISO(),
      generatedBy: payload.generatedBy,
      summary: payload.summary,
      attendanceRate: payload.attendanceRate,
      satisfactionScore: payload.satisfactionScore,
      recommendations: clone(payload.recommendations || []),
      attachments: clone(payload.attachments || [])
    };
    pushHistory(draft, {
      actor: payload.generatedByName,
      action: '生成讲座报告',
      type: 'report'
    });
  });
  return new Promise((resolve) => setTimeout(() => resolve(updated ? clone(updated) : null), 140));
}

export async function archiveLecture(id: string, actor = '管理员'): Promise<TeachingLecture | null> {
  const updated = updateLecture(id, (draft) => {
    draft.stage = 'archived';
    draft.status = 'completed';
    pushHistory(draft, {
      actor,
      action: '归档讲座',
      type: 'status'
    });
  });
  return new Promise((resolve) => setTimeout(() => resolve(updated ? clone(updated) : null), 100));
}
