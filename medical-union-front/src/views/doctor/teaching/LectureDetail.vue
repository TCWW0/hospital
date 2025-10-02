<template>
  <div class="lecture-detail-page" :style="rootVars">
    <a-page-header
      class="page-header"
      :title="lecture ? lecture.title : '讲座详情'"
      :subtitle="lecture ? formatDateTime(lecture.createdAt) : ''"
      @back="goBack"
    >
      <template #extra>
        <a-space>
          <a-button type="outline" @click="loadLecture" :loading="loading">刷新</a-button>
          <a-button type="outline" status="success" @click="handleMarkLive" :disabled="!canMarkLive" :loading="actionLoading">
            标记直播开始
          </a-button>
        </a-space>
      </template>
    </a-page-header>

    <div class="detail-body">
      <a-spin :loading="loading">
        <template #element>
          <div v-if="lecture" class="detail-layout scrollable">
            <a-card class="summary-card" :bordered="false">
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
                <div class="summary-meta">
                  <span>发起人：{{ lecture.organizerName }}（{{ lecture.organizerHospital }}）</span>
                  <span>主讲专家：{{ lecture.lecturer.name }} · {{ lecture.lecturer.title || '职称待定' }}</span>
                  <span>目标人群：{{ audienceLabel(lecture.targetAudience) }}</span>
                  <span>计划时间：{{ formatDateTime(lecture.plannedAt) }}</span>
                </div>
                <div class="summary-desc">{{ lecture.summary }}</div>
                <div v-if="lecture.objectives?.length" class="summary-objectives">
                  <strong>教学目标：</strong>
                  <ul>
                    <li v-for="goal in lecture.objectives" :key="goal">{{ goal }}</li>
                  </ul>
                </div>
              </div>

              <a-divider orientation="left">进度概览</a-divider>
              <a-descriptions :column="2" size="large">
                <a-descriptions-item label="讲座类型">{{ categoryLabel(lecture.category) }}</a-descriptions-item>
                <a-descriptions-item label="可见范围">{{ lectureVisibilityLabel(lecture.visibility) }}</a-descriptions-item>
                <a-descriptions-item label="资料数量">{{ lecture.materials.length }} 个</a-descriptions-item>
                <a-descriptions-item label="报名/参与人数">{{ lecture.participants.length }} 人</a-descriptions-item>
              </a-descriptions>

              <div class="tag-list" v-if="lecture.tags.length">
                <span class="tag-label">标签：</span>
                <a-tag v-for="tag in lecture.tags" :key="tag" class="tag-item" type="primary">{{ tag }}</a-tag>
              </div>
            </a-card>

            <div class="grid-columns">
              <a-card class="column-card" title="直播与接入" :bordered="false">
                <div v-if="lecture.session" class="session-info">
                  <p><strong>直播开始：</strong>{{ formatDateTime(lecture.session.scheduledAt) }}</p>
                  <p><strong>直播时长：</strong>{{ lecture.session.durationMinutes || 60 }} 分钟</p>
                  <p v-if="lecture.session.meetingUrl"><strong>接入链接：</strong>{{ lecture.session.meetingUrl }}</p>
                  <p v-if="lecture.session.accessCode"><strong>访问码：</strong>{{ lecture.session.accessCode }}</p>
                  <p v-if="lecture.session.host"><strong>主持人：</strong>{{ lecture.session.host }}</p>
                  <p v-if="lecture.session.techSupportContact"><strong>技术支持：</strong>{{ lecture.session.techSupportContact }}</p>
                </div>
                <div v-else class="muted">尚未配置直播信息，审核通过后可与管理员协作完善。</div>
              </a-card>

              <a-card class="column-card" title="开课通知" :bordered="false">
                <div v-if="lecture.notice">
                  <p><strong>发布渠道：</strong>{{ lecture.notice.channel === 'platform' ? '平台通知' : lecture.notice.channel === 'email' ? '邮件' : lecture.notice.channel === 'sms' ? '短信' : '多渠道' }}</p>
                  <p><strong>发布时间：</strong>{{ formatDateTime(lecture.notice.publishedAt) }}</p>
                  <p><strong>面向对象：</strong>{{ audienceLabel(lecture.notice.audience) }}</p>
                  <p v-if="lecture.notice.enrollmentClosesAt"><strong>报名截止：</strong>{{ formatDateTime(lecture.notice.enrollmentClosesAt) }}</p>
                  <p class="muted">{{ lecture.notice.summary }}</p>
                </div>
                <div v-else class="muted">管理员审核通过后会发布通知。</div>
              </a-card>
            </div>

            <a-card class="column-card" title="身份验证记录" :bordered="false">
              <a-empty v-if="!lecture.verificationRecords.length" description="尚无验证记录" />
              <a-timeline v-else>
                <a-timeline-item v-for="record in lecture.verificationRecords" :key="record.id" :label="formatDateTime(record.createdAt)">
                  <div class="timeline-entry">
                    <strong>{{ verificationPhaseLabel(record.phase) }}</strong>
                    <div class="muted">
                      {{ record.note || '无备注' }}
                      <span> · {{ verificationOutcomeLabel(record.status) }}</span>
                    </div>
                  </div>
                </a-timeline-item>
              </a-timeline>
            </a-card>

            <a-card class="column-card" title="参与人员" :bordered="false">
              <a-table
                :data="lecture.participants"
                :pagination="false"
                size="small"
                :columns="participantColumns"
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
                  <a-tag :color="statusColor(record.verificationStatus)">
                    {{ verificationOutcomeLabel(record.verificationStatus) }}
                  </a-tag>
                </template>
              </a-table>
            </a-card>

            <a-card class="column-card" title="资料与课件" :bordered="false">
              <div class="material-upload">
                <a-space>
                  <a-input v-model="materialForm.name" placeholder="资料名称" style="width: 200px" />
                  <a-select v-model="materialForm.type" style="width: 150px">
                    <a-option value="slides">课件</a-option>
                    <a-option value="video">视频</a-option>
                    <a-option value="document">文档</a-option>
                    <a-option value="other">其他</a-option>
                  </a-select>
                  <a-input v-model="materialForm.url" placeholder="访问链接 (可选)" style="width: 260px" />
                  <a-select v-model="materialForm.audience" style="width: 160px">
                    <a-option value="medical_staff">医务人员</a-option>
                    <a-option value="patients">患者/公众</a-option>
                    <a-option value="mixed">医患混合</a-option>
                  </a-select>
                  <a-button type="primary" @click="handleUploadMaterial" :loading="actionLoading">上传</a-button>
                </a-space>
              </div>
              <a-table
                class="material-table"
                :data="lecture.materials"
                :pagination="false"
                size="small"
                :columns="materialColumns"
              >
                <template #audience="{ record }">
                  {{ audienceLabel(record.audience) }}
                </template>
                <template #uploadedAt="{ record }">
                  {{ formatDateTime(record.uploadedAt) }}
                </template>
              </a-table>
            </a-card>

            <a-card class="column-card" title="讲座报告" :bordered="false">
              <div v-if="lecture.report">
                <p><strong>生成时间：</strong>{{ formatDateTime(lecture.report.generatedAt) }}</p>
                <p><strong>摘要：</strong>{{ lecture.report.summary }}</p>
                <p><strong>出勤率：</strong>{{ Math.round((lecture.report.attendanceRate || 0) * 100) }}%</p>
                <p v-if="lecture.report.satisfactionScore"><strong>满意度：</strong>{{ lecture.report.satisfactionScore }}</p>
                <div v-if="lecture.report.recommendations?.length">
                  <strong>改进建议：</strong>
                  <ul>
                    <li v-for="rec in lecture.report.recommendations" :key="rec">{{ rec }}</li>
                  </ul>
                </div>
              </div>
              <a-empty v-else description="讲座结束后由管理员生成报告" />
            </a-card>

            <a-card class="column-card" title="处理轨迹" :bordered="false">
              <a-empty v-if="!lecture.history.length" description="暂无历史记录" />
              <a-timeline v-else mode="left">
                <a-timeline-item v-for="item in lecture.history" :key="item.id" :label="formatDateTime(item.at)">
                  <div class="timeline-entry">
                    <strong>{{ item.actor }}</strong>
                    <div class="muted">{{ item.action }}</div>
                  </div>
                </a-timeline-item>
              </a-timeline>
            </a-card>
          </div>
          <a-empty v-else description="未找到讲座记录" />
        </template>
      </a-spin>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import type { TableColumnData } from '@arco-design/web-vue';
import {
  fetchTeachingLectureDetail,
  markLectureLive,
  uploadLectureMaterial,
  type TeachingLecture,
  type UploadLectureMaterialPayload
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

const loading = ref(false);
const actionLoading = ref(false);
const lecture = ref<TeachingLecture | null>(null);
const viewportHeight = ref(typeof window !== 'undefined' ? window.innerHeight : 900);

const materialForm = reactive<UploadLectureMaterialPayload>({
  name: '',
  type: 'document',
  url: '',
  audience: 'medical_staff',
  uploader: currentUser.value?.id ? String(currentUser.value.id) : 'doctor',
  uploaderName: currentUser.value?.displayName || '医生'
});

const participantColumns: TableColumnData[] = [
  { title: '姓名', dataIndex: 'name', width: 140 },
  { title: '角色', dataIndex: 'role', width: 120 },
  { title: '所属机构', dataIndex: 'organization' },
  { title: '验证阶段', dataIndex: 'verifiedPhases', slotName: 'verifiedPhases', width: 220 },
  { title: '验证状态', dataIndex: 'verificationStatus', slotName: 'verificationStatus', width: 120 }
];

const materialColumns: TableColumnData[] = [
  { title: '资料名称', dataIndex: 'name' },
  { title: '类型', dataIndex: 'type', width: 120 },
  { title: '受众', dataIndex: 'audience', slotName: 'audience', width: 120 },
  { title: '上传时间', dataIndex: 'uploadedAt', slotName: 'uploadedAt', width: 200 }
];

const cardScrollOffset = 220;
const minScrollHeight = 360;

const cardScrollHeight = computed(() => Math.max(minScrollHeight, viewportHeight.value - cardScrollOffset));
const rootVars = computed(() => ({ '--teaching-scroll-height': `${cardScrollHeight.value}px` }));

const canMarkLive = computed(() => {
  if (!lecture.value) return false;
  return ['notice_published', 'approved', 'enrollment_closed'].includes(lecture.value.stage);
});

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

function statusColor(outcome: TeachingLecture['participants'][number]['verificationStatus']) {
  if (outcome === 'passed') return 'arcoblue';
  if (outcome === 'failed') return 'red';
  return 'orange';
}

async function loadLecture() {
  const id = route.params.id as string | undefined;
  if (!id) return;
  loading.value = true;
  try {
    lecture.value = await fetchTeachingLectureDetail(id);
  } finally {
    loading.value = false;
  }
}

async function handleMarkLive() {
  if (!lecture.value) return;
  actionLoading.value = true;
  try {
    const host = currentUser.value?.displayName || '主持人';
    const updated = await markLectureLive(lecture.value.id, {
      host,
      meetingUrl: lecture.value.session?.meetingUrl,
      accessCode: lecture.value.session?.accessCode,
      livestreamProvider: lecture.value.session?.livestreamProvider
    });
    if (updated) {
      lecture.value = updated;
      Message.success('讲座已进入直播状态');
    }
  } finally {
    actionLoading.value = false;
  }
}

async function handleUploadMaterial() {
  if (!lecture.value) return;
  if (!materialForm.name) {
    Message.warning('请填写资料名称');
    return;
  }
  actionLoading.value = true;
  try {
    const payload: UploadLectureMaterialPayload = {
      ...materialForm,
      url: materialForm.url || undefined
    };
    const updated = await uploadLectureMaterial(lecture.value.id, payload);
    if (updated) {
      lecture.value = updated;
      Message.success('资料已上传');
      materialForm.name = '';
      materialForm.url = '';
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
.lecture-detail-page {
  padding-bottom: 32px;
  height: 100vh;
  display: flex;
  flex-direction: column;

  .page-header {
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
  }

  .detail-layout {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .detail-layout.scrollable {
    width: 100%;
    flex: 1;
    overflow-y: auto;
    max-height: var(--teaching-scroll-height); 
    padding-right: 8px; 

    > *{
        width: 100%;
    }
  }

    .detail-layout.scrollable::-webkit-scrollbar {
    width: 6px;
    }
    .detail-layout.scrollable::-webkit-scrollbar-thumb {
    background-color: rgba(0,0,0,0.2);
    border-radius: 3px;
    }

  .summary-card {
    border-radius: 12px;
  }

  .summary-head {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .summary-title {
    display: flex;
    align-items: center;
    gap: 12px;

    h2 {
      margin: 0;
      font-size: 22px;
      color: #0f172a;
    }
  }

  .summary-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    color: #475569;
  }

  .summary-objectives ul {
    margin: 0;
    padding-left: 20px;
    color: #1f2937;
  }

  .tag-list {
    margin-top: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;

    .tag-label {
      color: #475569;
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

  .material-upload {
    margin-bottom: 16px;
  }
}
</style>
