<template>
  <div class="admin-lecture-detail">
    <a-page-header
      class="page-header"
      :title="lecture ? lecture.title : '讲座详情'"
      :subtitle="lecture ? formatDateTime(lecture.createdAt) : ''"
      @back="goBack"
    >
      <template #extra>
        <a-space>
          <a-button type="outline" @click="loadLecture" :loading="loading">刷新</a-button>
          <a-button type="primary" @click="handleApprove" :disabled="!canApprove" :loading="actionLoading">审核通过</a-button>
          <a-button type="outline" status="danger" @click="handleReject" :disabled="!canReject" :loading="actionLoading">驳回</a-button>
          <a-button type="outline" status="success" @click="openNoticeModal" :disabled="!canPublish" :loading="actionLoading">发布通知</a-button>
          <a-button type="outline" status="warning" @click="handleCloseEnrollment" :disabled="!canCloseEnrollment" :loading="actionLoading">关闭报名</a-button>
          <a-button type="outline" status="success" @click="handleMarkLive" :disabled="!canMarkLive" :loading="actionLoading">标记直播</a-button>
          <a-button type="outline" status="success" @click="openReportModal" :disabled="!canGenerateReport" :loading="actionLoading">生成报告</a-button>
          <a-button type="outline" status="normal" @click="handleArchive" :disabled="!canArchive" :loading="actionLoading">归档</a-button>
        </a-space>
      </template>
    </a-page-header>

    <div class="detail-body">
      <a-spin :loading="loading">
        <template #element>
          <div v-if="lecture" class="detail-main">
            <div class="detail-scroll">
              <div class="detail-content">
                <a-card :bordered="false" class="summary-card">
                  <div class="summary-head">
                    <div class="summary-title">
                      <h2>{{ lecture.title }}</h2>
                      <a-tag :color="stageStyle(lecture.stage).color" :style="{ backgroundColor: stageStyle(lecture.stage).bg, border: 'none' }">
                        {{ stageLabel(lecture.stage) }}
                      </a-tag>
                      <a-tag :color="statusStyle(lecture.status).color" :style="{ backgroundColor: statusStyle(lecture.status).bg, border: 'none' }">
                        {{ statusLabel(lecture.status) }}
                      </a-tag>
                    </div>
                    <p class="muted">{{ lecture.summary }}</p>
                    <a-descriptions :column="2">
                      <a-descriptions-item label="讲座类型">{{ categoryLabel(lecture.category) }}</a-descriptions-item>
                      <a-descriptions-item label="目标人群">{{ audienceLabel(lecture.targetAudience) }}</a-descriptions-item>
                      <a-descriptions-item label="可见范围">{{ lectureVisibilityLabel(lecture.visibility) }}</a-descriptions-item>
                      <a-descriptions-item label="计划时间">{{ formatDateTime(lecture.plannedAt) }}</a-descriptions-item>
                      <a-descriptions-item label="预计时长">{{ lecture.durationMinutes || 60 }} 分钟</a-descriptions-item>
                      <a-descriptions-item label="发起人">{{ lecture.organizerName }}（{{ lecture.organizerHospital }}）</a-descriptions-item>
                      <a-descriptions-item label="主讲专家">{{ lecture.lecturer.name }} · {{ lecture.lecturer.title || '职称待定' }}</a-descriptions-item>
                    </a-descriptions>
                  </div>
                </a-card>

                <div class="grid-columns">
                  <a-card class="column-card" title="直播信息" :bordered="false">
                    <template v-if="lecture.session">
                      <p><strong>直播时间：</strong>{{ formatDateTime(lecture.session.scheduledAt) }}</p>
                      <p><strong>直播平台：</strong>{{ lecture.session.livestreamProvider || '待定' }}</p>
                      <p v-if="lecture.session.meetingUrl"><strong>链接：</strong>{{ lecture.session.meetingUrl }}</p>
                      <p v-if="lecture.session.accessCode"><strong>访问码：</strong>{{ lecture.session.accessCode }}</p>
                      <p v-if="lecture.session.host"><strong>主持人：</strong>{{ lecture.session.host }}</p>
                    </template>
                    <div v-else class="muted">尚未设置直播信息。</div>
                  </a-card>

                  <a-card class="column-card" title="开课通知" :bordered="false">
                    <template v-if="lecture.notice">
                      <p><strong>发布渠道：</strong>{{ channelLabel(lecture.notice.channel) }}</p>
                      <p><strong>发布人：</strong>{{ lecture.notice.publishedBy }}</p>
                      <p><strong>发布时间：</strong>{{ formatDateTime(lecture.notice.publishedAt) }}</p>
                      <p><strong>面向对象：</strong>{{ audienceLabel(lecture.notice.audience) }}</p>
                      <p class="muted">{{ lecture.notice.summary }}</p>
                    </template>
                    <div v-else class="muted">待发布通知。</div>
                  </a-card>
                </div>

                <a-card class="column-card" title="身份验证记录" :bordered="false">
                  <a-empty v-if="!lecture.verificationRecords.length" description="尚无验证记录" />
                  <a-timeline v-else>
                    <a-timeline-item v-for="item in lecture.verificationRecords" :key="item.id" :label="formatDateTime(item.createdAt)">
                      <div class="timeline-entry">
                        <strong>{{ verificationPhaseLabel(item.phase) }}</strong>
                        <div class="muted">{{ verificationOutcomeLabel(item.status) }} · {{ item.note || '无备注' }}</div>
                      </div>
                    </a-timeline-item>
                  </a-timeline>
                </a-card>

                <a-card class="column-card" title="参与人员" :bordered="false">
                  <a-table
                    :data="lecture.participants"
                    :columns="participantColumns"
                    :pagination="false"
                    size="small"
                  >
                    <template #verifiedPhases="{ record }">
                      <a-space wrap>
                        <a-tag v-if="!record.verifiedPhases.length" type="outline">未验证</a-tag>
                        <a-tag v-for="phase in record.verifiedPhases" :key="phase" type="primary">
                          {{ verificationPhaseLabel(phase) }}
                        </a-tag>
                      </a-space>
                    </template>
                    <template #verificationStatus="{ record }">
                      <a-tag :color="record.verificationStatus === 'passed' ? 'arcoblue' : record.verificationStatus === 'failed' ? 'red' : 'orange'">
                        {{ verificationOutcomeLabel(record.verificationStatus) }}
                      </a-tag>
                    </template>
                  </a-table>
                </a-card>

                <a-card class="column-card" title="资料与附件" :bordered="false">
                  <a-table :data="lecture.materials" :pagination="false" size="small">
                    <template #columns>
                      <a-table-column title="名称" data-index="name" />
                      <a-table-column title="类型" data-index="type" />
                      <a-table-column title="受众" data-index="audience">
                        <template #cell="{ record }">
                          {{ audienceLabel(record.audience) }}
                        </template>
                      </a-table-column>
                      <a-table-column title="上传时间" data-index="uploadedAt">
                        <template #cell="{ record }">
                          {{ formatDateTime(record.uploadedAt) }}
                        </template>
                      </a-table-column>
                    </template>
                  </a-table>
                </a-card>

                <a-card class="column-card" title="处理轨迹" :bordered="false">
                  <a-timeline v-if="lecture.history.length" mode="left">
                    <a-timeline-item v-for="item in lecture.history" :key="item.id" :label="formatDateTime(item.at)">
                      <div class="timeline-entry">
                        <strong>{{ item.actor }}</strong>
                        <div class="muted">{{ item.action }}</div>
                      </div>
                    </a-timeline-item>
                  </a-timeline>
                  <a-empty v-else description="暂无历史记录" />
                </a-card>

                <div class="spring"></div>
              </div>
            </div>
          </div>
          <a-empty v-else description="未找到讲座" />
        </template>
      </a-spin>
    </div>

    <a-modal v-model:visible="noticeVisible" title="发布开课通知" @ok="submitNotice" :confirm-loading="modalLoading">
      <a-form :model="noticeForm" layout="vertical">
        <a-form-item label="通知摘要" required>
          <a-textarea v-model="noticeForm.summary" :auto-size="{ minRows: 3, maxRows: 5 }" />
        </a-form-item>
        <a-form-item label="发布渠道" required>
          <a-select v-model="noticeForm.channel">
            <a-option value="platform">平台通知</a-option>
            <a-option value="email">邮件</a-option>
            <a-option value="sms">短信</a-option>
            <a-option value="mixed">多渠道</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="面向对象" required>
          <a-select v-model="noticeForm.audience">
            <a-option value="medical_staff">医务人员</a-option>
            <a-option value="patients">患者/公众</a-option>
            <a-option value="mixed">医患混合</a-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="reportVisible" title="生成讲座报告" @ok="submitReport" :confirm-loading="modalLoading">
      <a-form :model="reportForm" layout="vertical">
        <a-form-item label="报告摘要" required>
          <a-textarea v-model="reportForm.summary" :auto-size="{ minRows: 3, maxRows: 5 }" />
        </a-form-item>
        <a-form-item label="出勤率 (0-1)" required>
          <a-input-number v-model="reportForm.attendanceRate" :min="0" :max="1" :step="0.05" style="width: 100%" />
        </a-form-item>
        <a-form-item label="满意度评分 (1-5)">
          <a-input-number v-model="reportForm.satisfactionScore" :min="1" :max="5" :step="0.1" style="width: 100%" />
        </a-form-item>
        <a-form-item label="改进建议">
          <a-textarea v-model="reportForm.recommendations" :auto-size="{ minRows: 2, maxRows: 4 }" placeholder="每行一条建议" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import {
  archiveLecture,
  compileLectureReport,
  fetchTeachingLectureDetail,
  markLectureLive,
  publishLectureNotice,
  reviewTeachingLecture,
  closeLectureEnrollment,
  type TeachingLecture,
  type LectureViewerContext
} from '@/api/mock/teaching';
import {
  lectureStageLabel,
  lectureStageStyle,
  lectureStatusLabel,
  lectureStatusStyle,
  lectureCategoryLabel,
  lectureAudienceLabel,
  lectureVisibilityLabel,
  verificationPhaseLabel,
  verificationOutcomeLabel
} from '@/composables/useTeachingLecture';
import { useCurrentUser } from '@/composables/useCurrentUser';

const route = useRoute();
const router = useRouter();
const { currentUser } = useCurrentUser();

const lectureViewer = computed<LectureViewerContext>(() => ({
  role: 'admin',
  userId: currentUser.value?.id ?? undefined,
  organization: currentUser.value?.hospitalName ?? null
}));

const loading = ref(false);
const actionLoading = ref(false);
const modalLoading = ref(false);
const lecture = ref<TeachingLecture | null>(null);
const noticeVisible = ref(false);
const reportVisible = ref(false);

const participantColumns = [
  { title: '姓名', dataIndex: 'name', width: 140 },
  { title: '角色', dataIndex: 'role', width: 120 },
  { title: '机构', dataIndex: 'organization', width: 180 },
  { title: '验证阶段', dataIndex: 'verifiedPhases', slotName: 'verifiedPhases', width: 220 },
  { title: '验证状态', dataIndex: 'verificationStatus', slotName: 'verificationStatus', width: 120 }
];

const noticeForm = reactive({
  summary: '',
  channel: 'platform',
  audience: 'medical_staff'
});

const reportForm = reactive({
  summary: '',
  attendanceRate: 0.8,
  satisfactionScore: 4.5,
  recommendations: ''
});

const canApprove = computed(() => !!lecture.value && ['applied', 'under_review'].includes(lecture.value.stage));
const canReject = computed(() => canApprove.value);
const canPublish = computed(() => !!lecture.value && ['approved', 'notice_published'].includes(lecture.value.stage));
const canCloseEnrollment = computed(() => lecture.value?.stage === 'notice_published');
const canMarkLive = computed(() => !!lecture.value && ['approved', 'notice_published', 'enrollment_closed'].includes(lecture.value.stage));
const canGenerateReport = computed(() => !!lecture.value && ['in_session', 'post_verification'].includes(lecture.value.stage));
const canArchive = computed(() => lecture.value?.stage === 'report_ready' && lecture.value.status === 'completed');

function formatDateTime(value?: string) {
  if (!value) return '待定';
  const normalized = value.includes('T') ? value : `${value}Z`;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function stageLabel(stage: TeachingLecture['stage']) {
  return lectureStageLabel(stage);
}

function stageStyle(stage: TeachingLecture['stage']) {
  return lectureStageStyle(stage);
}

function statusLabel(status: TeachingLecture['status']) {
  return lectureStatusLabel(status);
}

function statusStyle(status: TeachingLecture['status']) {
  return lectureStatusStyle(status);
}

function categoryLabel(category: TeachingLecture['category']) {
  return lectureCategoryLabel(category);
}

function audienceLabel(audience: TeachingLecture['targetAudience']) {
  return lectureAudienceLabel(audience);
}

type NoticeChannel = 'platform' | 'email' | 'sms' | 'mixed';

function channelLabel(channel: NoticeChannel) {
  switch (channel) {
    case 'platform':
      return '平台通知';
    case 'email':
      return '邮件';
    case 'sms':
      return '短信';
    default:
      return '多渠道';
  }
}

async function loadLecture() {
  const id = route.params.id as string | undefined;
  if (!id) return;
  loading.value = true;
  try {
    const detail = await fetchTeachingLectureDetail(id, { viewer: lectureViewer.value });
    if (!detail) {
      lecture.value = null;
      Message.warning('讲座不存在或已撤回');
      return;
    }
    lecture.value = detail;
  } finally {
    loading.value = false;
  }
}

async function handleApprove() {
  if (!lecture.value || !canApprove.value) return;
  actionLoading.value = true;
  try {
    const updated = await reviewTeachingLecture(lecture.value.id, {
      decision: 'approved',
      reviewerId: currentUser.value?.id ? String(currentUser.value.id) : 'admin',
      reviewerName: currentUser.value?.displayName || '管理员'
    });
    if (updated) {
      lecture.value = updated;
      Message.success('讲座申请已通过');
    }
  } finally {
    actionLoading.value = false;
  }
}

async function handleReject() {
  if (!lecture.value || !canReject.value) return;
  actionLoading.value = true;
  try {
    const updated = await reviewTeachingLecture(lecture.value.id, {
      decision: 'rejected',
      reviewerId: currentUser.value?.id ? String(currentUser.value.id) : 'admin',
      reviewerName: currentUser.value?.displayName || '管理员'
    });
    if (updated) {
      lecture.value = updated;
      Message.success('讲座申请已驳回');
    }
  } finally {
    actionLoading.value = false;
  }
}

function openNoticeModal() {
  if (!lecture.value || !canPublish.value) return;
  noticeForm.summary = `${lecture.value.title} 将于 ${formatDateTime(lecture.value.plannedAt)} 举办，请相关人员准时参加。`;
  noticeForm.channel = 'platform';
  noticeForm.audience = lecture.value.targetAudience;
  noticeVisible.value = true;
}

async function submitNotice() {
  if (!lecture.value) return;
  if (!noticeForm.summary) {
    Message.warning('请填写通知摘要');
    return;
  }
  modalLoading.value = true;
  try {
    const updated = await publishLectureNotice(lecture.value.id, {
      summary: noticeForm.summary,
      channel: noticeForm.channel as 'platform' | 'email' | 'sms' | 'mixed',
      audience: noticeForm.audience as 'medical_staff' | 'patients' | 'mixed',
      publishedBy: currentUser.value?.id ? String(currentUser.value.id) : 'admin',
      publishedByName: currentUser.value?.displayName || '管理员'
    });
    if (updated) {
      lecture.value = updated;
      Message.success('通知已发布');
      noticeVisible.value = false;
    }
  } finally {
    modalLoading.value = false;
  }
}

async function handleCloseEnrollment() {
  if (!lecture.value || !canCloseEnrollment.value) return;
  actionLoading.value = true;
  try {
    const updated = await closeLectureEnrollment(lecture.value.id, {
      closedBy: currentUser.value?.id ? String(currentUser.value.id) : 'admin',
      closedByName: currentUser.value?.displayName || '管理员'
    });
    if (updated) {
      lecture.value = updated;
      Message.success('报名已关闭');
    }
  } finally {
    actionLoading.value = false;
  }
}

async function handleMarkLive() {
  if (!lecture.value || !canMarkLive.value) return;
  actionLoading.value = true;
  try {
    const updated = await markLectureLive(lecture.value.id, {
      host: currentUser.value?.displayName || '主持人',
      meetingUrl: lecture.value.session?.meetingUrl,
      accessCode: lecture.value.session?.accessCode,
      livestreamProvider: lecture.value.session?.livestreamProvider
    });
    if (updated) {
      lecture.value = updated;
      Message.success('已标记直播进行中');
    }
  } finally {
    actionLoading.value = false;
  }
}

function openReportModal() {
  if (!lecture.value || !canGenerateReport.value) return;
  reportForm.summary = `${lecture.value.title} 讲座已完成，请汇总出勤与反馈。`;
  reportForm.attendanceRate = 0.8;
  reportForm.satisfactionScore = 4.5;
  reportForm.recommendations = '';
  reportVisible.value = true;
}

async function submitReport() {
  if (!lecture.value) return;
  if (!reportForm.summary) {
    Message.warning('请填写报告摘要');
    return;
  }
  modalLoading.value = true;
  try {
    const recommendations = reportForm.recommendations
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);
    const updated = await compileLectureReport(lecture.value.id, {
      summary: reportForm.summary,
      attendanceRate: reportForm.attendanceRate,
      satisfactionScore: reportForm.satisfactionScore,
      recommendations,
      generatedBy: currentUser.value?.id ? String(currentUser.value.id) : 'admin',
      generatedByName: currentUser.value?.displayName || '管理员'
    });
    if (updated) {
      lecture.value = updated;
      Message.success('报告已生成');
      reportVisible.value = false;
    }
  } finally {
    modalLoading.value = false;
  }
}

async function handleArchive() {
  if (!lecture.value || !canArchive.value) return;
  actionLoading.value = true;
  try {
    const updated = await archiveLecture(lecture.value.id, currentUser.value?.displayName || '管理员');
    if (updated) {
      lecture.value = updated;
      Message.success('讲座已归档');
    }
  } finally {
    actionLoading.value = false;
  }
}

function goBack() {
  router.back();
}

loadLecture();
</script>

<style scoped lang="less">
.admin-lecture-detail {
  padding-bottom: 32px;
  height: 100vh;
  display: flex;
  flex-direction: column;

  .page-header {
    flex: 0 0 auto; //header不参与滚动
    background: #fff;
    border-radius: 12px;
    margin-bottom: 16px;
    box-shadow: 0 8px 16px rgba(15, 23, 42, 0.06);
  }

  .detail-body {
    width: 100%;
    display: flex;
    flex-direction: column;
    background: transparent;
    flex: 1;
    min-height: 0;
    gap: 0;
  }

  .detail-main {
    flex: 1 1 auto;
    display: flex;
    min-height: 0;
  }

  .detail-scroll {
    flex: 1 1 auto;
    overflow: auto;
    padding-right: 12px;
    min-height: 200px;
    max-height: calc(100vh - 200px);
  }

  .detail-scroll::-webkit-scrollbar {
    width: 6px;
  }

  .detail-scroll::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }

  .detail-content {
    display: flex;
    flex-direction: column;
    gap: 16px;

    > * {
      width: 100%;
    }
  }

  .summary-card {
    border-radius: 12px;
  }

  .summary-title {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;

    h2 {
      margin: 0;
      font-size: 22px;
    }
  }

  .grid-columns {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 16px;
  }

  .column-card {
    border-radius: 12px;
  }

  .muted {
    color: #64748b;
  }

  .timeline-entry {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .spring {
    height: 48px; 
    flex-shrink: 0; 
  }
}
</style>
