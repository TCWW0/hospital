<template>
  <div class="patient-referrals">
    <div class="page-head">
      <div>
        <h3 class="title">我的转诊记录</h3>
        <p class="subtitle">掌握每一次上转/下转的实时进展与诊疗反馈</p>
      </div>
  <div class="stats" v-if="!loading">共 {{ total }} 条记录</div>
    </div>

    <div class="filter-bar">
      <a-input v-model:value="q" placeholder="搜索医院/标签/备注" allow-clear style="width:260px" @press-enter="search" />
      <a-select v-model:value="status" style="width:170px">
        <a-option value="all">全部状态</a-option>
        <a-option value="pending">待接收</a-option>
        <a-option value="accepted">已接收</a-option>
        <a-option value="outpatient-completed">门诊反馈完成</a-option>
        <a-option value="inpatient-completed">住院反馈完成</a-option>
        <a-option value="followed-up">社区随访完成</a-option>
        <a-option value="rejected">已拒绝</a-option>
      </a-select>
      <a-select v-model:value="transferType" style="width:140px">
        <a-option value="all">全部类型</a-option>
        <a-option value="outpatient">门诊</a-option>
        <a-option value="inpatient">住院</a-option>
      </a-select>
      <a-select v-model:value="direction" style="width:140px">
        <a-option value="all">全部方向</a-option>
        <a-option value="outbound">上转记录</a-option>
        <a-option value="inbound">下转记录</a-option>
      </a-select>
      <div class="filter-actions">
        <a-button type="primary" status="normal" @click="search">检索</a-button>
        <a-button type="text" @click="resetFilters">重置</a-button>
      </div>
    </div>

    <div class="content-scroll">
      <a-spin :loading="loading" class="list-spin">
        <template #default>
          <div v-if="referrals.length" class="list-body">
            <div class="card-grid">
              <div v-for="referral in referrals" :key="referral.id" class="referral-entry">
                <ReferralCard
                  :referral="referral"
                  :show-actions="false"
                  @open="goDetail"
                >
                  <template #actions>
                    <a-space>
                      <a-button type="primary" status="normal" @click.stop="goDetail(referral.id)">查看详情</a-button>
                      <a-button type="outline" status="normal" @click.stop="downloadReport(referral)" :disabled="!hasReport(referral)">下载反馈</a-button>
                      <a-button type="text" @click.stop="shareReferral(referral)">分享医生（模拟）</a-button>
                    </a-space>
                  </template>
                </ReferralCard>
                <div class="referral-extra">
                  <div class="status-row">
                    <a-tag size="small" class="status-pill" :color="statusPillStyle(referral.status).color" :style="{ backgroundColor: statusPillStyle(referral.status).bg }">
                      {{ statusLabel(referral.status) }}
                    </a-tag>
                    <span class="direction">{{ referral.direction === 'outbound' ? '上转' : '下转' }} · {{ referral.transferType === 'outpatient' ? '门诊' : '住院' }}</span>
                  </div>
                  <div class="referral-meta">
                    <div v-if="latestEvent(referral)" class="timeline-hint">
                      <span class="muted">最近更新：</span>
                      <span>{{ latestEvent(referral)?.note || statusLabel(referral.status) }}</span>
                      <span class="timestamp">{{ formatDate(latestEvent(referral)?.at || referral.updatedAt) }}</span>
                    </div>
                    <div v-if="referral.attentionNotes?.length" class="attention-hint">
                      <span class="muted">注意：</span>
                      <span>{{ referral.attentionNotes.join('；') }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="total > pageSize" class="pager">
              <a-button size="small" :disabled="page <= 1" @click="prevPage">上一页</a-button>
              <div>第 {{ page }} 页 / 共 {{ totalPages }} 页</div>
              <a-button size="small" :disabled="page >= totalPages" @click="nextPage">下一页</a-button>
            </div>
          </div>
          <a-empty v-else description="暂无转诊记录" class="empty-block" />
        </template>
      </a-spin>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import ReferralCard from '@/components/ReferralCard.vue';
import { fetchReferrals, exportReferral } from '@/api/mock/referrals';
import type { ReferralCase, ReferralStatus } from '@/api/mock/referrals';

const router = useRouter();

const referrals = ref<ReferralCase[]>([]);
const loading = ref(false);
const q = ref('');
const status = ref<ReferralStatus | 'all'>('all');
const transferType = ref<'all' | 'outpatient' | 'inpatient'>('all');
const direction = ref<'all' | 'inbound' | 'outbound'>('all');
const page = ref(1);
const pageSize = 2;
const total = ref(0);
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)));

const statusTextMap: Record<ReferralStatus, string> = {
  pending: '待接收',
  accepted: '已接收',
  'outpatient-completed': '门诊反馈完成',
  'inpatient-completed': '住院反馈完成',
  'followed-up': '社区随访完成',
  rejected: '已拒绝'
};

const statusPillMap: Record<ReferralStatus, { color: string; bg: string }> = {
  pending: { color: '#b15b00', bg: 'rgba(241, 173, 85, 0.18)' },
  accepted: { color: '#0f7a55', bg: 'rgba(48, 209, 144, 0.18)' },
  'outpatient-completed': { color: '#0b5fff', bg: 'rgba(11, 95, 255, 0.16)' },
  'inpatient-completed': { color: '#0369a1', bg: 'rgba(3, 105, 161, 0.16)' },
  'followed-up': { color: '#5b21b6', bg: 'rgba(91, 33, 182, 0.16)' },
  rejected: { color: '#b91c1c', bg: 'rgba(185, 28, 28, 0.16)' }
};

const currentPatientId = 'p1';

async function load() {
  loading.value = true;
  try {
    const res = await fetchReferrals({
      patientId: currentPatientId,
      q: q.value || undefined,
      status: status.value === 'all' ? undefined : status.value,
      transferType: transferType.value === 'all' ? undefined : transferType.value,
      direction: direction.value === 'all' ? undefined : direction.value,
      page: page.value,
      pageSize
    });
    const maxPage = Math.max(1, Math.ceil(res.total / pageSize));
    if (page.value > maxPage) {
      page.value = maxPage;
      return;
    }
    referrals.value = res.items;
    total.value = res.total;
  } catch (error) {
    console.error(error);
    Message.error('加载转诊数据失败，请稍后再试');
  } finally {
    loading.value = false;
  }
}

function resetPageAndLoad() {
  if (page.value === 1) {
    load();
  } else {
    page.value = 1;
  }
}

function prevPage() {
  if (page.value > 1) {
    page.value -= 1;
  }
}

function nextPage() {
  if (page.value < totalPages.value) {
    page.value += 1;
  }
}

function search() {
  resetPageAndLoad();
}

function resetFilters() {
  q.value = '';
  status.value = 'all';
  transferType.value = 'all';
  direction.value = 'all';
  resetPageAndLoad();
}

function hasReport(referral: ReferralCase) {
  return Boolean(
    referral.treatmentPlan ||
      referral.inpatientReport ||
      referral.downReferral ||
      (referral.followUps && referral.followUps.length > 0)
  );
}

async function downloadReport(referral: ReferralCase) {
  try {
    const content = await exportReferral(referral.id);
    if (!content) {
      Message.warning('暂未生成可下载的反馈内容');
      return;
    }
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `转诊反馈-${referral.patientName}-${referral.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    Message.success('已生成反馈文本（模拟下载）');
  } catch (error) {
    console.error(error);
    Message.error('导出反馈失败，请稍后再试');
  }
}

function shareReferral(referral: ReferralCase) {
  Message.success(`已生成分享链接（模拟）：${referral.id}`);
}

function goDetail(id: string) {
  router.push({ name: 'PatientReferralDetail', params: { id } }).catch(() => {});
}

function latestEvent(referral: ReferralCase) {
  if (!referral.auditTrail?.length) return null;
  return [...referral.auditTrail].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())[0];
}

function statusLabel(status: ReferralStatus) {
  return statusTextMap[status] ?? status;
}

function statusPillStyle(status: ReferralStatus) {
  return statusPillMap[status] ?? { color: '#1f2937', bg: 'rgba(15, 23, 42, 0.08)' };
}

function formatDate(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('zh-CN', { hour12: false });
}

watch([status, transferType, direction], () => {
  resetPageAndLoad();
});

watch(page, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    load();
  }
});

onMounted(load);
</script>

<style scoped>
.patient-referrals {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  padding: 24px 28px 40px;
  background: linear-gradient(180deg, #f6faff 0%, #ffffff 36%, #ffffff 100%);
}

.page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}

.title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: #1f2937;
}

.subtitle {
  margin: 6px 0 0;
  color: #6b7280;
  font-size: 14px;
}

.stats {
  color: #4b5563;
  font-size: 14px;
  padding: 6px 12px;
  background: rgba(11, 95, 255, 0.08);
  border-radius: 999px;
}

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 14px;
  border: 1px solid rgba(15, 23, 42, 0.05);
  box-shadow: 0 10px 32px rgba(15, 23, 42, 0.08);
  margin-bottom: 18px;
}

.filter-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.content-scroll {
  flex: 1 1 auto;
  min-height: 0;
  max-height: 100%;
  display: flex;
  overflow: hidden;
  border-radius: 16px;
}

.list-spin {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.list-body {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding-right: 10px;
  scrollbar-gutter: stable both-edges;
}

.list-body::-webkit-scrollbar {
  width: 8px;
}

.list-body::-webkit-scrollbar-thumb {
  background: rgba(11, 95, 255, 0.18);
  border-radius: 10px;
}

.list-body:hover::-webkit-scrollbar-thumb {
  background: rgba(11, 95, 255, 0.32);
}

.list-body {
  scrollbar-width: thin;
  scrollbar-color: rgba(11, 95, 255, 0.28) transparent;
}

.card-grid {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding-bottom: 24px;
  width: 100%;   
}

.card-grid > * {
  flex: 1;        /* 关键点：让子元素按父容器宽度拉伸 */
  width: 100%;    /* 保底，确保 100% */
  max-width: 100%; /* 防止内部卡片有 max-width 限制 */
}

.referral-entry {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.referral-extra {
  border: 1px solid rgba(59, 130, 246, 0.12);
  background: rgba(239, 246, 255, 0.55);
  border-radius: 10px;
  padding: 10px 16px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.status-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.status-pill {
  border-radius: 999px;
  border: none;
  font-weight: 600;
}

.direction {
  color: #0f3ea5;
  font-size: 13px;
  font-weight: 600;
}

.referral-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  color: #475569;
}

.timeline-hint,
.attention-hint {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: baseline;
}

.timeline-hint .timestamp {
  color: #94a3b8;
}

.muted {
  color: #6b7280;
  font-weight: 600;
}

.empty-block {
  margin: 60px 0;
}

.pager {
  margin: 20px auto 0;
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .patient-referrals {
    padding: 20px 16px 32px;
  }

  .filter-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .card-toolbar {
    justify-content: flex-start;
  }
}
</style>