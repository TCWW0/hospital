import { computed } from 'vue';
import type {
  LectureAudience,
  LectureCategory,
  LectureVisibility,
  LectureStage,
  LectureStatus,
  VerificationPhase,
  VerificationOutcome
} from '@/api/mock/teaching';

const stageLabels: Record<LectureStage, string> = {
  applied: '已提交申请',
  under_review: '审核中',
  approved: '已审核',
  notice_published: '已发布通知',
  enrollment_closed: '报名已截止',
  in_session: '进行中',
  post_verification: '验证汇总',
  report_ready: '报告生成',
  archived: '已归档',
  rejected: '已驳回'
};

const stageStyles: Record<LectureStage, { color: string; bg: string }> = {
  applied: { color: '#2563eb', bg: '#dbeafe' },
  under_review: { color: '#1d4ed8', bg: '#c7d2fe' },
  approved: { color: '#0f766e', bg: '#ccfbf1' },
  notice_published: { color: '#047857', bg: '#d1fae5' },
  enrollment_closed: { color: '#b45309', bg: '#fef3c7' },
  in_session: { color: '#9333ea', bg: '#ede9fe' },
  post_verification: { color: '#7c3aed', bg: '#ddd6fe' },
  report_ready: { color: '#16a34a', bg: '#dcfce7' },
  archived: { color: '#475569', bg: '#e2e8f0' },
  rejected: { color: '#dc2626', bg: '#fee2e2' }
};

const statusLabels: Record<LectureStatus, string> = {
  pending: '待处理',
  active: '进行中',
  completed: '已完成',
  rejected: '已驳回'
};

const statusStyles: Record<LectureStatus, { color: string; bg: string }> = {
  pending: { color: '#2563eb', bg: '#dbeafe' },
  active: { color: '#0f766e', bg: '#ccfbf1' },
  completed: { color: '#16a34a', bg: '#dcfce7' },
  rejected: { color: '#dc2626', bg: '#fee2e2' }
};

const categoryLabels: Record<LectureCategory, string> = {
  teaching_discussion: '教学讨论',
  ward_round: '查房教学',
  knowledge_share: '知识库共享',
  lecture_training: '远程讲座培训',
  surgery_live: '手术直播/点播'
};

const audienceLabels: Record<LectureAudience, string> = {
  medical_staff: '医务人员',
  patients: '患者/公众',
  mixed: '医患混合'
};

const visibilityLabels: Record<LectureVisibility, string> = {
  private: '仅组织团队（私有）',
  internal: '同院医护可见',
  network: '医联体医护可见',
  public: '对外公开'
};

const visibilityDescriptions: Record<LectureVisibility, string> = {
  private: '仅限发起人及手动邀请的成员查看，适合彩排或内部评审。',
  internal: '同一机构的医护人员可查看报名，适合院内培训。',
  network: '医联体内认证医护均可访问，支持跨院协作教学。',
  public: '患者与公众均可访问，需完善面向患者的宣教与审核信息。'
};

const verificationPhaseLabels: Record<VerificationPhase, string> = {
  pre_check: '课前验证',
  live_check: '课堂验证',
  post_check: '课后验证'
};

const verificationOutcomeLabels: Record<VerificationOutcome, string> = {
  pending: '待核验',
  passed: '已通过',
  failed: '未通过'
};

export function lectureStageLabel(stage: LectureStage) {
  return stageLabels[stage] ?? stage;
}

export function lectureStageStyle(stage: LectureStage) {
  return stageStyles[stage] ?? { color: '#64748b', bg: '#e2e8f0' };
}

export function lectureStatusLabel(status: LectureStatus) {
  return statusLabels[status] ?? status;
}

export function lectureStatusStyle(status: LectureStatus) {
  return statusStyles[status] ?? { color: '#64748b', bg: '#e2e8f0' };
}

export function lectureCategoryLabel(category: LectureCategory) {
  return categoryLabels[category] ?? category;
}

export function lectureAudienceLabel(audience: LectureAudience) {
  return audienceLabels[audience] ?? audience;
}

export function lectureVisibilityLabel(visibility: LectureVisibility) {
  return visibilityLabels[visibility] ?? visibility;
}

export function lectureVisibilityDescription(visibility: LectureVisibility) {
  return visibilityDescriptions[visibility] ?? '';
}

export function verificationPhaseLabel(phase: VerificationPhase) {
  return verificationPhaseLabels[phase] ?? phase;
}

export function verificationOutcomeLabel(outcome: VerificationOutcome) {
  return verificationOutcomeLabels[outcome] ?? outcome;
}

export function useTeachingLectureLabels() {
  return {
    toStageLabel: lectureStageLabel,
    toStageStyle: lectureStageStyle,
    toStatusLabel: lectureStatusLabel,
    toStatusStyle: lectureStatusStyle,
    toCategoryLabel: lectureCategoryLabel,
    toAudienceLabel: lectureAudienceLabel,
    toVerificationPhaseLabel: verificationPhaseLabel,
    toVerificationOutcomeLabel: verificationOutcomeLabel
  };
}

export function useLectureStageOptions() {
  return computed(() =>
    (Object.keys(stageLabels) as LectureStage[]).map((value) => ({
      label: stageLabels[value],
      value
    }))
  );
}

export function useLectureCategoryOptions() {
  return computed(() =>
    (Object.keys(categoryLabels) as LectureCategory[]).map((value) => ({
      label: categoryLabels[value],
      value
    }))
  );
}

export function useLectureAudienceOptions() {
  return computed(() =>
    (Object.keys(audienceLabels) as LectureAudience[]).map((value) => ({
      label: audienceLabels[value],
      value
    }))
  );
}

export function useLectureVisibilityOptions() {
  return computed(() =>
    (Object.keys(visibilityLabels) as LectureVisibility[]).map((value) => ({
      label: visibilityLabels[value],
      value,
      description: visibilityDescriptions[value]
    }))
  );
}
