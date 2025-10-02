<template>
  <div class="teaching-lecture-list">
    <a-page-header
      class="page-header"
      title="远程教学讲座"
      subtitle="组织与跟进您发起的远程教学活动"
    >
      <template #extra>
        <a-space>
          <a-button type="outline" @click="loadLectures" :loading="loading">刷新</a-button>
          <a-button type="primary" @click="goCreate">发起讲座</a-button>
        </a-space>
      </template>
    </a-page-header>

    <a-card class="filters-card" :bordered="false">
      <a-space :size="16" wrap>
        <a-select
          v-model="stageFilter"
          placeholder="按阶段筛选"
          allow-clear
          style="width: 180px"
        >
          <a-option v-for="stage in stageOptions" :key="stage.value" :value="stage.value">
            {{ stage.label }}
          </a-option>
        </a-select>
        <a-select
          v-model="statusFilter"
          placeholder="按状态筛选"
          allow-clear
          style="width: 160px"
        >
          <a-option value="pending">待处理</a-option>
          <a-option value="active">进行中</a-option>
          <a-option value="completed">已完成</a-option>
          <a-option value="rejected">已驳回</a-option>
        </a-select>
        <a-select
          v-model="visibilityFilter"
          placeholder="可见范围"
          allow-clear
          style="width: 180px"
        >
          <a-option
            v-for="option in visibilityOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </a-option>
        </a-select>
        <a-input
          v-model="searchKeyword"
          placeholder="搜索讲座标题 / 标签"
          style="width: 220px"
          allow-clear
          @press-enter="loadLectures"
        >
          <template #prefix>
            <icon-search />
          </template>
        </a-input>
      </a-space>
    </a-card>

    <a-card :bordered="false">
      <a-table
        :columns="columns"
        :data="lectures"
        :loading="loading"
        row-key="id"
        :pagination="{
          pageSize: 8,
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
          <span>{{ formatDateTime(record.plannedAt) }}</span>
        </template>
        <template #tags="{ record }">
          <a-space wrap>
            <a-tag v-for="tag in record.tags" :key="tag" type="primary">{{ tag }}</a-tag>
          </a-space>
        </template>
        <template #actions="{ record }">
          <a-space>
            <a-button type="text" @click="goDetail(record.id)">查看详情</a-button>
          </a-space>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import { IconSearch } from '@arco-design/web-vue/es/icon';
import type { TableColumnData } from '@arco-design/web-vue';
import {
  fetchTeachingLecturesByOrganizer,
  fetchTeachingLecturesForViewer,
  type TeachingLecture,
  type LectureStage,
  type LectureStatus,
  type LectureVisibility,
  type LectureViewerContext
} from '@/api/mock/teaching';
import { useCurrentUser } from '@/composables/useCurrentUser';
import {
  lectureStageLabel,
  lectureStageStyle,
  lectureStatusLabel,
  lectureStatusStyle,
  lectureCategoryLabel,
  lectureVisibilityLabel,
  useLectureStageOptions,
  useLectureVisibilityOptions
} from '@/composables/useTeachingLecture';

const router = useRouter();
const { doctorProfile, currentUser } = useCurrentUser();

const loading = ref(false);
const lectures = ref<TeachingLecture[]>([]);
const stageFilter = ref<LectureStage | undefined>();
const statusFilter = ref<LectureStatus | undefined>();
const searchKeyword = ref('');
const visibilityFilter = ref<LectureVisibility | undefined>();

const stageOptions = useLectureStageOptions().value;
const visibilityOptions = useLectureVisibilityOptions().value;

const lectureViewer = computed<LectureViewerContext>(() => ({
  role: 'doctor',
  userId: currentUser.value?.id ?? undefined,
  organization: currentUser.value?.hospitalName ?? null,
  participantId: doctorProfile.value?.organizerId
    ? String(doctorProfile.value.organizerId)
    : undefined
}));

const columns: TableColumnData[] = [
  {
    title: '讲座标题',
    dataIndex: 'title',
    ellipsis: true,
    render: ({ record }: { record: TeachingLecture }) => record.title
  },
  {
    title: '类型',
    dataIndex: 'category',
    width: 130,
    render: ({ record }: { record: TeachingLecture }) => lectureCategoryLabel(record.category)
  },
  {
    title: '计划时间',
    dataIndex: 'plannedAt',
    slotName: 'plannedAt',
    width: 180
  },
  {
    title: '阶段',
    dataIndex: 'stage',
    slotName: 'stage',
    width: 140
  },
  {
    title: '状态',
    dataIndex: 'status',
    slotName: 'status',
    width: 120
  },
  {
    title: '可见范围',
    dataIndex: 'visibility',
    width: 150,
    render: ({ record }: { record: TeachingLecture }) => lectureVisibilityLabel(record.visibility)
  },
  {
    title: '标签',
    dataIndex: 'tags',
    slotName: 'tags',
    width: 200
  },
  {
    title: '参与对象',
    dataIndex: 'targetAudience',
    width: 120,
    render: ({ record }: { record: TeachingLecture }) =>
      record.targetAudience === 'medical_staff'
        ? '医务人员'
        : record.targetAudience === 'patients'
          ? '患者/公众'
          : '医患混合'
  },
  {
    title: '操作',
    dataIndex: 'operations',
    slotName: 'actions',
    width: 120
  }
];

function stageLabel(stage: LectureStage) {
  return lectureStageLabel(stage);
}

function stageStyle(stage: LectureStage) {
  return lectureStageStyle(stage);
}

function statusLabel(status: LectureStatus) {
  return lectureStatusLabel(status);
}

function statusStyle(status: LectureStatus) {
  return lectureStatusStyle(status);
}

function formatDateTime(value?: string | null) {
  if (!value) return '待定';
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  } catch {
    return value;
  }
}

async function loadLectures() {
  const organizerId =
    doctorProfile.value?.organizerId ??
    currentUser.value?.organizerId ??
    doctorProfile.value?.expertId ??
    (doctorProfile.value?.id != null ? String(doctorProfile.value.id) : undefined) ??
    (currentUser.value?.expertId ? String(currentUser.value.expertId) : undefined);
  loading.value = true;
  try {
    const mergedMap = new Map<string, TeachingLecture>();

    if (organizerId) {
      const organizerList = await fetchTeachingLecturesByOrganizer(String(organizerId));
      organizerList.forEach((item) => mergedMap.set(item.id, item));
    }

    const viewerList = await fetchTeachingLecturesForViewer(lectureViewer.value);
    viewerList.forEach((item) => mergedMap.set(item.id, item));

    const list = Array.from(mergedMap.values());

    // 3. 在本地做过滤
    lectures.value = list.filter((item) => {
      if (stageFilter.value && item.stage !== stageFilter.value) return false;
      if (statusFilter.value && item.status !== statusFilter.value) return false;
      if (visibilityFilter.value && item.visibility !== visibilityFilter.value) return false;
      if (searchKeyword.value) {
        const target = `${item.title} ${item.summary} ${item.tags.join(' ')}`.toLowerCase();
        if (!target.includes(searchKeyword.value.toLowerCase())) return false;
      }
      return true;
    });

    // 4. 如果连 organizerId 都没有，还要给个提示
    if (!organizerId && !list.length) {
      Message.warning('未识别到讲座申请人身份，已展示可访问的讲座列表');
    }
  } catch (error) {
    console.error('[LectureList] 加载讲座失败:', error);
    Message.error('加载讲座失败，请稍后重试');
  } finally {
    loading.value = false;
  }
}

function goCreate() {
  router.push({ name: 'DoctorTeachingCreate' });
}

function goDetail(id: string) {
  router.push({ name: 'DoctorTeachingDetail', params: { id } });
}

watch([stageFilter, statusFilter, visibilityFilter], loadLectures);

onMounted(() => {
  loadLectures();
});
</script>

<style scoped lang="less">
.teaching-lecture-list {
  padding-bottom: 24px;

  .page-header {
    margin-bottom: 16px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 8px 16px rgba(15, 23, 42, 0.05);
    padding: 16px 24px;
  }

  .filters-card {
    margin-bottom: 16px;
    background: #f8fafc;
    border-radius: 10px;
  }
}
</style>
