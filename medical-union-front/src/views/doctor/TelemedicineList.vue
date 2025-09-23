<template>
  <div class="telemedicine-list">
    <h3>远程医疗申请</h3>
    <div class="cards">
      <a-card v-for="a in apps" :key="a.id" class="tele-card">
        <div class="card-top">
          <div class="patient-info">
            <div class="patient-name">{{ a.patientName }}</div>
            <div class="muted">{{ new Date(a.createdAt).toLocaleString() }} · {{ a.preferredMethod }}</div>
          </div>
          <div>
            <a-tag :type="a.status === 'pending' ? 'warning' : a.status === 'scheduled' ? 'success' : 'default'">{{ a.status }}</a-tag>
          </div>
        </div>
        <div class="card-body">{{ a.description }}</div>
        <div class="card-actions">
          <a-button v-if="a.status === 'pending'" type="primary" @click="accept(a.id)">安排</a-button>
          <a-button v-if="a.status === 'pending'" type="text" @click="reject(a.id)">拒绝</a-button>
        </div>
      </a-card>
    </div>
    
    <a-drawer v-model:visible="drawerVisible" title="安排会诊" :width="420">
      <div class="drawer-form">
        <div class="form-row">
          <label>患者</label>
          <div>{{ currentApp?.patientName || '-' }}</div>
        </div>
        <div class="form-row">
          <label>日期</label>
          <a-date-picker v-model:value="scheduleDate" style="width:100%" />
        </div>
        <div class="form-row">
          <label>时间</label>
          <input v-model="scheduleTime" placeholder="例如：14:30" style="width:100%;padding:6px;border:1px solid #e6e6e6;border-radius:4px" />
        </div>
        <div class="form-row">
          <label>方式</label>
          <a-select v-model:value="scheduleMethod" style="width:100%">
            <a-option value="video">视频</a-option>
            <a-option value="phone">电话</a-option>
            <a-option value="text">图文</a-option>
          </a-select>
        </div>
        <div class="form-row">
          <label>备注（可选）</label>
          <a-textarea v-model:value="scheduleNote" rows="3" />
        </div>
        <div style="text-align:right; margin-top:8px">
          <a-button type="text" @click="drawerVisible = false">取消</a-button>
          <a-button type="primary" style="margin-left:8px" @click="submitSchedule">提交安排</a-button>
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { fetchTelemedicineForDoctor, updateTelemedicineStatus } from '@/api/mock/telemedicine';

const apps = ref<any[]>([]);
const doctorId = 'doctor1'; // mock current doctor

// Drawer / schedule state
const drawerVisible = ref(false);
const currentApp = ref<any | null>(null);
const scheduleDate = ref<Date | null>(null);
const scheduleTime = ref('');
const scheduleMethod = ref<'video' | 'phone' | 'text'>('video');
const scheduleNote = ref('');

async function load() { apps.value = await fetchTelemedicineForDoctor(doctorId); }
async function accept(id: string) {
  const app = apps.value.find((x: any) => x.id === id);
  currentApp.value = app || null;
  // reset form
  scheduleDate.value = null;
  scheduleTime.value = '';
  scheduleMethod.value = app?.preferredMethod || 'video';
  scheduleNote.value = '';
  drawerVisible.value = true;
}
async function reject(id: string) { await updateTelemedicineStatus(id, 'rejected', '不接诊'); await load(); }

async function submitSchedule() {
  if (!currentApp.value) return;
  const dateStr = scheduleDate.value ? scheduleDate.value.toISOString().split('T')[0] : '';
  const note = `安排: ${dateStr} ${scheduleTime.value} ${scheduleMethod.value}${scheduleNote.value ? ' · ' + scheduleNote.value : ''}`;
  await updateTelemedicineStatus(currentApp.value.id, 'scheduled', note, doctorId);
  drawerVisible.value = false;
  currentApp.value = null;
  await load();
}

onMounted(load);
</script>

<style scoped>
.app-item { padding:12px; border-bottom:1px solid #eee }
</style>

<style scoped>
.telemedicine-list { padding:12px }
.cards { display:flex; flex-direction:column; gap:12px; max-width:920px; margin:0 auto }
.tele-card { padding:16px; background:#ffffff; border-radius:8px; box-shadow:0 1px 2px rgba(16,24,40,0.04) }
.card-top { display:flex; justify-content:space-between; align-items:center }
.patient-info { display:flex; flex-direction:column }
.patient-name { font-weight:700; font-size:16px; color:#0f172a }
.card-actions { margin-top:12px; text-align:right }
.muted { color:#6b7280 }
</style>