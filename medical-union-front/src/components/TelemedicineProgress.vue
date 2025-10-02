<template>
  <div class="tm-progress-root">
    <a-steps
      size="small"
      :current="displayCurrent"
      label-placement="vertical"
      class="tm-progress-steps"
    >
      <a-step
        v-for="(step, index) in steps"
        :key="step.value"
        :title="step.label"
        :description="descriptionMap[step.value]"
        :status="stepStatus(index)"
      />
    </a-steps>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { TelemedicineServiceStage, TelemedicineStatus } from '@/api/mock/telemedicine';
import { stageIndex, stageSteps } from '@/composables/useTelemedicineDetail';

const descriptionMap: Record<TelemedicineServiceStage, string> = {
  applied: '医生提交申请',
  review: '管理员审核与调度',
  scheduled: '完成专家排期',
  in_consult: '远程诊断进行中',
  report_submitted: '专家提交诊断报告',
  evaluated: '患者完成评价',
  closed: '流程归档'
};

const props = defineProps<{
  currentStage: TelemedicineServiceStage;
  status: TelemedicineStatus;
}>();

const reviewIndex = stageSteps.findIndex((step) => step.value === 'review');
const currentIndex = computed(() => stageIndex(props.currentStage));

const displayCurrent = computed(() => {
  if (props.status === 'rejected') {
    return Math.max(reviewIndex, 1);
  }
  return currentIndex.value;
});

function stepStatus(index: number): 'wait' | 'process' | 'finish' | 'error' {
  if (props.status === 'rejected') {
    if (index < reviewIndex) return 'finish';
    if (index === reviewIndex) return 'error';
    return 'wait';
  }

  if (index < currentIndex.value) return 'finish';
  if (index === currentIndex.value) {
    return props.currentStage === 'closed' ? 'finish' : 'process';
  }
  return 'wait';
}

const steps = stageSteps;
</script>

<style scoped>
.tm-progress-root {
  padding: 6px 8px;
  background: rgba(15, 62, 165, 0.05);
  border: 1px solid rgba(15, 62, 165, 0.08);
  border-radius: 12px;
}

.tm-progress-steps {
  --tm-step-title: 13px;
  --tm-step-desc: 11px;
}

:deep(.arco-steps-item)
  .arco-steps-item-title {
  font-size: var(--tm-step-title);
  color: #0f172a;
  font-weight: 600;
}

:deep(.arco-steps-item-description) {
  font-size: var(--tm-step-desc);
  color: #64748b;
}

:deep(.arco-steps-menu-item)::after,
:deep(.arco-steps-item-wait) .arco-steps-item-icon {
  background-color: rgba(148, 163, 184, 0.28);
}

:deep(.arco-steps-item-icon) {
  border-width: 0;
}

:deep(.arco-steps-item) .arco-steps-item-line {
  background-color: rgba(96, 165, 250, 0.32);
}
</style>
