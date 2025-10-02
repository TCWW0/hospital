<template>
  <div class="tm-detail-page" :style="rootVars">
    <a-page-header
      class="tm-page-header"
      @back="goBack"
      :title="detailTitle"
      :subtitle="detailApp ? formatDateTime(detailApp.createdAt) : ''"
    >
      <template #extra>
        <a-space>
          <a-button type="outline" @click="loadDetail" :loading="detailLoading">刷新</a-button>
        </a-space>
      </template>
    </a-page-header>

    <div class="tm-content">
      <a-spin :loading="detailLoading">
        <template #element>
          <div v-if="detailApp" class="tm-scroll-area">
            <a-card class="tm-card" :bordered="false">
              <div class="tm-card-scroll">
                <div class="tm-summary">
                  <div class="summary-line1">
                    <span class="summary-patient">{{ detailApp.patientName }}</span>
                    <a-tag class="summary-tag type" color="arcoblue">{{ serviceTypeLabel(detailApp.serviceType) }}</a-tag>
                    <a-tag
                      class="summary-tag stage"
                      :color="stageStyle(detailApp.serviceStage).color"
                      :style="{ backgroundColor: stageStyle(detailApp.serviceStage).bg, border: 'none' }"
                    >
                      {{ stageLabel(detailApp.serviceStage) }}
                    </a-tag>
                    <a-tag
                      class="summary-tag status"
                      :color="statusStyle(detailApp.status).color"
                      :style="{ backgroundColor: statusStyle(detailApp.status).bg, border: 'none' }"
                    >
                      {{ statusLabel(detailApp.status) }}
                    </a-tag>
                  </div>
                  <div class="summary-line2">
                    <span>创建：{{ formatDateTime(detailApp.createdAt) }}</span>
                    <span v-if="detailApp.preferredTime">期望时间：{{ detailApp.preferredTime }}</span>
                    <span v-if="detailApp.assignedExpertName">专家：{{ detailApp.assignedExpertName }}</span>
                  </div>
                  <div class="summary-line3">
                    <span v-if="detailApp.createdByDoctorName">发起医生：{{ detailApp.createdByDoctorName }}</span>
                    <span>{{ methodLabel(detailApp.preferredMethod) }}</span>
                    <span>ID：{{ detailApp.id }}</span>
                  </div>
                </div>

                <telemedicine-progress
                  class="tm-progress"
                  :current-stage="detailApp.serviceStage"
                  :status="detailApp.status"
                />

                <a-alert
                  v-if="postReportInfo"
                  class="tm-post-report"
                  show-icon
                  :type="postReportInfo.type"
                  :title="postReportInfo.title"
                >
                  <template #content>
                    <ul class="post-report-list">
                      <li v-for="tip in postReportInfo.tips" :key="tip">{{ tip }}</li>
                    </ul>
                  </template>
                </a-alert>

                <a-divider orientation="left" class="tm-section-title"><span>服务概览</span></a-divider>
                <a-descriptions
                  :column="2"
                  size="large"
                  :label-style="{ width: '150px', color: '#475569', fontSize: '14px' }"
                  :value-style="{ color: '#0f172a', fontSize: '15px', lineHeight: '22px' }"
                >
                  <a-descriptions-item label="服务类型">{{ serviceTypeLabel(detailApp.serviceType) }}</a-descriptions-item>
                  <a-descriptions-item label="当前阶段">{{ stageLabel(detailApp.serviceStage) }}</a-descriptions-item>
                  <a-descriptions-item label="期望方式">{{ methodLabel(detailApp.preferredMethod) }}</a-descriptions-item>
                  <a-descriptions-item label="期望时间">{{ detailApp.preferredTime || '未填写' }}</a-descriptions-item>
                  <a-descriptions-item label="发起医生">
                    {{ detailApp.createdByDoctorName || '—' }}
                    <span v-if="detailApp.createdByDoctorHospital" class="muted">（{{ detailApp.createdByDoctorHospital }}）</span>
                  </a-descriptions-item>
                  <a-descriptions-item label="指派专家">{{ detailApp.assignedExpertName || '待指派' }}</a-descriptions-item>
                </a-descriptions>

                <div class="tm-support" v-if="detailApp.supportTags?.length">
                  <span class="support-label">协同模式</span>
                  <a-tag v-for="tag in detailApp.supportTags" :key="tag" class="support-tag">{{ supportTagLabel(tag) }}</a-tag>
                </div>

                <a-divider orientation="left" class="tm-section-title"><span>会诊安排与接入</span></a-divider>
                <div class="tm-section-card">
                  <div v-if="detailApp.schedule" class="tm-info-row">
                    <strong>会诊时间：</strong>{{ formatDateTime(detailApp.schedule.scheduledAt) }} · {{ methodLabel(detailApp.schedule.method) }}
                  </div>
                  <div v-else class="muted">管理员排期后将自动展示具体时间。</div>
                  <div v-if="detailApp.schedule?.meetingUrl" class="muted">会议链接：{{ detailApp.schedule.meetingUrl }}</div>
                  <div v-if="detailApp.schedule?.note" class="muted">备注：{{ detailApp.schedule.note }}</div>

                  <div v-if="patientConfirmInfo" class="tm-confirm-info">
                    <a-tag color="success" class="confirm-tag">患者已确认</a-tag>
                    <div class="muted">
                      {{ patientConfirmInfo.confirmedBy }} · {{ formatDateTime(patientConfirmInfo.confirmedAt) }}
                      <span v-if="patientConfirmInfo.note"> · {{ patientConfirmInfo.note }}</span>
                    </div>
                  </div>
                  <div v-else-if="awaitingPatientConfirm" class="tm-confirm-pending">
                    <a-alert type="warning" show-icon message="等待患者确认是否按时参加，可与患者沟通确认。" />
                  </div>

                  <div class="tm-diagnosis">
                    <div class="tm-diagnosis-head">远程诊断接口（示例占位）</div>
                    <p class="muted">
                      可在此集成云影像、云检验或第三方视频平台。演示环境提供占位按钮用于更新处理轨迹。
                    </p>
                    <div v-if="detailApp.diagnosisAccess" class="tm-diagnosis-meta">
                      <div>接入方式：{{ diagnosisProviderLabel(detailApp.diagnosisAccess.provider) }}</div>
                      <div v-if="detailApp.diagnosisAccess.url">会话地址：{{ detailApp.diagnosisAccess.url }}</div>
                      <div v-if="detailApp.diagnosisAccess.accessCode">访问码：{{ detailApp.diagnosisAccess.accessCode }}</div>
                      <div v-if="detailApp.diagnosisAccess.note">说明：{{ detailApp.diagnosisAccess.note }}</div>
                    </div>
                    <a-space class="tm-diagnosis-actions">
                      <a-button
                        type="primary"
                        status="success"
                        :loading="sessionSubmitting"
                        :disabled="!canStartSession"
                        @click="handleStartSession"
                      >启动远程诊断（示例）</a-button>
                      <a-button
                        v-if="detailApp.diagnosisAccess?.url"
                        type="outline"
                        :disabled="!canOpenConsultEntry"
                        @click="openExternal(detailApp.diagnosisAccess.url)"
                      >打开会诊入口</a-button>
                      <div>{{ detailApp.diagnosisAccess?.note ? detailApp.diagnosisAccess.note : '无' }}</div>
                    </a-space>
                  </div>
                </div>

                <a-divider orientation="left" class="tm-section-title"><span>病情资料</span></a-divider>
                <div class="tm-section-card">
                  <div class="tm-block">{{ detailApp.description }}</div>
                  <div class="attach-list" v-if="detailApp.attachments.length">
                    <a-tag v-for="(file, idx) in detailApp.attachments" :key="idx" class="attach-tag" type="primary">{{ file }}</a-tag>
                  </div>
                  <div v-else class="muted">尚未上传病历资料</div>
                </div>

                <div>{{ doctorProfile?.expertId ? doctorProfile.expertId : '无' }} {{ detailApp.diagnosisAccess?.note ? detailApp.diagnosisAccess.note : '无' }}</div>
                <template v-if="canFillReport">
                  <a-divider orientation="left" class="tm-section-title"><span>填写诊断报告</span></a-divider>
                  <div class="tm-section-card report-form">
                    <a-alert type="info" show-icon>完成远程诊断后填写结论与建议（演示提交）。</a-alert>
                    <a-form layout="vertical">
                      <a-form-item label="诊断结论" required>
                        <a-textarea
                          v-model:model-value="reportConclusion"
                          :auto-size="{ minRows: 3, maxRows: 5 }"
                          placeholder="例如：建议进一步冠脉造影"
                        />
                      </a-form-item>
                      <a-form-item label="治疗建议" required>
                        <a-textarea
                          v-model:model-value="reportAdvice"
                          :auto-size="{ minRows: 3, maxRows: 5 }"
                          placeholder="用药、康复、复诊安排等"
                        />
                      </a-form-item>
                      <a-form-item label="附件（可选，逗号分隔）">
                        <a-input v-model:model-value="reportAttachments" placeholder="report.pdf, echo.png" />
                      </a-form-item>
                    </a-form>
                    <div class="report-actions">
                      <a-button type="primary" :loading="reportSubmitting" @click="submitReport">提交报告</a-button>
                    </div>
                  </div>
                </template>

                <template v-if="detailApp.report">
                  <a-divider orientation="left" class="tm-section-title"><span>专家诊断报告</span></a-divider>
                  <div class="tm-section-card">
                    <div class="tm-block">
                      <p><strong>结论：</strong>{{ detailApp.report.conclusion }}</p>
                      <p><strong>建议：</strong>{{ detailApp.report.advice }}</p>
                      <div v-if="detailApp.report.attachments?.length" class="muted">附件：{{ detailApp.report.attachments.join('、') }}</div>
                      <div class="muted">提交时间：{{ formatDateTime(detailApp.report.submittedAt) }}</div>
                    </div>
                  </div>
                </template>

                <template v-if="detailApp.feedback">
                  <a-divider orientation="left" class="tm-section-title"><span>患者评价</span></a-divider>
                  <div class="tm-section-card">
                    <div class="tm-block">
                      <p><strong>评分：</strong>{{ detailApp.feedback.rating }} 分</p>
                      <p v-if="detailApp.feedback.comment"><strong>评价：</strong>{{ detailApp.feedback.comment }}</p>
                      <div class="muted">提交时间：{{ formatDateTime(detailApp.feedback.submittedAt) }}</div>
                    </div>
                  </div>
                </template>

                <template v-if="detailApp.serviceEvaluation">
                  <a-divider orientation="left" class="tm-section-title"><span>管理员服务评价</span></a-divider>
                  <div class="tm-section-card">
                    <div class="tm-block">
                      <p><strong>评分：</strong>{{ detailApp.serviceEvaluation.rating }} 分</p>
                      <p v-if="detailApp.serviceEvaluation.comment"><strong>备注：</strong>{{ detailApp.serviceEvaluation.comment }}</p>
                      <div class="muted">{{ detailApp.serviceEvaluation.evaluator }} · {{ formatDateTime(detailApp.serviceEvaluation.submittedAt) }}</div>
                    </div>
                  </div>
                </template>

                <template v-if="detailApp.history?.length">
                  <a-divider orientation="left" class="tm-section-title"><span>处理轨迹</span></a-divider>
                  <a-timeline mode="left" class="tm-timeline">
                    <a-timeline-item v-for="(item, index) in detailApp.history" :key="index" :label="formatDateTime(item.at)">
                      <div class="timeline-entry">
                        <strong>{{ item.actor }}</strong>
                        <div class="muted">{{ item.action }}</div>
                      </div>
                    </a-timeline-item>
                  </a-timeline>
                </template>
              </div>
            </a-card>
          </div>
          <a-empty v-else description="未找到远程医疗记录" />
        </template>
      </a-spin>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import {
  fetchTelemedicineDetail,
  startTelemedicineSession,
  submitTelemedicineReport,
  type TelemedicineApp
} from '@/api/mock/telemedicine';
import {
  diagnosisProviderLabel,
  formatDateTime,
  methodLabel,
  serviceTypeLabel,
  stageLabel,
  stageStyle,
  statusLabel,
  statusStyle,
  supportTagLabel
} from '@/composables/useTelemedicineDetail';
import TelemedicineProgress from '@/components/TelemedicineProgress.vue';
import { useTelemedicineSync } from '@/composables/useTelemedicineSync';
import { useCurrentUser } from '@/composables/useCurrentUser';

const route = useRoute();
const router = useRouter();

const { doctorProfile, currentUser } = useCurrentUser();

const currentDoctorId = computed(() => {
  const id = doctorProfile.value?.expertId ?? currentUser.value?.expertId;
  return id != null ? String(id) : '';
});

const currentDoctorName = computed(
  () => doctorProfile.value?.name ?? currentUser.value?.displayName ?? '未识别医生'
);

const currentExpertId = computed(() => {
  const expertId = doctorProfile.value?.expertId ?? currentUser.value?.expertId;
  const doctorId = currentDoctorId.value;
  return expertId || doctorId;
});

const detailLoading = ref(false);
const detailApp = ref<TelemedicineApp | null>(null);

const reportConclusion = ref('');
const reportAdvice = ref('');
const reportAttachments = ref('');
const reportSubmitting = ref(false);
const sessionSubmitting = ref(false);
const viewportHeight = ref(typeof window !== 'undefined' ? window.innerHeight : 900);

const CARD_SCROLL_OFFSET = 220;
const MIN_SCROLL_HEIGHT = 360;

const cardScrollHeight = computed(() =>
  Math.max(MIN_SCROLL_HEIGHT, viewportHeight.value - CARD_SCROLL_OFFSET)
);

const rootVars = computed(() => ({ '--tm-scroll-height': `${cardScrollHeight.value}px` }));

const isExpert = computed(() => {
  const expertKey = currentExpertId.value;
  if (!expertKey) return false;
  return detailApp.value?.assignedExpertId === expertKey;
});

const postReportInfo = computed(() => {
  if (!detailApp.value?.report) return null;
  const stage = detailApp.value.serviceStage;
  if (stage === 'report_submitted') {
    return {
      type: 'info' as const,
      title: '诊断报告已提交，等待患者与管理员后续动作',
      tips: [
        '患者端已开放报告展示，提醒患者及时查看并填写满意度评价。',
        '管理员将根据患者反馈与资料补充，完成服务评价并关闭流程。'
      ]
    };
  }
  if (stage === 'evaluated') {
    return {
      type: 'success' as const,
      title: '患者评价已提交，等待管理员完成流程归档',
      tips: [
        '可在下方查看患者评价详情，如需补充资料请及时上传附件。',
        '管理员完成服务评价后将自动关闭案例，可在处理轨迹追踪状态。'
      ]
    };
  }
  if (stage === 'closed') {
    return {
      type: 'success' as const,
      title: '远程医疗服务已归档',
      tips: [
        '管理员已完成流程评估，建议在团队复盘会议共享经验。',
        '报告、患者反馈与流程轨迹已锁定，可随时回溯查阅。'
      ]
    };
  }
  return null;
});

const canStartSession = computed(() => {
  if (!isExpert.value || !detailApp.value) return false;
  return ['scheduled', 'in_consult'].includes(detailApp.value.serviceStage);
});

const canOpenConsultEntry = computed(() => detailApp.value?.serviceStage === 'in_consult');

const canFillReport = computed(() => {
  if (!isExpert.value || !detailApp.value) return false;
  if (detailApp.value.report) return false;
  return ['in_consult', 'report_submitted'].includes(detailApp.value.serviceStage);
});

const patientConfirmInfo = computed(() => detailApp.value?.patientConfirmation ?? null);

const awaitingPatientConfirm = computed(() => {
  if (!detailApp.value) return false;
  if (detailApp.value.serviceStage !== 'scheduled') return false;
  return !detailApp.value.patientConfirmation;
});

const detailTitle = computed(() =>
  detailApp.value?.patientName ? `${detailApp.value.patientName} · 远程医疗详情` : '远程医疗详情'
);

function goBack() {
  router.back();
}

function resetReportForm(detail?: TelemedicineApp | null) {
  if (!detail || !detail.report) {
    reportConclusion.value = '';
    reportAdvice.value = '';
    reportAttachments.value = '';
    return;
  }
  reportConclusion.value = detail.report.conclusion;
  reportAdvice.value = detail.report.advice;
  reportAttachments.value = detail.report.attachments?.join(', ') || '';
}

async function loadDetail() {
  const id = route.params.id as string | undefined;
  if (!id) return;
  detailLoading.value = true;
  try {
    const detail = await fetchTelemedicineDetail(id);
    detailApp.value = detail;
    resetReportForm(detail);
  } finally {
    detailLoading.value = false;
  }
}

async function handleStartSession() {
  if (!detailApp.value) return;
  const doctorName = currentDoctorName.value;
  sessionSubmitting.value = true;
  try {
    const updated = await startTelemedicineSession(detailApp.value.id, doctorName, {
      provider: 'external',
      url: detailApp.value.diagnosisAccess?.url || `https://virtualclinic.example.com/session/${detailApp.value.id}`,
      note: detailApp.value.diagnosisAccess?.note || '示例：调用第三方视频会诊平台'
    });
    if (updated) {
      Message.success('已标记为进行远程诊断');
      await loadDetail();
    }
  } finally {
    sessionSubmitting.value = false;
  }
}

function openExternal(url: string) {
  if (!canOpenConsultEntry.value) {
    Message.warning('仅在远程诊断进行中时可进入会诊');
    return;
  }
  window.open(url, '_blank');
}

async function submitReport() {
  if (!detailApp.value) return;
  if (!reportConclusion.value.trim() || !reportAdvice.value.trim()) {
    Message.warning('请填写完整的诊断结论与建议');
    return;
  }
  const expertId = currentExpertId.value || currentDoctorId.value;
  if (!expertId) {
    Message.error('未获取到专家账号信息，请重新登录后再试');
    return;
  }
  reportSubmitting.value = true;
  try {
    const attachments = reportAttachments.value
      .split(',')
      .map((s) => s.trim())
      .filter((s) => !!s);
    const updated = await submitTelemedicineReport(detailApp.value.id, {
      conclusion: reportConclusion.value.trim(),
      advice: reportAdvice.value.trim(),
      attachments,
      expertId
    });
    if (updated) {
      Message.success('诊断报告已提交');
      await loadDetail();
    }
  } finally {
    reportSubmitting.value = false;
  }
}

function updateViewportHeight() {
  if (typeof window === 'undefined') return;
  viewportHeight.value = window.innerHeight;
}

watch(
  () => route.params.id,
  () => {
    loadDetail();
  }
);

onMounted(() => {
  loadDetail();
  updateViewportHeight();
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', updateViewportHeight);
    window.addEventListener('orientationchange', updateViewportHeight);
  }
});

useTelemedicineSync(() => {
  loadDetail();
});

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', updateViewportHeight);
    window.removeEventListener('orientationchange', updateViewportHeight);
  }
});
</script>

<style scoped>
.tm-detail-page { padding: 16px 20px 32px; display: flex; flex-direction: column; gap: 18px; min-height: 100vh; }
.tm-page-header { padding: 0; margin-bottom: 4px; }
.tm-content { flex: 1; display: flex; }
.tm-scroll-area { flex: 1; height: var(--tm-scroll-height); }
.tm-card { height: 100%; border: 1px solid rgba(15,23,42,0.08); border-radius: 14px; box-shadow: 0 12px 32px rgba(15,23,42,0.12); background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%); display: flex; flex-direction: column; }
.tm-card :deep(.arco-card-body) { padding: 0; height: 100%; display: flex; flex-direction: column; }
.tm-card-scroll { padding: 26px 28px 30px; display: flex; flex-direction: column; gap: 22px; flex: 1; overflow: auto; }
.tm-card-scroll::-webkit-scrollbar { width: 8px; }
.tm-card-scroll::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.35); border-radius: 6px; }
.tm-summary { display: flex; flex-direction: column; gap: 10px; padding: 20px 22px; background: rgba(37,99,235,0.08); border: 1px solid rgba(37,99,235,0.12); border-radius: 12px; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.6); }
.summary-line1 { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; font-size: 20px; font-weight: 700; color: #0f172a; }
.summary-patient { color: #0f3ea5; }
.summary-tag { border: none; border-radius: 999px; font-size: 13px; font-weight: 600; padding: 4px 10px; }
.summary-tag.type { background: rgba(37,99,235,0.16); color: #1d4ed8; }
.summary-line2, .summary-line3 { display: flex; flex-wrap: wrap; gap: 14px; color: #475569; font-size: 13px; }
.tm-progress { padding: 6px 4px 0; }
.tm-section-title { margin: 24px 0 12px; font-weight: 600; }
.tm-section-title span { font-size: 18px; color: #0f172a; }
.tm-support { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; padding: 6px 0; }
.support-tag { background: rgba(99,102,241,0.12); color: #4338ca; border: none; border-radius: 999px; }
.support-label { font-weight: 600; color: #0f172a; }
.tm-section-card { background: rgba(255,255,255,0.94); border: 1px solid rgba(15,23,42,0.06); border-radius: 12px; padding: 16px 18px; display: flex; flex-direction: column; gap: 12px; box-shadow: 0 6px 16px rgba(15,23,42,0.08); }
.tm-info-row { color: #0f172a; }
.tm-diagnosis { border-top: 1px dashed rgba(37,99,235,0.22); padding-top: 12px; display: flex; flex-direction: column; gap: 8px; }
.tm-diagnosis-head { font-weight: 600; color: #0f3ea5; }
.tm-diagnosis-meta { display: flex; flex-direction: column; gap: 4px; color: #0f172a; }
.tm-diagnosis-actions { justify-content: flex-start; }
.tm-confirm-info { margin-top: 10px; display: flex; flex-direction: column; gap: 6px; }
.tm-confirm-info .confirm-tag { align-self: flex-start; border: none; background: rgba(22,163,74,0.12); color: #15803d; }
.tm-confirm-pending { margin-top: 10px; }
.tm-block { background: rgba(248,250,255,0.9); border: 1px solid rgba(15,95,255,0.12); border-radius: 10px; padding: 12px 14px; line-height: 1.6; color: #334155; white-space: pre-wrap; }
.attach-list { display: flex; flex-wrap: wrap; gap: 8px; }
.attach-tag { background: rgba(11,102,179,0.12); border: none; color: #0b66b3; border-radius: 999px; }
.tm-timeline { margin-top: 4px; }
.timeline-entry { display: flex; flex-direction: column; gap: 2px; }
.report-form { gap: 12px; }
.report-actions { display: flex; justify-content: flex-end; min-height: auto; white-space: normal; overflow: visible;}
.tm-post-report { border-radius: 12px; padding: 16px 20px; flex-shrink: 0; overflow: visible; }
.post-report-list { margin: 6px 0 0; padding-left: 20px; display: flex; flex-direction: column; gap: 4px; color: #475569; font-size: 13px; }
@media (max-width: 960px) {
  .tm-card-scroll { padding: 20px; }
}
</style>
