<template>
  <div class="education-lecture-detail">
    <a-page-header
      class="page-header"
      :title="lecture ? lecture.title : '讲座详情'"
      :subtitle="lecture ? formatDateTime(lecture.createdAt) : ''"
      @back="goBack"
    >
      <template #extra>
        <a-space>
          <a-button type="outline" @click="loadLecture" :loading="loading">刷新</a-button>
          <a-button type="primary" @click="handleRegister" :disabled="!canRegister">报名并提醒</a-button>
        </a-space>
      </template>
    </a-page-header>

    <div class="detail-body">
      <a-spin :loading="loading">
        <template #element>
          <div v-if="lecture" class="detail-layout scrollable">
            <a-card :bordered="false" class="summary-card">
              <div class="summary-head">
                <div class="summary-title">
                  <h2>{{ lecture.title }}</h2>
                  <a-tag :color="lecture.stage === 'archived' ? 'lime' : 'arcoblue'">
                    {{ lecture.stage === 'archived' ? '可回看' : '报名开放' }}
                  </a-tag>
                </div>
                <div class="summary-meta">
                  <div class="meta-item">
                    <span class="meta-label">主讲专家</span>
                    <span class="meta-value">{{ lecture.lecturer.name }} · {{ lecture.lecturer.title || '职称待定' }}</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">目标人群</span>
                    <span class="meta-value">{{ audienceLabel(lecture.targetAudience) }}</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">计划时间</span>
                    <span class="meta-value">{{ formatDateTime(lecture.plannedAt) }}</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">可见范围</span>
                    <span class="meta-value">{{ visibilityLabel(lecture.visibility) }}</span>
                  </div>
                </div>
                <div class="summary-desc">{{ lecture.summary }}</div>
                <div v-if="lecture.objectives?.length" class="summary-objectives">
                  <strong>讲座亮点：</strong>
                  <ul>
                    <li v-for="goal in lecture.objectives" :key="goal">{{ goal }}</li>
                  </ul>
                </div>
              </div>
              <a-divider orientation="left">基本信息</a-divider>
              <div class="basic-info-panel">
                <a-descriptions :column="2" size="large">
                  <a-descriptions-item label="讲座类型">{{ categoryLabel(lecture.category) }}</a-descriptions-item>
                  <a-descriptions-item label="预计时长">{{ lecture.durationMinutes || 60 }} 分钟</a-descriptions-item>
                </a-descriptions>
                <div v-if="lecture.tags?.length" class="tag-list">
                  <span class="tag-label">标签：</span>
                  <a-tag v-for="tag in lecture.tags || []" :key="tag" class="tag-item" type="primary">{{ tag }}</a-tag>
                </div>
              </div>
            </a-card>

            <a-divider orientation="left">报名与资料</a-divider>
            <div class="grid-columns">
              <a-card class="column-card" title="开课提醒" :bordered="false">
                <p v-if="lecture.notice" class="muted">{{ lecture.notice.summary }}</p>
                <p v-else class="muted">主办方审核完成后将发布详细提醒信息。</p>
                <div v-if="lecture.session" class="session-info">
                  <p><strong>直播时间：</strong>{{ formatDateTime(lecture.session.scheduledAt) }}</p>
                  <p v-if="lecture.session.meetingUrl"><strong>观看链接：</strong>{{ lecture.session.meetingUrl }}</p>
                  <p class="muted">开课前系统会再次提醒您。</p>
                </div>
              </a-card>

              <a-card class="column-card" title="资料下载" :bordered="false">
                <a-empty v-if="!lecture.materials?.length" description="讲座资料将在活动前后陆续发布" />
                <a-list v-else :data="lecture.materials || []" size="small">
                  <template #renderItem="{ item }">
                    <a-list-item>
                      <div>
                        <strong>{{ item.name }}</strong>
                        <div class="muted">{{ audienceLabel(item.audience) }} · {{ formatDateTime(item.uploadedAt) }}</div>
                      </div>
                    </a-list-item>
                  </template>
                </a-list>
              </a-card>
            </div>
          </div>
          <a-empty v-else description="未找到讲座信息" />
        </template>
      </a-spin>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import {
  fetchTeachingLectureDetail,
  type TeachingLecture,
  type LectureViewerContext
} from '@/api/mock/teaching';
import {
  lectureAudienceLabel,
  lectureVisibilityLabel,
  lectureCategoryLabel
} from '@/composables/useTeachingLecture';
import { useCurrentUser } from '@/composables/useCurrentUser';

const route = useRoute();
const router = useRouter();
const { currentUser, isPatient } = useCurrentUser();

const loading = ref(false);
const lecture = ref<TeachingLecture | null>(null);

const canRegister = computed(() => lecture.value && lecture.value.stage !== 'archived');

const lectureViewer = computed<LectureViewerContext>(() => {
  if (isPatient.value) {
    return {
      role: 'patient',
      userId: currentUser.value?.id ?? undefined,
      organization: currentUser.value?.hospitalName ?? null
    };
  }
  return { role: 'guest' };
});

function audienceLabel(audience: TeachingLecture['targetAudience']) {
  return lectureAudienceLabel(audience);
}

function categoryLabel(category: TeachingLecture['category']) {
  return lectureCategoryLabel(category);
}

function visibilityLabel(visibility: TeachingLecture['visibility']) {
  return lectureVisibilityLabel(visibility);
}

function formatDateTime(value?: string) {
  if (!value) return '待定';
  const normalized = value.includes('T') ? value : `${value}Z`;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

async function loadLecture() {
  const id = route.params.id as string | undefined;
  if (!id) return;
  loading.value = true;
  try {
    const detail = await fetchTeachingLectureDetail(id, { viewer: lectureViewer.value });
    if (!detail) {
      lecture.value = null;
      Message.warning('当前账号无权查看该讲座或讲座已撤回');
      return;
    }
    lecture.value = detail;
  } finally {
    loading.value = false;
  }
}

function handleRegister() {
  Message.success('已记录报名意向，开课前会通过站内信提醒您。');
}

function goBack() {
  router.back();
}

loadLecture();
</script>

<style scoped lang="less">
.education-lecture-detail {
  padding-bottom: 24px;
  --card-radius: 20px;
  --card-shadow: 0 20px 44px -30px rgba(59, 130, 246, 0.18), 0 16px 32px -28px rgba(59, 130, 246, 0.16);
  --card-gradient: linear-gradient(135deg, rgba(247, 251, 255, 0.9), rgba(255, 255, 255, 0.88));
  --card-border: 1px solid rgba(148, 185, 255, 0.22);

  .page-header {
    background: #fff;
    border-radius: 12px;
    margin-bottom: 16px;
    box-shadow: 0 8px 16px rgba(15, 23, 42, 0.06);
  }

  .detail-body {
    display: flex;
    flex-direction: column;
    background: transparent;
    flex: 1;
    min-height: 0;
  }

  :deep(.arco-card) {
    border: none;
    border-radius: var(--card-radius);
    box-shadow: var(--card-shadow);
    overflow: hidden;
    background: var(--card-gradient);
  }

  :deep(.arco-card-header) {
    padding: 18px 22px 12px;
    background: linear-gradient(135deg, rgba(238, 246, 255, 0.72), rgba(255, 255, 255, 0));
    border-bottom: none;
  }

  :deep(.arco-card-title) {
    font-size: 18px;
    font-weight: 700;
    color: #1f3c88;
  }

  :deep(.arco-card-body) {
    padding: 24px 26px;
  }

  .detail-layout {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .detail-layout.scrollable {
    max-height: calc(100vh - 220px);
    overflow-y: auto;
    padding-right: 8px;
  }

  .summary-card {
    border-radius: 12px;
    position: relative;
    box-shadow: var(--card-shadow);
    background: linear-gradient(135deg, rgba(248, 252, 255, 0.92), rgba(255, 255, 255, 0.9));

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: linear-gradient(135deg, rgba(191, 219, 254, 0.18), rgba(219, 234, 254, 0));
      pointer-events: none;
    }

    :deep(.arco-card-body) {
      position: relative;
      z-index: 1;
    }
  }

  .summary-title {
    display: flex;
    align-items: center;
    gap: 12px;

    h2 {
      margin: 0;
      font-size: 20px;
    }
  }

  .muted {
    color: #64748b;
  }

  .goal-list {
    margin: 0;
    padding-left: 20px;
    color: #1f2937;
  }

  .section-card {
    border-radius: 12px;
  }
  .summary-head {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .summary-meta {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 8px;
    color: #1d4b8f;
    font-size: 13px;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 10px;
    border-radius: 8px;
    background: rgba(59, 130, 246, 0.05);
    border: 1px solid rgba(59, 130, 246, 0.14);
  }

  .meta-label {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 2px 8px;
    border-radius: 999px;
    background: rgba(59, 130, 246, 0.12);
    color: #1d4ed8;
    font-weight: 600;
  }

  .meta-value {
    color: #1f2937;
    font-weight: 500;
  }

  .summary-desc {
    color: #475569;
    line-height: 1.6;
  }

  .summary-objectives {
    color: #1f2937;

    ul {
      margin: 6px 0 0;
      padding-left: 20px;
    }
  }

  .tag-list {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;

    .tag-item {
      border-radius: 999px;
      background: linear-gradient(120deg, rgba(59, 130, 246, 0.12), rgba(191, 219, 254, 0.24));
      border: 1px solid rgba(148, 185, 255, 0.24);
      color: #12408c;
    }
  }

  .tag-label {
    color: #64748b;
  }

  .grid-columns {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 16px;
  }

  .column-card {
    border-radius: 12px;
    border: none;
    background: var(--card-gradient);
    box-shadow: var(--card-shadow);
  }

  .session-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    color: #475569;

    p {
      margin: 0;
      padding: 6px 8px;
      border-radius: 6px;
      background: rgba(148, 185, 255, 0.08);
      border: 1px solid rgba(148, 185, 255, 0.12);
    }

    p strong {
      color: #154a9c;
    }
  }

  .basic-info-panel {
    margin-top: 12px;
    padding: 18px;
    border-radius: 16px;
    background: rgba(59, 130, 246, 0.06);
    border: 1px solid rgba(148, 185, 255, 0.16);
    backdrop-filter: blur(4px);

    :deep(.arco-descriptions-item-label) {
      color: #1d4ed8;
      font-weight: 600;
    }

    :deep(.arco-descriptions-item-content) {
      color: #1f2937;
    }
  }

  :deep(.arco-divider-text) {
    font-weight: 700;
    color: #1f3c88;
  }
}
</style>
