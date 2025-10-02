<template>
  <div class="admin-lecture-board">
    <a-page-header
      class="page-header"
      title="远程教学看板"
      subtitle="审核、调度并归档医联体远程教学活动"
    >
      <template #extra>
        <a-space>
          <a-button type="outline" @click="loadLectures" :loading="loading">刷新</a-button>
        </a-space>
      </template>
    </a-page-header>

    <a-card :bordered="false">
      <a-table
        :data="lectures"
        :columns="columns"
        :loading="loading"
        row-key="id"
        :pagination="{
          pageSize: 10,
          showTotal: true
        }"
      >
        <template #stage="{ record }">
          <a-tag :color="stageStyle(record.stage).color" :style="{ backgroundColor: stageStyle(record.stage).bg, border: 'none' }">
            {{ stageLabel(record.stage) }}
          </a-tag>
        </template>
        <template #status="{ record }">
          <a-tag :color="statusStyle(record.status).color" :style="{ backgroundColor: statusStyle(record.status).bg, border: 'none' }">
            {{ statusLabel(record.status) }}
          </a-tag>
        </template>
        <template #plannedAt="{ record }">
          {{ formatDateTime(record.plannedAt) }}
        </template>
        <template #actions="{ record }">
          <a-space>
            <a-button type="text" @click="goDetail(record.id)">详情</a-button>
            <a-dropdown trigger="hover">
              <a-button type="text">操作</a-button>
              <template #content>
                <a-doption v-for="action in availableActions(record)" :key="action.key" @click="action.handler(record)">{{ action.label }}</a-doption>
              </template>
            </a-dropdown>
          </a-space>
        </template>
      </a-table>
    </a-card>

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
        <a-form-item label="报名截止时间">
          <a-date-picker v-model="noticeForm.enrollmentClosesAt" show-time format="YYYY-MM-DD HH:mm" value-format="YYYY-MM-DD HH:mm" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="reportVisible" title="生成讲座报告" @ok="submitReport" :confirm-loading="modalLoading">
      <a-form :model="reportForm" layout="vertical">
        <a-form-item label="报告摘要" required>
          <a-textarea v-model="reportForm.summary" :auto-size="{ minRows: 3, maxRows: 6 }" />
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
import { useRouter } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import type { TableColumnData } from '@arco-design/web-vue';
import {
  archiveLecture,
  closeLectureEnrollment,
  compileLectureReport,
  fetchTeachingLecturesForViewer,
  markLectureLive,
  publishLectureNotice,
  reviewTeachingLecture,
  type TeachingLecture,
  type LectureViewerContext
} from '@/api/mock/teaching';
import {
  lectureStageLabel,
  lectureStageStyle,
  lectureStatusLabel,
  lectureStatusStyle,
  lectureCategoryLabel,
  lectureVisibilityLabel
} from '@/composables/useTeachingLecture';
import { useCurrentUser } from '@/composables/useCurrentUser';

const router = useRouter();
const { currentUser } = useCurrentUser();

const lectureViewer = computed<LectureViewerContext>(() => ({
  role: 'admin',
  userId: currentUser.value?.id ?? undefined,
  organization: currentUser.value?.hospitalName ?? null
}));

const loading = ref(false);
const modalLoading = ref(false);
const lectures = ref<TeachingLecture[]>([]);
const noticeVisible = ref(false);
const reportVisible = ref(false);
const targetLecture = ref<TeachingLecture | null>(null);

const noticeForm = reactive({
  summary: '',
  channel: 'platform',
  audience: 'medical_staff',
  enrollmentClosesAt: ''
});

const reportForm = reactive({
  summary: '',
  attendanceRate: 0.8,
  satisfactionScore: 4.5,
  recommendations: ''
});

const columns: TableColumnData[] = [
  { title: '讲座标题', dataIndex: 'title', ellipsis: true },
  { title: '类型', dataIndex: 'category', width: 160, render: ({ record }: { record: TeachingLecture }) => lectureCategoryLabel(record.category) },
  { title: '计划时间', dataIndex: 'plannedAt', slotName: 'plannedAt', width: 180 },
  { title: '阶段', dataIndex: 'stage', slotName: 'stage', width: 150 },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 120 },
  {
    title: '可见范围',
    dataIndex: 'visibility',
    width: 140,
    render: ({ record }: { record: TeachingLecture }) => lectureVisibilityLabel(record.visibility)
  },
  { title: '发起人', dataIndex: 'organizerName', width: 140 },
  { title: '主讲专家', dataIndex: 'lecturer', width: 160, render: ({ record }: { record: TeachingLecture }) => `${record.lecturer.name} · ${record.lecturer.title || '职称待定'}` },
  { title: '操作', dataIndex: 'actions', slotName: 'actions', width: 140 }
];

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

function formatDateTime(value?: string) {
  if (!value) return '待定';
  const normalized = value.includes('T') ? value : `${value}Z`;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

async function loadLectures() {
  loading.value = true;
  try {
    lectures.value = await fetchTeachingLecturesForViewer(lectureViewer.value);
  } finally {
    loading.value = false;
  }
}

function goDetail(id: string) {
  router.push({ name: 'AdminTeachingDetail', params: { id } });
}

function availableActions(record: TeachingLecture) {
  const actions: Array<{ key: string; label: string; handler: (lecture: TeachingLecture) => void }> = [];
  if (record.stage === 'applied' || record.stage === 'under_review') {
    actions.push({ key: 'approve', label: '审核通过', handler: handleApprove });
    actions.push({ key: 'reject', label: '驳回申请', handler: handleReject });
  }
  if (record.stage === 'approved' || record.stage === 'notice_published') {
    actions.push({ key: 'publish', label: '发布通知', handler: openNoticeModal });
  }
  if (record.stage === 'notice_published') {
    actions.push({ key: 'close', label: '关闭报名', handler: handleCloseEnrollment });
  }
  if (['approved', 'notice_published', 'enrollment_closed'].includes(record.stage)) {
    actions.push({ key: 'markLive', label: '标记直播', handler: handleMarkLive });
  }
  if (['post_verification', 'in_session'].includes(record.stage)) {
    actions.push({ key: 'report', label: '生成报告', handler: openReportModal });
  }
  if (record.stage === 'report_ready' && record.status === 'completed') {
    actions.push({ key: 'archive', label: '归档', handler: handleArchive });
  }
  return actions;
}

async function handleApprove(lecture: TeachingLecture) {
  const reviewerName = currentUser.value?.displayName || '管理员';
  const updated = await reviewTeachingLecture(lecture.id, {
    decision: 'approved',
    reviewerId: currentUser.value?.id ? String(currentUser.value.id) : 'admin',
    reviewerName
  });
  if (updated) {
    Message.success('已通过讲座申请');
    loadLectures();
  }
}

async function handleReject(lecture: TeachingLecture) {
  const reviewerName = currentUser.value?.displayName || '管理员';
  const updated = await reviewTeachingLecture(lecture.id, {
    decision: 'rejected',
    reviewerId: currentUser.value?.id ? String(currentUser.value.id) : 'admin',
    reviewerName,
    comment: '资料不完整'
  });
  if (updated) {
    Message.success('已驳回讲座申请');
    loadLectures();
  }
}

function openNoticeModal(lecture: TeachingLecture) {
  targetLecture.value = lecture;
  noticeForm.summary = `${lecture.title} 将于 ${formatDateTime(lecture.plannedAt)} 开讲，请按要求完成身份验证。`;
  noticeForm.channel = 'platform';
  noticeForm.audience = lecture.targetAudience;
  noticeForm.enrollmentClosesAt = '';
  noticeVisible.value = true;
}

async function submitNotice() {
  if (!targetLecture.value) return;
  if (!noticeForm.summary) {
    Message.warning('请填写通知摘要');
    return;
  }
  modalLoading.value = true;
  try {
    const updated = await publishLectureNotice(targetLecture.value.id, {
      summary: noticeForm.summary,
      channel: noticeForm.channel as 'platform' | 'email' | 'sms' | 'mixed',
      audience: noticeForm.audience as 'medical_staff' | 'patients' | 'mixed',
      enrollmentClosesAt: noticeForm.enrollmentClosesAt ? toIsoString(noticeForm.enrollmentClosesAt) : undefined,
      publishedBy: currentUser.value?.id ? String(currentUser.value.id) : 'admin',
      publishedByName: currentUser.value?.displayName || '管理员'
    });
    if (updated) {
      Message.success('已发布讲座通知');
      noticeVisible.value = false;
      loadLectures();
    }
  } finally {
    modalLoading.value = false;
  }
}

async function handleCloseEnrollment(lecture: TeachingLecture) {
  const updated = await closeLectureEnrollment(lecture.id, {
    closedBy: currentUser.value?.id ? String(currentUser.value.id) : 'admin',
    closedByName: currentUser.value?.displayName || '管理员'
  });
  if (updated) {
    Message.success('已关闭报名');
    loadLectures();
  }
}

async function handleMarkLive(lecture: TeachingLecture) {
  const updated = await markLectureLive(lecture.id, {
    host: currentUser.value?.displayName || '主持人',
    meetingUrl: lecture.session?.meetingUrl,
    accessCode: lecture.session?.accessCode,
    livestreamProvider: lecture.session?.livestreamProvider
  });
  if (updated) {
    Message.success('已进入直播状态');
    loadLectures();
  }
}

function openReportModal(lecture: TeachingLecture) {
  targetLecture.value = lecture;
  reportForm.summary = `${lecture.title} 讲座已结束，请复盘出勤与反馈情况。`;
  reportForm.attendanceRate = 0.8;
  reportForm.satisfactionScore = 4.5;
  reportForm.recommendations = '';
  reportVisible.value = true;
}

async function submitReport() {
  if (!targetLecture.value) return;
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
    const updated = await compileLectureReport(targetLecture.value.id, {
      summary: reportForm.summary,
      attendanceRate: reportForm.attendanceRate,
      satisfactionScore: reportForm.satisfactionScore,
      recommendations,
      generatedBy: currentUser.value?.id ? String(currentUser.value.id) : 'admin',
      generatedByName: currentUser.value?.displayName || '管理员'
    });
    if (updated) {
      Message.success('报告已生成');
      reportVisible.value = false;
      loadLectures();
    }
  } finally {
    modalLoading.value = false;
  }
}

async function handleArchive(lecture: TeachingLecture) {
  const updated = await archiveLecture(lecture.id, currentUser.value?.displayName || '管理员');
  if (updated) {
    Message.success('讲座已归档');
    loadLectures();
  }
}

function toIsoString(value: string) {
  const normalized = value.includes('T') ? value : value.replace(' ', 'T');
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return normalized;
  return date.toISOString();
}

loadLectures();
</script>

<style scoped lang="less">
.admin-lecture-board {
  padding-bottom: 24px;

  .page-header {
    margin-bottom: 16px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 8px 16px rgba(15, 23, 42, 0.06);
  }
}
</style>
