<template>
  <div class="referral-management">
    <div class="toolbar">
      <h3>转诊管理</h3>
      <a-input v-model:value="q" placeholder="搜索患者/医院" style="width:280px" />
      <a-select v-model:value="status" size="small" style="width:140px; margin-left:8px">
        <a-option value="all">全部状态</a-option>
        <a-option value="pending">待处理</a-option>
        <a-option value="accepted">已接收</a-option>
        <a-option value="rejected">已拒绝</a-option>
      </a-select>
      <a-space style="margin-left:auto">
        <a-button type="text" size="small" @click="reset">重置</a-button>
        <a-button type="primary" size="small" @click="load">刷新</a-button>
      </a-space>
    </div>

    <div class="list">
      <ReferralCard v-for="r in list" :key="r.id" :referral="r" :showActions="true" @open="openReferral" @accept="handleAccept" @reject="handleReject" />
    </div>

    <div class="pager" style="margin-top:12px; display:flex; gap:8px; align-items:center">
      <a-button size="small" :disabled="page<=1" @click="prev">上一页</a-button>
      <div>第 {{ page }} 页 / 共 {{ totalPages }} 页</div>
      <a-button size="small" :disabled="page>=totalPages" @click="next">下一页</a-button>
    </div>

    <a-drawer v-model:visible="drawerVisible" width="600" placement="right" :footer="false">
      <template #title>
        <span v-if="pendingAction === 'accept'">同意转诊 - 审核</span>
        <span v-else-if="pendingAction === 'reject'">拒绝转诊 - 审核</span>
        <span v-else>转诊审核</span>
      </template>
      <div v-if="currentReferral">
        <div style="margin-bottom:12px">
          <div><strong>患者：</strong>{{ currentPatient ? currentPatient.name : currentReferral.patientName }}</div>
          <div><strong>来自：</strong>{{ currentReferral.fromHospital }}</div>
          <div><strong>目标：</strong>{{ currentReferral.toHospital }}</div>
          <div><strong>方向：</strong>{{ currentReferral.direction || '-' }}</div>
          <div><strong>创建时间：</strong>{{ currentReferral.createdAt }}</div>
        </div>
        <div style="margin-bottom:12px">
          <div><strong>原始备注：</strong></div>
          <div style="white-space:pre-wrap">{{ currentReferral.note || '-' }}</div>
        </div>
        <div v-if="currentReferral.handledBy || currentReferral.handledAt" style="margin-bottom:12px">
          <div><strong>处理信息：</strong></div>
          <div>{{ currentReferral.handledBy || '-' }} · {{ currentReferral.handledAt || '-' }}</div>
        </div>
        <div style="margin-bottom:12px">
          <a-textarea v-model:value="noteText" rows="4" placeholder="请输入处理备注（可选）" />
        </div>
        <div style="display:flex; gap:8px; justify-content:flex-end">
          <a-button size="small" @click="drawerVisible=false">取消</a-button>
          <a-button type="primary" size="small" @click="confirmAction">{{ pendingAction === 'accept' ? '确认接收' : '确认拒绝' }}</a-button>
        </div>
      </div>
    </a-drawer>

    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, computed } from 'vue';
import ReferralCard from '@/components/ReferralCard.vue';
import { fetchReferrals, updateReferralStatus } from '@/api/mock/referrals';
import { fetchPatientById } from '@/api/mock/patients';
import { useRouter } from 'vue-router';

const list = ref([] as any[]);
const page = ref(1);
const pageSize = ref(5);
const total = ref(0);
const q = ref('');
const status = ref('all');
const router = useRouter();
const drawerVisible = ref(false);
const currentReferral = ref<any | null>(null);
const currentPatient = ref<any | null>(null);
const pendingAction = ref<'accept' | 'reject' | null>(null);
const noteText = ref('');

async function load() {
  const res = await fetchReferrals({ page: page.value, pageSize: pageSize.value, q: q.value, status: status.value as any });
  list.value = res.items;
  total.value = res.total;
}

function reset() {
  q.value = '';
  status.value = 'all';
  page.value = 1;
  load();
}

function openReferral(id: string) { router.push({ name: 'ReferralDetail', params: { id } }).catch(()=>{}); }

// open approval drawer
async function handleAccept(id: string) { await openApprovalDrawer(id, 'accept'); }
async function handleReject(id: string) { await openApprovalDrawer(id, 'reject'); }

async function openApprovalDrawer(id: string, action: 'accept' | 'reject') {
  // find referral in current list or fetch by id
  const ref = list.value.find((r: any) => r.id === id) || null;
  if (ref) currentReferral.value = ref; else currentReferral.value = (await fetchReferrals({ page:1, pageSize:1 })).items.find((r:any)=>r.id===id) || null;
  if (currentReferral.value && currentReferral.value.patientId) {
    currentPatient.value = await fetchPatientById(currentReferral.value.patientId);
  } else {
    currentPatient.value = null;
  }
  pendingAction.value = action;
  noteText.value = currentReferral.value?.note || '';
  drawerVisible.value = true;
}

async function confirmAction() {
  if (!currentReferral.value || !pendingAction.value) return;
  const id = currentReferral.value.id;
  const statusToSet = pendingAction.value === 'accept' ? 'accepted' : 'rejected';
  await updateReferralStatus(id, statusToSet as any, noteText.value || undefined);
  drawerVisible.value = false;
  currentReferral.value = null;
  currentPatient.value = null;
  pendingAction.value = null;
  noteText.value = '';
  load();
}

// reference to avoid false-positive "declared but not used" diagnostics
void ReferralCard;
void openReferral;

onMounted(load);

watch([page, pageSize, q, status], () => { load(); });

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)));
function prev() { if (page.value > 1) page.value--; }
function next() { if (page.value < totalPages.value) page.value++; }
</script>

<style scoped>
.referral-management { padding:20px; background: linear-gradient(180deg,#f8fbff 0,#fff 100%); border-radius:8px }
.referral-management .toolbar { display:flex; align-items:center; gap:12px; margin-bottom:12px }
.list { display:flex; flex-direction:column; gap:10px }
</style>
