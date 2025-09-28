<template>
  <div class="referral-progress">
    <a-steps size="small" :current="currentIndex" label-placement="vertical">
      <a-step
        v-for="step in steps"
        :key="step.key"
        :title="step.title"
        :description="step.description"
        :status="stepStatus(step.key)"
      />
    </a-steps>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ReferralCase, ReferralStatus } from '@/api/mock/referrals';

type StepKey = 'submitted' | 'accepted' | 'feedback' | 'follow';

const props = defineProps<{ referral: ReferralCase }>();

const auditSteps = computed(() => new Set(props.referral.auditTrail?.map(item => item.step) ?? []));
const isRejected = computed(() => props.referral.status === 'rejected');
const hasAccepted = computed(() => auditSteps.value.has('accepted'));
const hasOutpatientFeedback = computed(() => auditSteps.value.has('outpatient-completed'));
const hasInpatientFeedback = computed(() => auditSteps.value.has('inpatient-completed'));
const hasFeedback = computed(() =>
  props.referral.transferType === 'outpatient' ? hasOutpatientFeedback.value : hasInpatientFeedback.value
);
const hasFollowUp = computed(() => auditSteps.value.has('followed-up'));

const steps = computed(() => [
  {
    key: 'submitted' as StepKey,
    title: '提交申请',
    description: submitDescription(props.referral.status)
  },
  {
    key: 'accepted' as StepKey,
    title: '医院审核',
    description: '专科医生接收或退回'
  },
  {
    key: 'feedback' as StepKey,
    title: props.referral.transferType === 'outpatient' ? '门诊反馈' : '住院反馈',
    description: props.referral.transferType === 'outpatient' ? '填写门诊诊疗结果' : '回传住院总结'
  },
  {
    key: 'follow' as StepKey,
    title: '社区随访',
    description: '社区医生完成随访回访'
  }
]);

const currentIndex = computed(() => {
  if (isRejected.value) return 2;
  if (hasFollowUp.value) return 4;
  if (hasFeedback.value) return 3;
  if (hasAccepted.value) return 2;
  return 1;
});

function submitDescription(status: ReferralStatus) {
  if (status === 'rejected') return '已退回，等待调整';
  if (status === 'pending') return '等待医院审核';
  return '已提交，流程进行中';
}

function stepStatus(step: StepKey): 'wait' | 'process' | 'finish' | 'error' {
  if (isRejected.value) {
    if (step === 'submitted') return 'finish';
    if (step === 'accepted') return 'error';
    return 'wait';
  }
  switch (step) {
    case 'submitted':
      return 'finish';
    case 'accepted':
      if (hasAccepted.value) return 'finish';
      return 'process';
    case 'feedback':
      if (hasFeedback.value) return 'finish';
      return hasAccepted.value ? 'process' : 'wait';
    case 'follow':
      if (hasFollowUp.value) return 'finish';
      return hasFeedback.value ? 'process' : 'wait';
    default:
      return 'wait';
  }
}
</script>

<style scoped>
.referral-progress {
  padding: 4px 0;
}

:deep(.arco-steps-item-title) {
  font-size: 13px;
}

:deep(.arco-steps-item-description) {
  font-size: 11px;
  color: #6b7280;
}
</style>
