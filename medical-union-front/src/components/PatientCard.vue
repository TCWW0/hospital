<template>
  <div :class="['patient-card', { large }]">
    <div class="left">
      <div class="avatar-wrap">
  <div class="avatar">{{ initials }}</div>
  <span v-if="dotOnAvatar && patient.unreadMessages" class="avatar-dot"></span>
      </div>
    </div>
    <div class="main" @click="handleOpen">
      <div class="row">
        <div style="display:flex; align-items:center; gap:8px">
          <div style="display:flex; flex-direction:column">
            <div class="name">{{ patient.name }}</div>
            <div v-if="compact" class="phone-mini">{{ patient.phone || '' }}</div>
          </div>
        </div>
  <div style="display:flex; align-items:center; gap:8px">
          <template v-if="compact">
            <span v-if="patient.unreadMessages" class="inline-unread">{{ displayUnread }}</span>
            <div class="status" :class="patient.status">{{ statusText }}</div>
            <div class="triage" :class="patient.triage">{{ patient.triage }}</div>
          </template>
          <template v-else>
            <div style="display:flex; flex-direction:column; align-items:flex-end; gap:6px">
              <div class="status" :class="patient.status">{{ statusText }}</div>
              <div class="triage" :class="patient.triage">{{ patient.triage }}</div>
            </div>
          </template>
        </div>
      </div>
      <div v-if="!compact" class="row sub">
        <div class="meta meta-large">
          <span class="meta-label">年龄:</span> <span class="meta-val">{{ patient.age }}</span>
          <span class="meta-label">性别:</span> <span class="meta-val">{{ genderText }}</span>
          <span class="meta-label">电话:</span> <span class="meta-val">{{ patient.phone || '-' }}</span>
        </div>
      </div>
    </div>
    <div class="right">
      <a-button v-if="showActions" type="text" size="small" @click="$emit('open', patient.id)">查看</a-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
const emit = defineEmits(['open']);

function handleOpen() {
  // emit open for the whole card when clicked
  if (props && props.patient && props.patient.id) emit('open', props.patient.id);
}

interface PatientSummary {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  phone?: string;
  lastVisit?: string;
  triage: 'high' | 'medium' | 'low';
  status: 'ongoing' | 'completed'; // 新增
  unreadMessages?: number;
}

const props = defineProps<{ patient: PatientSummary; showActions?: boolean; compact?: boolean; dotOnAvatar?: boolean; large?: boolean }>();

const showActions = props.showActions === undefined ? true : props.showActions;
const compact = props.compact === undefined ? false : props.compact;
const dotOnAvatar = props.dotOnAvatar === undefined ? false : props.dotOnAvatar;
const large = props.large === undefined ? false : props.large;

const initials = computed(() => {
  const parts = props.patient.name || ''; 
  return parts.slice(0, 1);
});

const genderText = computed(() => {
  return props.patient.gender === 'M' ? '男' : props.patient.gender === 'F' ? '女' : '其它';
});

const statusText = computed(() => {
  return props.patient.status === 'ongoing' ? '进行中' : '已完成';
});

const displayUnread = computed(() => {
  const n = props.patient.unreadMessages || 0;
  if (n <= 0) return '';
  return n > 99 ? '99+' : String(n);
});
</script>

<style scoped lang="less">
.patient-card {
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 1px solid #e6eefc; // slightly bluish border to match gradient
  padding: 10px;
  border-radius: 8px;
  gap: 10px;

  &:hover { box-shadow: 0 6px 18px rgba(16,24,40,0.04); transform: translateY(-2px); transition: all 0.12s ease; }
  /* guard against unexpected list markers or pseudo-element content */
  &::before, &::marker { content: none !important; }

  .left .avatar {
  width: 40px;
  height: 40px;
    border-radius: 8px;
    background: linear-gradient(135deg, rgba(59,130,246,0.12), rgba(96,165,250,0.06));
    display:flex;
    align-items:center;
    justify-content:center;
    font-weight:600;
    color:#0f172a;
    border:1px solid rgba(59,130,246,0.12);
  }

  .avatar-wrap { position:relative; }
  .avatar-dot { position:absolute; left:-6px; top:-6px; background:#ef4444; width:10px; height:10px; border-radius:50%; display:inline-block; box-shadow:0 2px 6px rgba(0,0,0,0.12) }
  .phone-mini { color:#6b7280; font-size:12px; margin-top:2px }

  /* larger card variant */
  &.large { padding:14px; gap:14px; border-radius:10px; min-height:96px; }
  &.large .left .avatar { width:52px; height:52px; border-radius:10px; font-size:18px }
  &.large .name { font-size:16px }

  .main { flex:1; }
  .row { display:flex; justify-content:space-between; align-items:center; }
  .name { font-weight:600; color:#111827; }
  .sub { margin-top:6px; color:#6b7280; font-size:13px; }
  .meta-large { font-size:14px; color:#374151; display:flex; gap:12px; align-items:center }
  .meta-label { color:#0f172a; font-weight:700; margin-right:4px }
  .meta-val { font-weight:500; color:#374151; margin-right:8px }

  .triage { padding:3px 8px; border-radius:6px; text-transform:capitalize; font-size:12px; border:1px solid rgba(30,64,175,0.12); background: rgba(30,64,175,0.03); color:#1e40af; }
  .triage.high { border-color: rgba(220,38,38,0.12); background: rgba(220,38,38,0.03); color:#991b1b; }
  .triage.medium { border-color: rgba(124,45,18,0.12); background: rgba(124,45,18,0.03); color:#7c2d12; }
  .triage.low { border-color: rgba(6,78,59,0.12); background: rgba(6,78,59,0.03); color:#0f5132; }

  .status { padding:3px 8px; border-radius:6px; font-size:12px; font-weight:500; border:1px solid rgba(30,64,175,0.12); background: rgba(30,64,175,0.02); color:#1e40af; }
  .status.ongoing { border-color: rgba(30,64,175,0.14); background: rgba(30,64,175,0.03); color:#1e40af; }
  .status.completed { border-color: rgba(16,185,129,0.12); background: rgba(16,185,129,0.03); color:#166534; }

  .right { display:flex; flex-direction:column; align-items:flex-end; gap:6px; }
  .msgs { background:transparent; color:#6b7280; padding:2px 6px; border-radius:6px; font-size:12px; }
  .unread-badge { display:inline-flex; align-items:center; justify-content:center; width:20px; height:20px; border-radius:10px; background:#ef4444; color:#fff; font-size:12px; font-weight:600; }
  .inline-unread { display:inline-flex; align-items:center; justify-content:center; min-width:18px; height:18px; border-radius:9px; background:rgba(239,68,68,0.1); color:#ef4444; font-size:12px; font-weight:600; padding:0 6px }
  a-button { color: #1f56d6; padding:0; }
}
</style>