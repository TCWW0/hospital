import type {
  TelemedicineMethod,
  TelemedicineServiceStage,
  TelemedicineServiceType,
  TelemedicineStatus,
  TelemedicineSupportTag
} from '@/api/mock/telemedicine';

type StageStyle = { color: string; bg: string };

type StatusStyle = { color: string; bg: string };

type StageStep = { value: TelemedicineServiceStage; label: string };

type DiagnosisProvider = 'external' | 'in_app';

const SERVICE_TYPE_NAMES: Record<TelemedicineServiceType, string> = {
  video_consult: '视频会诊',
  imaging_consult: '影像会诊',
  joint_clinic: '远程联合门诊',
  ward_round: '远程查房',
  report_review: '报告调阅'
};

const SUPPORT_TAG_NAMES: Record<TelemedicineSupportTag, string> = {
  cloud_imaging: '云影像',
  cloud_lab: '云检验',
  multidisciplinary: '多学科协同',
  education: '教学带教',
  pharmacy: '远程药事'
};

const STAGE_NAME_MAP: Record<TelemedicineServiceStage, string> = {
  applied: '提交申请',
  review: '管理员审核',
  scheduled: '安排专家',
  in_consult: '远程诊断',
  report_submitted: '提交报告',
  evaluated: '服务评价',
  closed: '流程关闭'
};

const STAGE_STYLES: Record<TelemedicineServiceStage, StageStyle> = {
  applied: { color: '#475569', bg: 'rgba(71, 85, 105, 0.12)' },
  review: { color: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.14)' },
  scheduled: { color: '#0f766e', bg: 'rgba(13, 148, 136, 0.18)' },
  in_consult: { color: '#2563eb', bg: 'rgba(37, 99, 235, 0.16)' },
  report_submitted: { color: '#7c3aed', bg: 'rgba(124, 58, 237, 0.16)' },
  evaluated: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.16)' },
  closed: { color: '#1f2937', bg: 'rgba(17, 24, 39, 0.16)' }
};

const STATUS_NAME_MAP: Record<TelemedicineStatus, string> = {
  pending: '待审核',
  scheduled: '已安排',
  completed: '已完成',
  rejected: '已拒绝'
};

const STATUS_STYLES: Record<TelemedicineStatus, StatusStyle> = {
  pending: { color: '#b45309', bg: 'rgba(245, 158, 11, 0.18)' },
  scheduled: { color: '#0f766e', bg: 'rgba(13, 148, 136, 0.18)' },
  completed: { color: '#2563eb', bg: 'rgba(37, 99, 235, 0.18)' },
  rejected: { color: '#b91c1c', bg: 'rgba(185, 28, 28, 0.18)' }
};

export const STAGE_SEQUENCE: TelemedicineServiceStage[] = [
  'applied',
  'review',
  'scheduled',
  'in_consult',
  'report_submitted',
  'evaluated',
  'closed'
];

export const stageSteps: StageStep[] = STAGE_SEQUENCE.map((value) => ({
  value,
  label: STAGE_NAME_MAP[value]
}));

export function stageLabel(stage: TelemedicineServiceStage): string {
  return STAGE_NAME_MAP[stage] ?? stage;
}

export function stageStyle(stage: TelemedicineServiceStage): StageStyle {
  return STAGE_STYLES[stage];
}

export function stageIndex(stage: TelemedicineServiceStage): number {
  const idx = STAGE_SEQUENCE.indexOf(stage);
  return idx === -1 ? 0 : idx;
}

export function statusLabel(status: TelemedicineStatus): string {
  return STATUS_NAME_MAP[status] ?? status;
}

export function statusStyle(status: TelemedicineStatus): StatusStyle {
  return STATUS_STYLES[status];
}

export function methodLabel(method?: TelemedicineMethod): string {
  if (method === 'video') return '视频会诊';
  if (method === 'phone') return '电话会诊';
  if (method === 'text') return '图文会诊';
  return '其他方式';
}

export function serviceTypeLabel(type: TelemedicineServiceType): string {
  return SERVICE_TYPE_NAMES[type] ?? type;
}

export function supportTagLabel(tag: TelemedicineSupportTag): string {
  return SUPPORT_TAG_NAMES[tag] ?? tag;
}

export function diagnosisProviderLabel(provider: DiagnosisProvider): string {
  return provider === 'in_app' ? '系统内置诊断' : '外部平台接入';
}

export function formatDateTime(value?: string): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const yyyy = d.getFullYear();
  const mm = `${d.getMonth() + 1}`.padStart(2, '0');
  const dd = `${d.getDate()}`.padStart(2, '0');
  const hh = `${d.getHours()}`.padStart(2, '0');
  const mi = `${d.getMinutes()}`.padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}
