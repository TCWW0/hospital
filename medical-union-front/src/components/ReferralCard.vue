<template>
  <div class="referral-card" @click="$emit('open', referral.id)">
    <div class="left">
      <div class="title-row">
        <div class="name">
          {{ referral.patientName }}
          <span class="dir">{{ dirLabel }}</span>
        </div>
        <div class="type-tag" :class="referral.transferType">{{ transferLabel }}</div>
      </div>
      <div class="meta">{{ referral.fromHospital }} → {{ referral.toHospital }}</div>
      <div v-if="submitterLabel" class="submitter">发起：{{ submitterLabel }}</div>
      <div v-if="referral.tags?.length" class="tags">
        <span v-for="tag in referral.tags" :key="tag" class="tag">#{{ tag }}</span>
      </div>
      <div v-if="referral.note" class="note">{{ referral.note }}</div>
      <div v-if="referral.attentionNotes?.length" class="attention">
        <span class="label">注意：</span>{{ referral.attentionNotes.join('；') }}
      </div>
    </div>
    <div class="right">
      <div class="date">{{ createdDate }}</div>
      <div :class="['status', statusClass]">{{ statusLabel }}</div>
      <div v-if="referral.handledBy" class="handled">处理：{{ referral.handledBy }} · {{ formatDate(referral.handledAt) }}</div>
      <div v-if="showActions && referral.status === 'pending'" class="actions">
        <a-button size="small" type="text" @click.stop="$emit('accept', referral.id)">同意</a-button>
        <a-button size="small" type="text" @click.stop="$emit('reject', referral.id)">拒绝</a-button>
      </div>
      <div v-else-if="hasActionsSlot" class="actions custom">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, useSlots } from 'vue';
import type { ReferralCase, ReferralStatus } from '@/api/mock/referrals';

const props = defineProps<{ referral: ReferralCase; showActions?: boolean }>();
const slots = useSlots();

const statusTextMap: Record<ReferralStatus, string> = {
  pending: '待处理',
  accepted: '已接收',
  'outpatient-completed': '门诊完成',
  'inpatient-completed': '住院完成',
  'followed-up': '社区随访',
  rejected: '已退回'
};

const statusClassMap: Record<ReferralStatus, string> = {
  pending: 'pending',
  accepted: 'accepted',
  'outpatient-completed': 'outpatient',
  'inpatient-completed': 'inpatient',
  'followed-up': 'followed',
  rejected: 'rejected'
};

const statusLabel = computed(() => statusTextMap[props.referral.status] || '未知状态');
const statusClass = computed(() => statusClassMap[props.referral.status] || 'pending');
const dirLabel = computed(() =>
  props.referral.direction === 'inbound'
    ? '（外院转入）'
    : props.referral.direction === 'outbound'
      ? '（转出）'
      : ''
);
const transferLabel = computed(() => (props.referral.transferType === 'outpatient' ? '门诊' : '住院'));
const createdDate = computed(() => formatDate(props.referral.createdAt));
const hasActionsSlot = computed(() => Boolean(slots.actions));
const submitterLabel = computed(() => props.referral.submittedByName || props.referral.submittedById || '');

function formatDate(raw?: string) {
  if (!raw) return '';
  const dt = new Date(raw);
  if (Number.isNaN(dt.getTime())) return raw;
  const y = dt.getFullYear();
  const m = `${dt.getMonth() + 1}`.padStart(2, '0');
  const d = `${dt.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}
</script>

<style scoped>
.referral-card {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding: 14px 16px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #eef6ff;
  cursor: pointer;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
  width: 100%;
  box-sizing: border-box;
}
.left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.name {
  font-weight: 600;
  color: #0f172a;
}
.name .dir {
  font-weight: 400;
  color: #6b7280;
  font-size: 12px;
  margin-left: 8px;
}
.meta {
  color: #6b7280;
  font-size: 13px;
}
.submitter {
  color: #4b5563;
  font-size: 12px;
}
.tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.tag {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  background: #f1f5f9;
  color: #475569;
}
.note {
  color: #374151;
  font-size: 13px;
  background: #fbfdff;
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}
.attention {
  font-size: 12px;
  color: #b45309;
  background: #fff7ed;
  border-radius: 6px;
  padding: 4px 8px;
  border: 1px solid rgba(180, 83, 9, 0.2);
}
.attention .label {
  font-weight: 600;
}
.type-tag {
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 999px;
  border: 1px solid #bfdbfe;
  background: #eff6ff;
  color: #1d4ed8;
}
.type-tag.inpatient {
  background: #f5f3ff;
  border-color: #ddd6fe;
  color: #5b21b6;
}
.right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  min-width: 168px;
}
.date {
  color: #9ca3af;
  font-size: 12px;
}
.status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  border: 1px solid transparent;
}
.actions {
  display: flex;
  gap: 6px;
  margin-top: 4px;
}
.actions.custom {
  justify-content: flex-end;
  width: 100%;
}
.status.pending {
  background: #fff7ed;
  color: #b45309;
  border-color: rgba(180, 83, 9, 0.18);
}
.status.accepted {
  background: #ecfdf5;
  color: #047857;
  border-color: rgba(4, 120, 87, 0.18);
}
.status.outpatient {
  background: #eff6ff;
  color: #1d4ed8;
  border-color: rgba(29, 78, 216, 0.2);
}
.status.inpatient {
  background: #f5f3ff;
  color: #5b21b6;
  border-color: rgba(91, 33, 182, 0.2);
}
.status.followed {
  background: #f0fdf4;
  color: #166534;
  border-color: rgba(22, 101, 52, 0.2);
}
.status.rejected {
  background: #fff1f2;
  color: #be123c;
  border-color: rgba(190, 18, 60, 0.2);
}
.handled {
  color: #64748b;
  font-size: 12px;
}
.referral-card:hover {
  border-color: #2563eb;
  box-shadow: 0 12px 28px rgba(37, 99, 235, 0.08);
}
@media (max-width: 640px) {
  .referral-card {
    flex-direction: column;
    align-items: flex-start;
  }
  .right {
    align-items: flex-start;
    width: 100%;
  }
}
</style>
