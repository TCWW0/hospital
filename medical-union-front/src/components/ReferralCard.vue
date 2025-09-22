<template>
  <div class="referral-card" @click="$emit('open', referral.id)">
    <div class="left">
      <div class="name">{{ referral.patientName }} <span class="dir">{{ dirLabel }}</span></div>
      <div class="meta">{{ referral.fromHospital }} → {{ referral.toHospital }}</div>
      <div v-if="referral.note" class="note">{{ referral.note }}</div>
    </div>
    <div class="right">
      <div class="date">{{ referral.createdAt }}</div>
      <div :class="['status', referral.status]">{{ statusLabel }}</div>
      <div v-if="referral.handledBy" class="handled">处理：{{ referral.handledBy }} · {{ referral.handledAt }}</div>
      <div v-if="showActions && referral.status === 'pending'" class="actions">
        <a-button size="small" type="text" @click.stop="$emit('accept', referral.id)">同意</a-button>
        <a-button size="small" type="text" @click.stop="$emit('reject', referral.id)">拒绝</a-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import type { ReferralSummary } from '@/api/mock/referrals';

const props = defineProps<{ referral: ReferralSummary; showActions?: boolean }>();

const statusLabel = computed(() => {
  switch (props.referral.status) {
    case 'pending': return '待处理';
    case 'accepted': return '已接收';
    case 'rejected': return '已拒绝';
    default: return '';
  }
});

const dirLabel = computed(() => props.referral.direction === 'inbound' ? '（外院转入）' : props.referral.direction === 'outbound' ? '（转出）' : '');
</script>

<style scoped>
.referral-card { display:flex; justify-content:space-between; align-items:center; padding:12px 14px; border-radius:8px; background:#fff; border:1px solid #eef6ff; cursor:pointer; }
.referral-card .left { display:flex; flex-direction:column; }
.referral-card .name { font-weight:600; color:#0f172a; }
.referral-card .name .dir { font-weight:400; color:#6b7280; font-size:12px; margin-left:8px }
.referral-card .note { margin-top:6px; color:#374151; font-size:13px; background: #fbfdff; padding:6px 8px; border-radius:6px }
.referral-card .meta { color:#6b7280; font-size:13px; margin-top:4px }
.referral-card .right { display:flex; flex-direction:column; align-items:flex-end; gap:6px }
.referral-card .date { color:#9ca3af; font-size:12px }
.referral-card .status { padding:4px 8px; border-radius:12px; font-size:12px }
.referral-card .actions { display:flex; gap:6px; margin-top:6px }
.referral-card .status.pending { background:#fff7ed; color:#b45309; border:1px solid rgba(180,83,9,0.08) }
.referral-card .status.accepted { background:#ecfdf5; color:#065f46; border:1px solid rgba(6,95,70,0.08) }
.referral-card .status.rejected { background:#fff1f2; color:#9f1239; border:1px solid rgba(159,18,57,0.08) }
</style>
