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
                  <span>创建时间：{{ formatDateTime(detailApp.createdAt) }}</span>
                  <span v-if="detailApp.preferredTime">期望时间：{{ detailApp.preferredTime }}</span>
                  <span>期望方式：{{ methodLabel(detailApp.preferredMethod) }}</span>
                </div>
                <div class="summary-line3">
                  <span v-if="detailApp.createdByDoctorName">发起医生：{{ detailApp.createdByDoctorName }}</span>
                  <span v-if="detailApp.createdByDoctorHospital" class="muted">（{{ detailApp.createdByDoctorHospital }}）</span>
                  <span v-if="detailApp.assignedExpertName">专家：{{ detailApp.assignedExpertName }}</span>
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

              <div class="tm-support">
                <span class="support-label">协同模式</span>
                <template v-if="detailApp.supportTags?.length">
                  <a-tag v-for="tag in detailApp.supportTags" :key="tag" class="support-tag">{{ supportTagLabel(tag) }}</a-tag>
                </template>
                <span v-else class="muted">未设置</span>
              </div>

              <a-divider orientation="left" class="tm-section-title"><span>远程诊疗接入</span></a-divider>
              <div class="tm-section-card">
                <div v-if="detailApp.schedule" class="tm-info-row">
                  <strong>会诊时间：</strong>{{ formatDateTime(detailApp.schedule.scheduledAt) }} · {{ methodLabel(detailApp.schedule.method) }}
                </div>
                <div v-else class="muted">医生排期后将自动展示具体时间。</div>
                <div v-if="detailApp.schedule?.meetingUrl" class="muted">会议链接：{{ detailApp.schedule.meetingUrl }}</div>
                <div v-if="detailApp.schedule?.note" class="muted">备注：{{ detailApp.schedule.note }}</div>

                <div class="tm-diagnosis">
                  <div class="tm-diagnosis-head">医生安排的远程会诊入口</div>
                  <div v-if="detailApp.diagnosisAccess" class="tm-diagnosis-meta">
                    <div>接入方式：{{ diagnosisProviderLabel(detailApp.diagnosisAccess.provider) }}</div>
                    <div v-if="detailApp.diagnosisAccess.url">会诊链接：{{ detailApp.diagnosisAccess.url }}</div>
                    <div v-if="detailApp.diagnosisAccess.accessCode">访问码：{{ detailApp.diagnosisAccess.accessCode }}</div>
                    <div v-if="detailApp.diagnosisAccess.note">说明：{{ detailApp.diagnosisAccess.note }}</div>
                    <a-button
                      v-if="detailApp.diagnosisAccess.url"
                      type="primary"
                      size="small"
                      @click="openExternal(detailApp.diagnosisAccess.url)"
                    >打开会诊入口</a-button>
                  </div>
                  <div v-else class="muted">医生安排远程会诊后，这里将出现视频/云影像入口信息。</div>
                </div>

                <div v-if="patientConfirmInfo" class="tm-confirm-info">
                  <a-alert type="success" show-icon title="已确认参加会诊">
                    <template #content>
                      <div class="muted">
                        {{ patientConfirmInfo.confirmedBy }} · {{ formatDateTime(patientConfirmInfo.confirmedAt) }}
                        <span v-if="patientConfirmInfo.note"> · {{ patientConfirmInfo.note }}</span>
                      </div>
                    </template>
                  </a-alert>
                </div>
                <div v-else-if="canConfirmAttendance" class="tm-confirm-prompt">
                  <a-alert type="warning" show-icon title="请确认是否按时参加">
                    <template #content>
                      <div class="muted">确认后管理员与专家可看到您的到诊承诺，便于提前准备。</div>
                    </template>
                  </a-alert>
                  <div class="tm-confirm-actions">
                    <a-button size="small" type="primary" @click="openConfirm">确认按时参加</a-button>
                  </div>
                </div>
              </div>

              <a-divider orientation="left" class="tm-section-title"><span>病情资料</span></a-divider>
              <div class="tm-section-card">
                <div class="tm-block">{{ detailApp.description }}</div>
                <div class="attach-list" v-if="detailApp.attachments.length">
                  <a-tag v-for="(file, idx) in detailApp.attachments" :key="idx" type="primary" class="attach-tag">{{ file }}</a-tag>
                </div>
                <div v-else class="muted">暂无附件资料</div>
              </div>

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

              <template v-if="detailApp.serviceEvaluation">
                <a-divider orientation="left" class="tm-section-title"><span>医院服务评价</span></a-divider>
                <div class="tm-section-card">
                  <div class="tm-block">
                    <p><strong>管理员评分：</strong>{{ detailApp.serviceEvaluation.rating }} 分</p>
                    <p v-if="detailApp.serviceEvaluation.comment"><strong>备注：</strong>{{ detailApp.serviceEvaluation.comment }}</p>
                    <div class="muted">{{ detailApp.serviceEvaluation.evaluator }} · {{ formatDateTime(detailApp.serviceEvaluation.submittedAt) }}</div>
                  </div>
                </div>
              </template>

              <template v-if="canSubmitFeedback">
                <a-divider orientation="left" class="tm-section-title"><span>我的评价</span></a-divider>
                <div class="tm-section-card feedback-form">
                  <div class="muted">请对本次远程服务进行评价</div>
                  <a-rate v-model:model-value="feedbackRating" :count="5" />
                  <a-textarea
                    v-model:value="feedbackComment"
                    :autosize="{ minRows: 2, maxRows: 4 }"
                    placeholder="可填写对专家诊疗的意见或建议"
                  />
                  <div class="feedback-actions">
                    <a-button size="small" @click="goBack">稍后评价</a-button>
                    <a-button size="small" type="primary" :loading="feedbackSubmitting" @click="submitFeedback">提交评价</a-button>
                  </div>
                </div>
              </template>

              <template v-else-if="detailApp.feedback">
                <a-divider orientation="left" class="tm-section-title"><span>我的评价</span></a-divider>
                <div class="tm-section-card">
                  <div class="tm-block">
                    <p class="muted">满意度：{{ detailApp.feedback.rating }} / 5</p>
                    <p>{{ detailApp.feedback.comment || '无文字评价' }}</p>
                    <div class="muted" style="margin-top:4px">提交时间：{{ formatDateTime(detailApp.feedback.submittedAt) }}</div>
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

    <a-modal
      v-model:visible="confirmVisible"
      title="确认按时参加会诊"
      width="420px"
      :mask-closable="false"
    >
      <p class="muted" style="margin-bottom:12px;">如需补充说明（家属陪同、网络准备等），可在此填写备注。</p>
      <a-textarea v-model:value="confirmNote" :auto-size="{ minRows: 2, maxRows: 4 }" placeholder="选填：例如会前 30 分钟上线测试设备" />
      <template #footer>
        <a-space>
          <a-button @click="confirmVisible = false">稍后再说</a-button>
          <a-button type="primary" :loading="confirming" @click="submitConfirmAttendance">确认参加</a-button>
        </a-space>
      </template>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import { IconClockCircle, IconUser } from '@arco-design/web-vue/es/icon';
import {
  confirmTelemedicineAttendance,
  fetchTelemedicineDetail,
  submitTelemedicineFeedback,
  type TelemedicineApp,
  type TelemedicineServiceStage
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

void IconClockCircle;
void IconUser;

const route = useRoute();
const router = useRouter();

const detailLoading = ref(false);
const detailApp = ref<TelemedicineApp | null>(null);
const feedbackRating = ref(5);
const feedbackComment = ref('');
const feedbackSubmitting = ref(false);
const confirmVisible = ref(false);
const confirmNote = ref('');
const confirming = ref(false);
const viewportHeight = ref(typeof window !== 'undefined' ? window.innerHeight : 900);

const CARD_SCROLL_OFFSET = 220;
const MIN_SCROLL_HEIGHT = 360;

const cardScrollHeight = computed(() =>
  Math.max(MIN_SCROLL_HEIGHT, viewportHeight.value - CARD_SCROLL_OFFSET)
);

const rootVars = computed(() => ({ '--tm-scroll-height': `${cardScrollHeight.value}px` }));

const canSubmitFeedback = computed(() => {
  if (!detailApp.value) return false;
  if (detailApp.value.feedback) return false;
  const allowed: TelemedicineServiceStage[] = ['report_submitted', 'evaluated'];
  return allowed.includes(detailApp.value.serviceStage);
});

const canConfirmAttendance = computed(() => {
  if (!detailApp.value) return false;
  if (!detailApp.value.schedule) return false;
  if (detailApp.value.patientConfirmation) return false;
  return detailApp.value.serviceStage === 'scheduled';
});

const patientConfirmInfo = computed(() => detailApp.value?.patientConfirmation || null);

const postReportInfo = computed(() => {
  if (!detailApp.value) return null;
  const stage = detailApp.value.serviceStage;
  if (stage === 'report_submitted' && detailApp.value.report) {
    return {
      type: 'info' as const,
      title: '专家报告已发布，别忘了完成评价',
      tips: [
        '请及时查看诊断结论与建议，如有疑问可联系发起医生。',
        '点击下方“我的评价”可对远程诊疗体验进行评分与反馈。'
      ]
    };
  }
  if (stage === 'evaluated') {
    return {
      type: 'success' as const,
      title: '感谢反馈，管理员将尽快完成归档',
      tips: [
        '您的满意度已记录，管理员会结合反馈进行服务评价。',
        '如需补充资料，可联系对应医生追加附件。'
      ]
    };
  }
  if (stage === 'closed') {
    return {
      type: 'success' as const,
      title: '远程医疗服务已结束',
      tips: [
        '所有诊疗记录与评价已归档，可随时回顾报告内容。',
        '若需新的远程服务，请重新发起申请。'
      ]
    };
  }
  if (stage === 'scheduled') {
    if (detailApp.value.patientConfirmation) {
      return {
        type: 'success' as const,
        title: '您已确认参加，请提前做好准备',
        tips: [
          '建议提前 10 分钟上线测试设备，确保音视频正常。',
          '如计划发生变化，请尽快联系主诊医生调整排期。'
        ]
      };
    }
    return {
      type: 'warning' as const,
      title: '会诊已排期，别忘了确认出席',
      tips: [
        '点击下方按钮确认按时参加，让医生和专家提前做好准备。',
        '若需调整时间，请联系主诊医生或管理员协助修改排期。'
      ]
    };
  }
  if (stage === 'in_consult') {
    return {
      type: 'warning' as const,
      title: '正在进行远程诊断，请按时参加会诊',
      tips: [
        '请检查网络环境，确保能顺利加入远程会诊。',
        '会诊完成后，专家会在此页面发布诊断报告。'
      ]
    };
  }
  return null;
});

const detailTitle = computed(() =>
  detailApp.value?.patientName ? `${detailApp.value.patientName} · 远程医疗详情` : '远程医疗详情'
);

function goBack() {
  router.back();
}

async function loadDetail() {
  const id = route.params.id as string | undefined;
  if (!id) return;
  detailLoading.value = true;
  try {
    const detail = await fetchTelemedicineDetail(id);
    detailApp.value = detail;
    if (detail?.feedback) {
      feedbackRating.value = detail.feedback.rating;
      feedbackComment.value = detail.feedback.comment || '';
    } else {
      feedbackRating.value = 5;
      feedbackComment.value = '';
    }
    if (!detail?.patientConfirmation) {
      confirmNote.value = '';
    }
  } finally {
    detailLoading.value = false;
  }
}

function openConfirm() {
  confirmVisible.value = true;
  confirmNote.value = '';
}

async function submitConfirmAttendance() {
  if (!detailApp.value) return;
  confirming.value = true;
  try {
    const updated = await confirmTelemedicineAttendance(detailApp.value.id, {
      patientId: detailApp.value.patientId,
      patientName: detailApp.value.patientName,
      note: confirmNote.value.trim() || undefined
    });
    if (updated) {
      Message.success('已确认按时参加远程会诊');
      confirmVisible.value = false;
      await loadDetail();
    }
  } finally {
    confirming.value = false;
  }
}

async function submitFeedback() {
  if (!detailApp.value) return;
  feedbackSubmitting.value = true;
  try {
    const updated = await submitTelemedicineFeedback(detailApp.value.id, {
      rating: feedbackRating.value,
      comment: feedbackComment.value.trim() || undefined,
      patientId: detailApp.value.patientId
    });
    if (updated) {
      Message.success('已提交评价');
      await loadDetail();
    }
  } finally {
    feedbackSubmitting.value = false;
  }
}

function openExternal(url: string) {
  window.open(url, '_blank');
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
.tm-confirm-info { margin-top: 10px; }
.tm-confirm-prompt { margin-top: 12px; display: flex; flex-direction: column; gap: 10px; }
.tm-confirm-actions { display: flex; justify-content: flex-end; }
.tm-block { background: rgba(248,250,255,0.9); border: 1px solid rgba(15,95,255,0.12); border-radius: 10px; padding: 12px 14px; line-height: 1.6; color: #334155; white-space: pre-wrap; }
.attach-list { display: flex; flex-wrap: wrap; gap: 8px; }
.attach-tag { background: rgba(11,102,179,0.12); border: none; color: #0b66b3; border-radius: 999px; }
.tm-timeline { margin-top: 4px; }
.timeline-entry { display: flex; flex-direction: column; gap: 2px; }
.feedback-form { gap: 12px; }
.feedback-actions { display: flex; justify-content: flex-end; gap: 10px; }
.tm-post-report { border-radius: 12px; }
.post-report-list { margin: 6px 0 0; padding-left: 20px; display: flex; flex-direction: column; gap: 4px; color: #475569; font-size: 13px; }
@media (max-width: 960px) {
  .tm-card-scroll { padding: 20px; }
}
</style>
