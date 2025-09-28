<template>
  <div class="referral-detail" :style="rootVars">
    <a-page-header
      class="page-header"
      :title="detailHeaderTitle"
      :subtitle="detailHeaderSub"
      @back="goBack"
    />

    <div class="content">
      <div class="content-scroll">
        <a-card class="mu-card" :bordered="false">
          <template v-if="loading">
            <a-skeleton :loading="true" animation />
            <a-skeleton :loading="true" animation style="margin-top: 12px" />
          </template>
          <template v-else>
            <template v-if="detail">
              <div id="referral-detail-print-root">
                <div class="summary">
                  <div class="line1">
                    <span class="direction">{{ directionLabel }}</span>
                    <a-tag v-if="statusMeta" size="small" class="status-tag" :style="statusStyle">{{ statusMeta.text }}</a-tag>
                    <a-tag size="small" class="type-tag">{{ transferTypeLabel }}</a-tag>
                  </div>
                  <div class="line2">
                    <span class="patient"><strong>{{ detail.patientName }}</strong></span>
                    <span class="sep">·</span>
                    <span class="hospital">{{ primaryHospital }}</span>
                  </div>
                  <div class="line3">
                    <span>创建时间：{{ formatDate(detail.createdAt) }}</span>
                    <span v-if="detail.handledAt">最近处理：{{ formatDate(detail.handledAt) }}</span>
                  </div>
                </div>

                <ReferralProgress :referral="detail" class="detail-progress" />

                <a-divider orientation="left" class="section-divider"><span class="section-title">转诊基本信息</span></a-divider>
                <a-descriptions :column="2" size="large" :label-style="labelStyle" :value-style="valueStyle">
                  <a-descriptions-item label="转诊方向">{{ detail.direction === 'outbound' ? '上转' : '下转' }}</a-descriptions-item>
                  <a-descriptions-item label="转诊类型">{{ transferTypeLabel }}</a-descriptions-item>
                  <a-descriptions-item label="来源医院">{{ detail.fromHospital }}</a-descriptions-item>
                  <a-descriptions-item label="目标医院">{{ detail.toHospital }}</a-descriptions-item>
                  <a-descriptions-item label="当前状态">{{ statusMeta?.text || '—' }}</a-descriptions-item>
                  <a-descriptions-item label="处理人">{{ detail.handledBy || '—' }}</a-descriptions-item>
                  <a-descriptions-item label="创建时间">{{ formatDate(detail.createdAt) }}</a-descriptions-item>
                  <a-descriptions-item label="最近处理时间">{{ formatDate(detail.handledAt) }}</a-descriptions-item>
                  <a-descriptions-item label="转诊编号" :span="2">{{ detail.id }}</a-descriptions-item>
                </a-descriptions>

                <template v-if="detail.attentionNotes?.length">
                  <a-divider orientation="left" class="section-divider"><span class="section-title">注意事项</span></a-divider>
                  <ul class="section-list">
                    <li v-for="(item, index) in detail.attentionNotes" :key="index">{{ item }}</li>
                  </ul>
                </template>

                <template v-if="detail.note">
                  <a-divider orientation="left" class="section-divider"><span class="section-title">原始备注</span></a-divider>
                  <div class="section-block">{{ detail.note }}</div>
                </template>

                <template v-if="detail.attachments?.length">
                  <a-divider orientation="left" class="section-divider"><span class="section-title">附件资料</span></a-divider>
                  <div class="attachment-list">
                    <a-tag v-for="(file, index) in detail.attachments" :key="index" class="attachment-tag" type="primary">{{ file }}</a-tag>
                  </div>
                </template>

                <template v-if="detail.informedPatient">
                  <a-divider orientation="left" class="section-divider"><span class="section-title">患者交接说明</span></a-divider>
                  <div class="section-block">
                    <p><strong>交接联系人：</strong>{{ detail.informedPatient.doctorName || '社区责任医生' }}</p>
                    <p><strong>确认时间：</strong>{{ formatDate(detail.informedPatient.confirmedAt) }}</p>
                    <p v-if="detail.informedPatient.notes"><strong>交接要点：</strong>{{ detail.informedPatient.notes }}</p>
                  </div>
                </template>

                <template v-if="timelineItems.length">
                  <a-divider orientation="left" class="section-divider"><span class="section-title">处理进展</span></a-divider>
                  <a-timeline mode="left">
                    <a-timeline-item
                      v-for="(item, index) in timelineItems"
                      :key="index"
                      :label="formatDate(item.at)"
                      :color="timelineColor(item.step)"
                    >
                      <div class="timeline-item">
                        <div class="timeline-step">{{ auditStepLabel(item.step) }}</div>
                        <div class="timeline-meta">
                          <span>{{ item.by }}</span>
                          <span v-if="item.note" class="muted">{{ item.note }}</span>
                        </div>
                      </div>
                    </a-timeline-item>
                  </a-timeline>
                </template>

                <template v-if="hasAnyFeedback">
                  <a-divider orientation="left" class="section-divider"><span class="section-title">诊疗反馈</span></a-divider>
                  <div class="feedback-section">
                    <div v-if="detail.treatmentPlan" class="feedback-card outpatient">
                      <div class="feedback-head">
                        <span>门诊反馈</span>
                        <span class="timestamp">{{ formatDate(detail.treatmentPlan.completedAt) }}</span>
                      </div>
                      <div class="feedback-body">
                        <p><strong>诊断：</strong>{{ detail.treatmentPlan.diagnosis }}</p>
                        <p><strong>治疗方案：</strong>{{ detail.treatmentPlan.treatment }}</p>
                        <p><strong>医嘱：</strong>{{ detail.treatmentPlan.advice }}</p>
                        <p v-if="detail.treatmentPlan.attachments?.length"><strong>附件：</strong>{{ detail.treatmentPlan.attachments.join('、') }}</p>
                      </div>
                    </div>

                    <div v-if="detail.inpatientReport" class="feedback-card inpatient">
                      <div class="feedback-head">
                        <span>住院反馈</span>
                        <span class="timestamp">{{ detail.inpatientReport.dischargeDate ? formatDate(detail.inpatientReport.dischargeDate) : '住院中' }}</span>
                      </div>
                      <div class="feedback-body">
                        <p><strong>入院时间：</strong>{{ detail.inpatientReport.admissionDate }}</p>
                        <p v-if="detail.inpatientReport.summary"><strong>住院概况：</strong>{{ detail.inpatientReport.summary }}</p>
                        <p v-if="detail.inpatientReport.advice"><strong>随访建议：</strong>{{ detail.inpatientReport.advice }}</p>
                        <p v-if="detail.inpatientReport.attachments?.length"><strong>附件：</strong>{{ detail.inpatientReport.attachments.join('、') }}</p>
                      </div>
                    </div>

                    <div v-if="detail.downReferral" class="feedback-card down">
                      <div class="feedback-head">
                        <span>下转交接</span>
                        <span class="timestamp">{{ formatDate(detail.downReferral.submittedAt) }}</span>
                      </div>
                      <div class="feedback-body">
                        <p><strong>提交医生：</strong>{{ detail.downReferral.doctorName }}</p>
                        <p><strong>诊疗总结：</strong>{{ detail.downReferral.diagnosisOrSummary }}</p>
                        <p><strong>继续医嘱：</strong>{{ detail.downReferral.advice }}</p>
                        <p v-if="detail.downReferral.attachments?.length"><strong>附件：</strong>{{ detail.downReferral.attachments.join('、') }}</p>
                      </div>
                    </div>

                    <template v-if="followUpHistory.length">
                      <div
                        v-for="(record, index) in followUpHistory"
                        :key="record.visitedAt + index"
                        class="feedback-card follow"
                      >
                        <div class="feedback-head">
                          <span>社区随访 {{ index + 1 }}</span>
                          <span class="timestamp">{{ formatDate(record.visitedAt) }}</span>
                        </div>
                        <div class="feedback-body">
                          <p><strong>随访医生：</strong>{{ record.doctorName }}</p>
                          <p><strong>随访记录：</strong>{{ record.remarks }}</p>
                        </div>
                      </div>
                    </template>
                  </div>
                </template>

                <a-space class="action-bar no-print">
                  <a-button type="primary" status="normal" :disabled="!detail" @click="handleDownload">导出诊疗摘要</a-button>
                  <a-button type="outline" :disabled="!detail" @click="handleShare">分享医生（模拟）</a-button>
                  <a-button @click="goBack">返回列表</a-button>
                </a-space>
              </div>
            </template>

            <template v-else>
              <a-result status="404" title="未找到该转诊记录" description="请返回列表重试或联系管理员">
                <template #extra>
                  <a-button type="primary" @click="goBack">返回</a-button>
                </template>
              </a-result>
            </template>
          </template>
        </a-card>
        <div class="bottom-spring"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import {
  fetchReferralById,
  exportReferral,
  type ReferralCase,
  type ReferralAuditItem,
  type ReferralStatus
} from '@/api/mock/referrals';
import ReferralProgress from '@/components/ReferralProgress.vue';

const route = useRoute();
const router = useRouter();

const id = computed(() => String(route.params.id || ''));
const loading = ref(true);
const detail = ref<ReferralCase | null>(null);

const fontConfig = ref({
  sectionTitle: 18,
  label: 14,
  value: 15,
  summary: 20
});

const rootVars = computed(() => ({
  '--section-title-size': `${fontConfig.value.sectionTitle}px`,
  '--label-font-size': `${fontConfig.value.label}px`,
  '--value-font-size': `${fontConfig.value.value}px`,
  '--summary-font-size': `${fontConfig.value.summary}px`
}));

const labelStyle = computed(() => ({ width: '160px', color: '#475569', fontSize: `${fontConfig.value.label}px` }));
const valueStyle = computed(() => ({ color: '#0f172a', fontSize: `${fontConfig.value.value}px`, lineHeight: '22px' }));

const statusMetaMap: Record<ReferralStatus, { text: string; color: string; bg: string }> = {
  pending: { text: '待接收', color: '#b15b00', bg: '#fff4e6' },
  accepted: { text: '已接收', color: '#0f7a55', bg: '#e6f9f2' },
  'outpatient-completed': { text: '门诊完成', color: '#0b5fff', bg: '#e6f3ff' },
  'inpatient-completed': { text: '住院完成', color: '#0369a1', bg: '#e0f2fe' },
  'followed-up': { text: '随访完成', color: '#5b21b6', bg: '#ede9fe' },
  rejected: { text: '已拒绝', color: '#b91c1c', bg: '#fee2e2' }
};

const auditLabels: Record<ReferralAuditItem['step'], string> = {
  submitted: '发起申请',
  'patient-informed': '交接说明完成',
  accepted: '专科已接收',
  rejected: '专科拒绝',
  'outpatient-completed': '门诊诊疗完成',
  'inpatient-completed': '住院诊疗完成',
  'down-referral-submitted': '下转单提交',
  'followed-up': '社区随访完成',
  note: '备注更新'
};

const timelineColors: Record<ReferralAuditItem['step'], string> = {
  submitted: '#0b5fff',
  'patient-informed': '#f97316',
  accepted: '#21c29b',
  rejected: '#ff7d6b',
  'outpatient-completed': '#4ade80',
  'inpatient-completed': '#38bdf8',
  'down-referral-submitted': '#facc15',
  'followed-up': '#818cf8',
  note: '#94a3b8'
};

const detailHeaderTitle = '转诊详情';
const primaryHospital = computed(() => {
  if (!detail.value) return '';
  return detail.value.direction === 'outbound' ? detail.value.toHospital : detail.value.fromHospital;
});
const detailHeaderSub = computed(() => (detail.value ? `${detail.value.patientName} · ${primaryHospital.value}` : ''));
const directionLabel = computed(() => {
  if (!detail.value) return '';
  return detail.value.direction === 'outbound'
    ? `上转至：${detail.value.toHospital}`
    : `下转来自：${detail.value.fromHospital}`;
});
const transferTypeLabel = computed(() =>
  detail.value ? (detail.value.transferType === 'outpatient' ? '门诊转诊' : '住院转诊') : ''
);
const statusMeta = computed(() => (detail.value ? statusMetaMap[detail.value.status] : null));
const statusStyle = computed(() => (statusMeta.value ? { backgroundColor: statusMeta.value.bg, color: statusMeta.value.color, border: 'none' } : {}));

const timelineItems = computed(() => {
  if (!detail.value?.auditTrail) return [] as ReferralAuditItem[];
  return [...detail.value.auditTrail].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
});

const hasAnyFeedback = computed(() => (detail.value ? hasFeedback(detail.value) : false));
const followUpHistory = computed(() => {
  if (!detail.value?.followUps?.length) return [] as NonNullable<ReferralCase['followUps']>;
  return [...detail.value.followUps].sort((a, b) => new Date(a.visitedAt).getTime() - new Date(b.visitedAt).getTime());
});

function hasFeedback(referral: ReferralCase) {
  return Boolean(
    referral.treatmentPlan ||
      referral.inpatientReport ||
      referral.downReferral ||
      (referral.followUps && referral.followUps.length > 0)
  );
}

function auditStepLabel(step: ReferralAuditItem['step']) {
  return auditLabels[step] ?? step;
}

function timelineColor(step: ReferralAuditItem['step']) {
  return timelineColors[step] ?? '#0b5fff';
}

function formatDate(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('zh-CN', { hour12: false });
}

async function load() {
  loading.value = true;
  try {
    const data = await fetchReferralById(id.value);
    detail.value = data;
    if (!data) {
      Message.warning('未找到对应的转诊记录');
    }
  } catch (error) {
    console.error(error);
    Message.error('加载转诊详情失败');
  } finally {
    loading.value = false;
  }
}

async function handleDownload() {
  if (!detail.value) return;
  try {
    const content = await exportReferral(detail.value.id);
    if (!content) {
      Message.warning('暂未生成可导出的反馈内容');
      return;
    }
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `转诊反馈-${detail.value.patientName}-${detail.value.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    Message.success('已生成反馈文本（模拟下载）');
  } catch (error) {
    console.error(error);
    Message.error('导出反馈失败，请稍后再试');
  }
}

function handleShare() {
  if (!detail.value) return;
  Message.success(`已生成分享链接（模拟）：${detail.value.id}`);
}

function goBack() {
  if (window.history.length > 1) {
    router.back();
    setTimeout(() => {
      if (router.currentRoute.value.name === 'PatientReferralDetail') {
        router.push({ name: 'PatientReferrals' });
      }
    }, 160);
  } else {
    router.push({ name: 'PatientReferrals' });
  }
}

onMounted(load);

watch(
  () => route.params.id,
  () => {
    loading.value = true;
    detail.value = null;
    load();
  }
);
</script>

<style lang="less" scoped>
.referral-detail {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px 0;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.page-header {
  background: #fff;
  border: 1px solid rgba(11, 95, 255, 0.06);
  border-radius: 10px;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
  flex-shrink: 0;
}

.content {
  flex: 1;
  margin-top: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.content-scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  box-sizing: border-box;
  padding-right: 8px;
  padding-bottom: 28px;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

.mu-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
}

.content-scroll::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.content-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.content-scroll::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 8px;
}

.content-scroll:hover::-webkit-scrollbar-thumb {
  background: #cbd5e1;
}

.content-scroll {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.summary {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.detail-progress {
  margin: 12px 0 6px;
  padding: 10px 12px;
  background: rgba(15, 95, 255, 0.06);
  border: 1px solid rgba(15, 95, 255, 0.12);
  border-radius: 12px;
}

.summary .line1 {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  color: #0f3ea5;
  font-weight: 800;
  font-size: var(--summary-font-size);
}

.summary .line2 {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #374151;
}

.summary .line2 .patient {
  color: #0f3ea5;
}

.summary .line3 {
  color: #6b7280;
  font-size: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}

.status-tag {
  border-radius: 999px;
  font-weight: 600;
}

.type-tag {
  background: rgba(11, 95, 255, 0.1);
  color: #0b5fff;
  border-radius: 999px;
  border: none;
}

.section-divider {
  margin: 26px 0 28px;
}

.section-title {
  font-size: var(--section-title-size);
  color: #0f172a;
  font-weight: 600;
}

.section-list {
  margin: 0;
  padding-left: 20px;
  color: #384152;
  line-height: 1.6;
}

.section-block {
  color: #334155;
  line-height: 1.6;
  white-space: pre-wrap;
  background: rgba(248, 250, 255, 0.8);
  border: 1px solid rgba(11, 95, 255, 0.12);
  border-radius: 10px;
  padding: 14px 16px;
}

.attachment-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.attachment-tag {
  border-radius: 999px;
  border: none;
  background: rgba(11, 95, 255, 0.08);
  color: #0b5fff;
}

.timeline-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.timeline-step {
  font-weight: 600;
  color: #111827;
}

.timeline-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 13px;
  color: #4b5563;
}

.timeline-meta .muted {
  color: #6b7280;
}

.feedback-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 14px;
}

.feedback-card {
  border-radius: 14px;
  padding: 16px 18px;
  border: 1px solid rgba(15, 23, 42, 0.05);
  background: rgba(255, 255, 255, 0.92);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.4);
}

.feedback-card.outpatient {
  background: linear-gradient(135deg, rgba(11, 95, 255, 0.08), rgba(11, 95, 255, 0.02));
}

.feedback-card.inpatient {
  background: linear-gradient(135deg, rgba(14, 116, 144, 0.1), rgba(14, 116, 144, 0.02));
}

.feedback-card.follow {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(129, 140, 248, 0.04));
}

.feedback-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 8px;
}

.feedback-head .timestamp {
  font-size: 12px;
  color: #475569;
}

.feedback-body p {
  margin: 4px 0;
  color: #384152;
  line-height: 1.5;
}

.action-bar {
  margin-top: 28px;
}

.bottom-spring {
  flex-grow: 1;
  min-height: 48px;
}

@media (max-width: 768px) {
  .page-header {
    border-radius: 8px;
  }

  .content-scroll {
    padding-right: 4px;
  }

  .feedback-section {
    grid-template-columns: 1fr;
  }
}
</style>
