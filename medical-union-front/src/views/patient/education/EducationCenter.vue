<template>
  <div class="education-center">
    <a-page-header
      class="page-header"
      title="健康教育中心"
      subtitle="获取专家健康讲座与远程教学内容"
    >
      <template #extra>
        <a-button type="outline" @click="loadLectures" :loading="loading">刷新</a-button>
      </template>
    </a-page-header>

    <a-card :bordered="false" class="filters-card">
      <a-space wrap>
        <a-select v-model="categoryFilter" placeholder="讲座类型" allow-clear style="width: 180px">
          <a-option value="knowledge_share">知识共享</a-option>
          <a-option value="lecture_training">健康讲座</a-option>
          <a-option value="surgery_live">手术直播/点播</a-option>
        </a-select>
        <a-input v-model="searchKeyword" placeholder="搜索讲座" allow-clear style="width: 220px" @press-enter="loadLectures">
          <template #prefix>
            <icon-search />
          </template>
        </a-input>
      </a-space>
    </a-card>

    <a-card :bordered="false" class="table-card">
      <a-table
        :columns="columns"
        :data="visibleLectures"
        :loading="loading"
        row-key="id"
        :pagination="{ pageSize: 6, showTotal: true }"
      >
        <template #lecture="{ record }">
          <div class="lecture-info">
            <div class="lecture-title">
              <a-tag v-if="record.tags.length" type="outline">{{ record.tags[0] }}</a-tag>
              <span class="title-text">{{ record.title }}</span>
            </div>
            <div class="lecture-summary">{{ record.summary }}</div>
          </div>
        </template>
        <template #category="{ record }">
          {{ categoryLabel(record.category) }}
        </template>
        <template #plannedAt="{ record }">
          <span class="time-cell"><icon-calendar /> {{ formatDate(record.plannedAt) }}</span>
        </template>
        <template #stage="{ record }">
          <a-tag
            :color="stageStyle(record.stage).color"
            :style="{ backgroundColor: stageStyle(record.stage).bg, border: 'none' }"
          >
            {{ stageLabel(record.stage) }}
          </a-tag>
        </template>
        <template #lecturer="{ record }">
          <span class="lecturer-cell"><icon-customer-service /> {{ record.lecturer.name }}</span>
        </template>
        <template #audience="{ record }">
          {{ audienceLabel(record.targetAudience) }}
        </template>
        <template #actions="{ record }">
          <a-button type="text" @click="goDetail(record.id)">查看详情</a-button>
        </template>
      </a-table>
    </a-card>

  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch, onActivated } from 'vue';
import { useRouter } from 'vue-router';
import { IconCalendar, IconCustomerService, IconSearch } from '@arco-design/web-vue/es/icon';
import type { TableColumnData } from '@arco-design/web-vue';
import {
  fetchTeachingLecturesForViewer,
  type TeachingLecture,
  type LectureViewerContext,
  type LectureCategory,
  type LectureStage
} from '@/api/mock/teaching';
import {
  lectureAudienceLabel,
  lectureCategoryLabel,
  lectureStageLabel,
  lectureStageStyle
} from '@/composables/useTeachingLecture';
import { useCurrentUser } from '@/composables/useCurrentUser';

const router = useRouter();
const { currentUser, isPatient } = useCurrentUser();

const loading = ref(false);
const rawLectures = ref<TeachingLecture[]>([]);
const categoryFilter = ref<string | undefined>();
const searchKeyword = ref('');

const hiddenStages = new Set<
  TeachingLecture['stage']
>(['applied', 'under_review', 'rejected']);

const columns: TableColumnData[] = [
  {
    title: '讲座信息',
    dataIndex: 'title',
    slotName: 'lecture',
    ellipsis: true
  },
  {
    title: '类型',
    dataIndex: 'category',
    slotName: 'category',
    width: 140
  },
  {
    title: '开课时间',
    dataIndex: 'plannedAt',
    slotName: 'plannedAt',
    width: 180
  },
  {
    title: '阶段',
    dataIndex: 'stage',
    slotName: 'stage',
    width: 120
  },
  {
    title: '讲师',
    dataIndex: 'lecturer',
    slotName: 'lecturer',
    width: 140
  },
  {
    title: '目标人群',
    dataIndex: 'targetAudience',
    slotName: 'audience',
    width: 140
  },
  {
    title: '操作',
    dataIndex: 'actions',
    slotName: 'actions',
    width: 120
  }
];

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

function categoryLabel(category: LectureCategory) {
  return lectureCategoryLabel(category);
}

function stageLabel(stage: LectureStage) {
  return lectureStageLabel(stage);
}

function stageStyle(stage: LectureStage) {
  return lectureStageStyle(stage);
}

function formatDate(value?: string) {
  if (!value) return '待定';
  const normalized = value.includes('T') ? value : `${value}Z`;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

const visibleLectures = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase();
  return rawLectures.value
    .filter((item) => item.visibility === 'public')
    .filter((item) => !hiddenStages.has(item.stage))
    .filter((item) => !categoryFilter.value || item.category === categoryFilter.value)
    .filter((item) => {
      if (!keyword) return true;
      const target = `${item.title} ${item.summary}`.toLowerCase();
      return target.includes(keyword);
    })
    .sort((a, b) => {
      const timeA = a.plannedAt ? new Date(a.plannedAt).getTime() : 0;
      const timeB = b.plannedAt ? new Date(b.plannedAt).getTime() : 0;
      return timeB - timeA;
    });
});

async function loadLectures() {
  loading.value = true;
  try {
    const list = await fetchTeachingLecturesForViewer(lectureViewer.value);
    rawLectures.value = list;
  } finally {
    loading.value = false;
  }
}

function goDetail(id: string) {
  router.push({ name: 'PatientEducationLectureDetail', params: { id } });
}

watch(
  lectureViewer,
  () => {
    loadLectures();
  },
  { immediate: true }
);

onActivated(() => {
  if (!rawLectures.value.length) {
    loadLectures();
  }
});
</script>

<style scoped lang="less">
.education-center {
  padding-bottom: 24px;

  .page-header {
    margin-bottom: 16px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 8px 16px rgba(15, 23, 42, 0.06);
  }

  .filters-card {
    margin-bottom: 16px;
    border-radius: 10px;
    background: #f8fafc;
  }

  .table-card {
    border-radius: 12px;
    overflow: hidden;
  }

  .lecture-info {
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-width: 420px;
  }

  .lecture-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    color: #0f172a;
  }

  .title-text {
    display: inline-flex;
    align-items: center;
    line-height: 1.4;
  }

  .lecture-summary {
    color: #64748b;
    font-size: 13px;
    line-height: 1.5;
  }

  .time-cell,
  .lecturer-cell {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: #475569;
  }
}
</style>
