<template>
  <div class="tm-detail-page">
    <a-page-header
      class="tm-page-header"
      @back="goBack"
      :title="detailTitle"
      :subtitle="detailApp ? formatDateTime(detailApp.createdAt) : ''"
    >
      <template #extra>
        <a-space>
          <a-button type="outline" @click="loadDetail" :loading="detailLoading">刷新</a-button>
          <a-button
            v-if="canStartReview"
            type="primary"
            status="warning"
            :loading="reviewing"
            @click="startReview"
          >
            标记审核中
          </a-button>
          <a-button
            type="primary"
            status="danger"
            v-if="detailApp?.status === 'pending'"
            @click="openReject"
          >
            拒绝申请
          </a-button>
        </a-space>
      </template>
    </a-page-header>

    <a-spin :loading="detailLoading">
      <template #element>
        <div v-if="detailApp" class="tm-detail-body">
          <div class ="tm-detail-scroll" style="flex:1 1 auto;">
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
                  <span>申请时间：{{ formatDateTime(detailApp.createdAt) }}</span>
                  <span v-if="detailApp.preferredTime">期望时间：{{ detailApp.preferredTime }}</span>
                  <span>期望方式：{{ methodLabel(detailApp.preferredMethod) }}</span>
                </div>
                <div class="summary-line3">
                  <span v-if="detailApp.createdByDoctorName">发起医生：{{ detailApp.createdByDoctorName }}</span>
                  <span>专家：{{ detailApp.assignedExpertName || '待指派' }}</span>
                  <span>ID：{{ detailApp.id }}</span>
                </div>
              </div>

              <telemedicine-progress
                class="tm-progress"
                :current-stage="detailApp.serviceStage"
                :status="detailApp.status"
              />

              <a-alert
                v-if="postStageInfo"
                class="tm-stage-alert"
                show-icon
                :type="postStageInfo.type"
                :title="postStageInfo.title"
              >
                <template #content>
                  <ul class="stage-alert-list">
                    <li v-for="tip in postStageInfo.tips" :key="tip">{{ tip }}</li>
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

              <a-divider orientation="left" class="tm-section-title"><span>会诊安排与接入</span></a-divider>
              <div class="tm-section-card">
                <div v-if="detailApp.schedule" class="tm-info-row">
                  <strong>安排时间：</strong>{{ formatDateTime(detailApp.schedule.scheduledAt) }} · {{ methodLabel(detailApp.schedule.method) }}
                </div>
                <div v-else class="muted">完成审核后，请录入会诊排期信息。</div>
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
                  <a-alert type="warning" show-icon message="等待患者确认是否按时参加，会诊前请保持联络通畅。" />
                </div>

                <div class="tm-diagnosis">
                  <div class="tm-diagnosis-head">远程诊断协同（占位）</div>
                  <p class="muted">可在此维护第三方视频/云影像平台接入信息，方便医生端快速进入。</p>
                  <div v-if="detailApp.diagnosisAccess" class="tm-diagnosis-meta">
                    <div>接入方式：{{ diagnosisProviderLabel(detailApp.diagnosisAccess.provider) }}</div>
                    <div v-if="detailApp.diagnosisAccess.url">会话地址：{{ detailApp.diagnosisAccess.url }}</div>
                    <div v-if="detailApp.diagnosisAccess.accessCode">访问码：{{ detailApp.diagnosisAccess.accessCode }}</div>
                    <div v-if="detailApp.diagnosisAccess.note">说明：{{ detailApp.diagnosisAccess.note }}</div>
                  </div>
                  <a-space class="tm-diagnosis-actions">
                    <a-button type="outline" @click="copyAccessInfo" :disabled="!detailApp.diagnosisAccess">复制接入信息</a-button>
                  </a-space>
                </div>
              </div>

              <a-divider orientation="left" class="tm-section-title"><span>病情资料</span></a-divider>
              <div class="tm-section-card">
                <div class="tm-block">{{ detailApp.description }}</div>
                <div class="attach-list" v-if="detailApp.attachments.length">
                  <a-tag v-for="(file, idx) in detailApp.attachments" :key="idx" class="attach-tag" type="primary">{{ file }}</a-tag>
                </div>
                <div v-else class="muted">暂无病历资料</div>
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

              <template v-if="canEvaluate">
                <a-divider orientation="left" class="tm-section-title"><span>流程收尾（管理员填写）</span></a-divider>
                <div class="tm-section-card evaluation-form">
                  <a-alert type="success" show-icon message="专家报告已提交，可记录服务评分并关闭流程。" />
                  <div class="evaluation-fields">
                    <div class="field">
                      <label>服务评分</label>
                      <a-rate v-model:value="evaluationRating" :count="5" />
                    </div>
                    <div class="field">
                      <label>备注建议</label>
                      <a-textarea v-model:value="evaluationComment" :auto-size="{ minRows: 2, maxRows: 4 }" placeholder="服务协作亮点、待改进项等（选填）" />
                    </div>
                  </div>
                  <div class="evaluation-actions">
                    <a-space>
                      <a-button @click="resetEvaluationForm">重置</a-button>
                      <a-button type="primary" :loading="evaluationSubmitting" @click="submitEvaluation">提交评价并关闭</a-button>
                    </a-space>
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

              <template v-if="detailApp.status === 'pending'">
                <a-divider orientation="left" class="tm-section-title"><span>审核与排期</span></a-divider>
                <div class="tm-section-card">
                  <a-alert type="info" show-icon message="填写排期信息后提交即可完成专家指派（演示数据）" class="assign-tip" />
                  <div class="assign-form">
                    <div class="form-row">
                      <label>指派专家</label>
                      <a-select v-model:value="assignExpertId" 
                        placeholder="选择专家" 
                        allow-clear 
                        @update:model-value="(val: string) => assignExpertId = val"
                        @change="console.log(assignExpertId)">
                        <a-option v-for="expert in experts" :key="expert.id" :value="expert.id">
                          {{ expert.name }} · {{ expert.specialty }} · {{ expert.hospital }}
                        </a-option>
                      </a-select>
                    </div>
                    <div class="form-row">
                      <label>会诊方式</label>
                      <a-radio-group v-model:value="assignMethod" type="button">
                        <a-radio value="video">视频</a-radio>
                        <a-radio value="phone">电话</a-radio>
                        <a-radio value="text">图文</a-radio>
                      </a-radio-group>
                    </div>
                    <div class="form-row">
                      <label>日期</label>
                      <a-input 
                      @update:model-value="(val: string) => assignDate = val"
                      @change="console.log(assignDate)"
                      placeholder="例如 2025-09-28" />
                    </div>
                    <div class="form-row">
                      <label>时间</label>
                      <a-input
                        @update:model-value="(val: string) => assignTime = val"
                        @change="console.log(assignTime)"
                        placeholder="例如 15:30" />
                    </div>
                    <div class="form-row">
                      <label>会议链接</label>
                      <a-input
                        @update:model-value="(val: string) => assignMeeting = val"
                        placeholder="https://example.com/meet/abc" allow-clear />
                    </div>
                    <div class="form-row">
                      <label>备注</label>
                      <a-textarea 
                        @update:model-value="(val: string) => assignNote = val"
                        :auto-size="{ minRows: 2, maxRows: 4 }" 
                        placeholder="额外说明（选填）" />
                    </div>
                  </div>
                  <div class="assign-actions">
                    <a-space>
                      <a-button status="danger" type="text" @click="openReject">拒绝申请</a-button>
                      <a-button type="primary" :loading="assigning" @click="submitAssign">提交排期</a-button>
                    </a-space>
                  </div>
                </div>
              </template>
            </div>
          </a-card>
        </div>
        </div> 
        <a-empty v-else description="未找到远程医疗记录" />
      </template>
    </a-spin>

    <a-modal v-model:visible="rejectVisible" title="拒绝申请" width="420px" :mask-closable="false">
      <a-textarea v-model:value="rejectReason" :auto-size="{ minRows: 3, maxRows: 5 }" @update:model-value="(val: string) => rejectReason = val"
        placeholder="请输入拒绝原因，将同步记录到处理轨迹" />
      <template #footer>
        <a-space>
          <a-button @click="rejectVisible = false">取消</a-button>
          <a-button type="primary" status="danger" :loading="rejecting" @click="confirmReject">确认拒绝</a-button>
        </a-space>
      </template>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import {
  assignTelemedicineCase,
  closeTelemedicineService,
  fetchTelemedicineDetail,
  fetchTelemedicineExperts,
  markTelemedicineUnderReview,
  rejectTelemedicineCase,
  type ExpertSummary,
  type TelemedicineApp,
  type TelemedicineMethod
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

const route = useRoute();
const router = useRouter();

const ADMIN_ID = 'admin-001';

const detailLoading = ref(false);
const detailApp = ref<TelemedicineApp | null>(null);
const experts = ref<ExpertSummary[]>([]);

const assignExpertId = ref('');
const assignMethod = ref<TelemedicineMethod>('video');
const assignDate = ref('');
const assignTime = ref('');
const assignMeeting = ref('');
const assignNote = ref('');
const assigning = ref(false);
const reviewing = ref(false);

const rejectVisible = ref(false);
const rejectReason = ref('');
const rejecting = ref(false);

const evaluationRating = ref(5);
const evaluationComment = ref('');
const evaluationSubmitting = ref(false);

const canEvaluate = computed(() => {
  if (!detailApp.value) return false;
  if (detailApp.value.serviceEvaluation) return false;
  return ['report_submitted', 'evaluated'].includes(detailApp.value.serviceStage);
});

const canStartReview = computed(() => {
  if (!detailApp.value) return false;
  return detailApp.value.serviceStage === 'applied' && detailApp.value.status === 'pending';
});

const patientConfirmInfo = computed(() => detailApp.value?.patientConfirmation ?? null);

const awaitingPatientConfirm = computed(() => {
  if (!detailApp.value) return false;
  if (detailApp.value.serviceStage !== 'scheduled') return false;
  return !detailApp.value.patientConfirmation;
});

const postStageInfo = computed(() => {
  if (!detailApp.value) return null;
  const stage = detailApp.value.serviceStage;
  if (stage === 'review') {
    return {
      type: 'warning' as const,
      title: '已进入审核阶段，补充排期信息后可推进服务',
      tips: [
        '核对患者资料与期望方式，确认是否需要补充材料。',
        '可在下方排期区域指派专家并设置会诊时间及接入方式。'
      ]
    };
  }
  if (stage === 'scheduled') {
    return awaitingPatientConfirm.value
      ? {
          type: 'info' as const,
          title: '排期已确认，等待患者确认到诊',
          tips: [
            '建议通过短信/电话提醒患者确认参加，确保远程会诊顺利进行。',
            '收到确认后，可将重点注意事项同步给专家与护理团队。'
          ]
        }
      : {
          type: 'success' as const,
          title: '患者已确认参加会诊，准备进入远程诊断阶段',
          tips: [
            '可再次核对远程会诊入口、影像资料等前置条件。',
            '若需补充资料或调整排期，请及时通知患者与专家。'
          ]
        };
  }
  if (stage === 'report_submitted') {
    return {
      type: 'info' as const,
      title: '专家报告已生成，等待患者评价与管理员归档',
      tips: [
        '患者端此时可查看报告并提交满意度评价，可关注处理轨迹了解反馈状态。',
        '若需补录资料，可提醒专家更新附件或补充诊断说明。'
      ]
    };
  }
  if (stage === 'evaluated') {
    return {
      type: 'success' as const,
      title: '患者评价已就绪，请完成管理员服务评价',
      tips: [
        '参考患者反馈及专家报告填写服务评分，可在下方表单直接归档。',
        '归档后仍可在处理轨迹中回溯全部历史动作。'
      ]
    };
  }
  if (stage === 'closed') {
    return {
      type: 'success' as const,
      title: '流程已归档，可通过调度中心检索复盘',
      tips: [
        '管理员评价已提交，当前记录进入历史档案备用。',
        '如需重新开启服务，可新建申请或复制原有资料。'
      ]
    };
  }
  if (stage === 'in_consult') {
    return {
      type: 'warning' as const,
      title: '远程诊断进行中，关注会诊接入信息',
      tips: [
        '确保专家和患者均可访问会议链接或远程查房系统。',
        '如需调整排期，可返回上一步重新指派。'
      ]
    };
  }
  return null;
});

const detailTitle = computed(() =>
  detailApp.value?.patientName ? `${detailApp.value.patientName} · 远程医疗申请` : '远程医疗详情'
);

function goBack() {
  router.back();
}

function splitIso(value: string | undefined) {
  if (!value) return { date: '', time: '' };
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return { date: '', time: '' };
  return {
    date: `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, '0')}-${`${d.getDate()}`.padStart(2, '0')}`,
    time: `${`${d.getHours()}`.padStart(2, '0')}:${`${d.getMinutes()}`.padStart(2, '0')}`
  };
}

function resetAssignForm(detail: TelemedicineApp | null) {
  if (!detail) {
    assignExpertId.value = '';
    assignMethod.value = 'video';
    assignDate.value = '';
    assignTime.value = '';
    assignMeeting.value = '';
    assignNote.value = '';
    return;
  }
  assignExpertId.value = detail.assignedExpertId || '';
  assignMethod.value = detail.schedule?.method || detail.preferredMethod || 'video';
  assignMeeting.value = '';
  assignNote.value = '';
  const { date, time } = splitIso(detail.schedule?.scheduledAt);
  assignDate.value = date;
  assignTime.value = time;
}

function resetEvaluationForm() {
  evaluationRating.value = 5;
  evaluationComment.value = '';
}

async function loadExperts() {
  experts.value = await fetchTelemedicineExperts();
}

async function loadDetail() {
  const id = route.params.id as string | undefined;
  if (!id) return;
  detailLoading.value = true;
  try {
    const detail = await fetchTelemedicineDetail(id);
    detailApp.value = detail;
    if (detail) {
      resetAssignForm(detail);
      if (detail.serviceEvaluation) {
        evaluationRating.value = detail.serviceEvaluation.rating;
        evaluationComment.value = detail.serviceEvaluation.comment || '';
      } else {
        resetEvaluationForm();
      }
    }
  } finally {
    detailLoading.value = false;
  }
}

async function submitAssign() {
  if (!detailApp.value) return;
  if (!assignExpertId.value) {
    Message.warning('请选择指派的专家');
    return;
  }
  if (!assignDate.value.trim()) {
    Message.warning('请填写会诊日期');
    return;
  }
  const scheduled = new Date(`${assignDate.value}T${assignTime.value || '09:00'}:00`);
  if (Number.isNaN(scheduled.getTime())) {
    console.error('无效的日期与时间', { date: assignDate.value, time: assignTime.value });
    Message.error('请填写有效的日期与时间');
    return;
  }
  const expert = experts.value.find((e) => e.id === assignExpertId.value);
  if (!expert) {
    Message.error('所选专家不存在');
    return;
  }
  assigning.value = true;
  try {
    const updated = await assignTelemedicineCase(detailApp.value.id, {
      expertId: expert.id,
      expertName: expert.name,
      scheduledAt: scheduled.toISOString(),
      method: assignMethod.value,
      meetingUrl: assignMeeting.value || undefined,
      note: assignNote.value || undefined,
      assignedBy: ADMIN_ID
    });
    if (updated) {
      Message.success('已完成指派（演示数据）');
      await loadDetail();
    }
  } finally {
    assigning.value = false;
  }
}

async function startReview() {
  if (!detailApp.value) return;
  if (!canStartReview.value) {
    Message.info('当前状态无需标记审核');
    return;
  }
  reviewing.value = true;
  try {
    const updated = await markTelemedicineUnderReview(detailApp.value.id, '管理员');
    if (updated && updated.serviceStage === 'review') {
      Message.success('已进入审核阶段');
      await loadDetail();
    } else {
      Message.info('当前流程无法进入审核阶段');
    }
  } finally {
    reviewing.value = false;
  }
}

function openReject() {
  rejectReason.value = '';
  rejectVisible.value = true;
}

async function confirmReject() {
  if (!detailApp.value) return;
  if (!rejectReason.value.trim()) {
    Message.warning('请填写拒绝原因');
    return;
  }
  rejecting.value = true;
  try {
    const updated = await rejectTelemedicineCase(detailApp.value.id, rejectReason.value.trim(), '管理员');
    if (updated) {
      Message.success('已标记为拒绝');
      rejectVisible.value = false;
      await loadDetail();
    }
  } finally {
    rejecting.value = false;
  }
}

async function submitEvaluation() {
  if (!detailApp.value) return;
  evaluationSubmitting.value = true;
  try {
    const updated = await closeTelemedicineService(detailApp.value.id, {
      name: '管理员',
      rating: evaluationRating.value,
      comment: evaluationComment.value.trim() || undefined
    });
    if (updated) {
      Message.success('流程已关闭并记录评价');
      await loadDetail();
    }
  } finally {
    evaluationSubmitting.value = false;
  }
}

async function copyAccessInfo() {
  if (!detailApp.value?.diagnosisAccess) return;
  const info = [
    `接入方式：${diagnosisProviderLabel(detailApp.value.diagnosisAccess.provider)}`,
    detailApp.value.diagnosisAccess.url ? `会话地址：${detailApp.value.diagnosisAccess.url}` : '',
    detailApp.value.diagnosisAccess.accessCode ? `访问码：${detailApp.value.diagnosisAccess.accessCode}` : '',
    detailApp.value.diagnosisAccess.note ? `说明：${detailApp.value.diagnosisAccess.note}` : ''
  ]
    .filter(Boolean)
    .join('\n');
  try {
    await navigator.clipboard.writeText(info);
    Message.success('已复制接入信息');
  } catch (error) {
    console.error(error);
    Message.warning('当前环境无法复制，请手动记录');
  }
}

watch(
  () => route.params.id,
  () => {
    loadDetail();
  }
);

useTelemedicineSync(() => {
  loadDetail();
});

onMounted(async () => {
  await Promise.all([loadExperts(), loadDetail()]);
});
</script>

<style scoped>
.tm-detail-page { padding: 16px 20px 32px; display: flex; flex-direction: column; gap: 20px; }
.tm-page-header { padding: 0; margin-bottom: 4px; }
.tm-detail-body { display: flex; flex-direction: column; gap: 18px; }
.tm-card { border: 1px solid rgba(15,23,42,0.08); border-radius: 14px; box-shadow: 0 12px 32px rgba(15,23,42,0.12); background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%); }
.tm-card :deep(.arco-card-body) { padding: 0; }
.tm-card-scroll { padding: 26px 28px 30px; display: flex; flex-direction: column; gap: 22px; }
.tm-summary { display: flex; flex-direction: column; gap: 10px; padding: 20px 22px; background: rgba(37,99,235,0.08); border: 1px solid rgba(37,99,235,0.12); border-radius: 12px; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.6); }
.summary-line1 { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; font-size: 20px; font-weight: 700; color: #0f172a; }
.summary-patient { color: #0f3ea5; }
.summary-tag { border: none; border-radius: 999px; font-size: 13px; font-weight: 600; padding: 4px 10px; }
.summary-tag.type { background: rgba(37,99,235,0.16); color: #1d4ed8; }
.summary-line2, .summary-line3 { display: flex; flex-wrap: wrap; gap: 14px; color: #475569; font-size: 13px; }
.tm-progress { padding: 4px 10px 0; }
.tm-stage-alert { border-radius: 12px; margin-top: -4px; }
.stage-alert-list { margin: 6px 0 0; padding-left: 20px; display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: #475569; }
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
.tm-confirm-info .confirm-tag { align-self: flex-start; border: none; background: rgba(22, 163, 74, 0.12); color: #15803d; }
.tm-confirm-pending { margin-top: 10px; }
.tm-block { background: rgba(248,250,255,0.9); border: 1px solid rgba(15,95,255,0.12); border-radius: 10px; padding: 12px 14px; line-height: 1.6; color: #334155; white-space: pre-wrap; }
.attach-list { display: flex; flex-wrap: wrap; gap: 8px; }
.attach-tag { background: rgba(11,102,179,0.12); border: none; color: #0b66b3; border-radius: 999px; }
.tm-timeline { margin-top: 4px; }
.timeline-entry { display: flex; flex-direction: column; gap: 2px; }
.evaluation-form { gap: 16px; }
.evaluation-fields { display: flex; flex-direction: column; gap: 12px; }
.evaluation-fields .field { display: flex; flex-direction: column; gap: 8px; }
.evaluation-fields label { font-weight: 600; color: #0f172a; }
.evaluation-actions { display: flex; justify-content: flex-end; }
.assign-form { display: flex; flex-direction: column; gap: 12px; }
.form-row { display: flex; flex-direction: column; gap: 6px; }
.form-row label { font-weight: 600; color: #0f172a; }
.assign-actions { display: flex; justify-content: flex-end; margin-top: 12px; }
.assign-tip { border-radius: 10px; }
.tm-detail-scroll {
  overflow: auto; /* 垂直滚动 */
  min-height: 200px;    /* flex 子元素必须设置 */
  padding-right: 12px; /* 可选，防止滚动条遮挡 */
  max-height: calc(100vh - 200px); /* 根据需要调整最大高度 */
}

@media (max-width: 960px) {
  .tm-card-scroll { padding: 20px; }
}
</style>
