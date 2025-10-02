<template>
  <div class="telemedicine-board">
    <div class="board-head">
      <div class="head-title">
        <h2>远程医疗调度中心</h2>
        <p class="muted">集中审核各类远程诊疗需求，统筹专家排期与全流程闭环（演示数据）。</p>
      </div>
      <div class="head-actions">
        <a-radio-group
          v-model:value="statusFilterSegment"
          type="button"
          size="large"
          class="tab-switch"
        >
          <a-radio
            v-for="option in statusOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </a-radio>
        </a-radio-group>
        <a-input-search
          v-model:value="searchKeyword"
          allow-clear
          placeholder="搜索患者、专家或备注"
          class="cases-search"
        />
        <a-button type="outline" :loading="loading" @click="loadApps">刷新</a-button>
      </div>
    </div>

    <a-alert type="info" show-icon class="board-tip">
      服务类型与协同标签均由医生端录入；专家提交报告后，可在此记录服务评价并关闭流程。
    </a-alert>

    <a-spin :loading="loading">
      <template #element>
        <div class="board-body">
          <template v-if="paginatedApps.length">
            <div class="cases">
              <a-card v-for="item in paginatedApps" :key="item.id" class="app-card" @click="gotoDetail(item.id)">
                <div class="card-top">
                  <div class="card-info">
                    <div class="patient">{{ item.patientName }}</div>
                    <div class="muted">{{ formatDateTime(item.createdAt) }} · {{ methodLabel(item.preferredMethod) }}</div>
                  </div>
                  <div class="status-tags">
                    <a-tag class="type-tag" color="arcoblue">{{ serviceTypeLabel(item.serviceType) }}</a-tag>
                    <a-tag class="stage-tag" :color="stageStyle(item.serviceStage).color" :style="{ backgroundColor: stageStyle(item.serviceStage).bg, border:'none' }">
                      {{ stageLabel(item.serviceStage) }}
                    </a-tag>
                    <a-tag :color="statusStyle(item.status).color" :style="{ backgroundColor: statusStyle(item.status).bg, border:'none' }">
                      {{ statusLabel(item.status) }}
                    </a-tag>
                  </div>
                </div>
                <div class="card-desc">{{ item.description }}</div>
                <div v-if="stageHints[item.id]" class="card-followup" :class="`follow-${stageHints[item.id]?.type}`">
                  <div class="followup-icon"><IconBulb /></div>
                  <div class="followup-text">
                    <div class="followup-title">{{ stageHints[item.id]?.title }}</div>
                    <div class="followup-desc">{{ stageHints[item.id]?.desc }}</div>
                  </div>
                </div>
                <div class="card-meta">
                  <span v-if="item.createdByDoctorName"><IconUser /> 发起：{{ item.createdByDoctorName }}</span>
                  <span><IconUser /> 专家：{{ item.assignedExpertName || '待指派' }}</span>
                  <span v-if="item.schedule"><IconClockCircle /> {{ formatDateTime(item.schedule.scheduledAt) }}</span>
                </div>
                <div v-if="item.supportTags?.length" class="support-tags">
                  <a-tag v-for="tag in item.supportTags" :key="tag" class="support-tag">{{ supportTagLabel(tag) }}</a-tag>
                </div>
                <div class="card-actions">
                  <a-button type="text" @click.stop="gotoDetail(item.id)">查看详情</a-button>
                </div>
              </a-card>
            </div>
            <div v-if="totalApps > PAGE_SIZE" class="cases-pagination">
              <a-pagination
                v-model:current="page"
                :total="totalApps"
                :page-size="PAGE_SIZE"
                :show-total="false"
                :hide-on-single-page="true"
                size="small"
              />
            </div>
          </template>
          <a-empty v-else description="暂无符合条件的申请" />
        </div>
      </template>
    </a-spin>

  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { IconBulb, IconClockCircle, IconUser } from '@arco-design/web-vue/es/icon';
import {
  fetchTelemedicineCases,
  type TelemedicineApp,
  type TelemedicineServiceStage,
  type TelemedicineStatus
} from '@/api/mock/telemedicine';
import {
  formatDateTime,
  methodLabel,
  serviceTypeLabel,
  stageLabel,
  stageStyle,
  statusLabel,
  statusStyle,
  supportTagLabel
} from '@/composables/useTelemedicineDetail';
import { useTelemedicineSync } from '@/composables/useTelemedicineSync';

void IconBulb;
void IconClockCircle;
void IconUser;

const router = useRouter();

const loading = ref(false);
const apps = ref<TelemedicineApp[]>([]);
const statusFilterSegment = ref<'all' | TelemedicineStatus>('all');
const searchKeyword = ref('');

const statusOptions = [
  { label: '全部状态', value: 'all' },
  { label: '待审核', value: 'pending' },
  { label: '排期中', value: 'scheduled' },
  { label: '已完成', value: 'completed' },
  { label: '已拒绝', value: 'rejected' }
] as const;

const PAGE_SIZE = 2;
const page = ref(1);

type StageHint = {
  type: 'warning' | 'info' | 'success';
  title: string;
  desc: string;
};

async function loadApps() {
  loading.value = true;
  try {
    const filters = statusFilterSegment.value !== 'all' ? { status: statusFilterSegment.value } : {};
    apps.value = await fetchTelemedicineCases(filters);
  } finally {
    loading.value = false;
  }
}

function buildStageHint(app: TelemedicineApp): StageHint | null {
  const stage: TelemedicineServiceStage = app.serviceStage;
  const status: TelemedicineStatus = app.status;
  if (stage === 'applied') {
    return {
      type: 'warning',
      title: '待审核申请',
      desc: '请尽快审核资料并指派专家，避免患者等待时间过长。'
    };
  }
  if (stage === 'review' || status === 'pending') {
    return {
      type: 'info',
      title: '审核进行中',
      desc: '资料核对中，可同步确认专家意向与排期需求。'
    };
  }
  if (stage === 'scheduled') {
    if (app.patientConfirmation) {
      return {
        type: 'success',
        title: '患者已确认参加会诊',
        desc: '可协调专家提前准备资料，按计划开启远程诊断。'
      };
    }
    return {
      type: 'info',
      title: '排期完成，等待会诊',
      desc: '确认专家与患者都已收到会议通知，提醒患者完成到诊确认。'
    };
  }
  if (stage === 'in_consult') {
    return {
      type: 'warning',
      title: '远程诊断进行中',
      desc: '关注会诊接入情况，必要时协调网络或资料支持，保障诊疗质量。'
    };
  }
  if (stage === 'report_submitted') {
    return {
      type: 'info',
      title: '专家报告已提交，等待反馈',
      desc: '提醒发起医生协助患者提交满意度评价，为服务归档做准备。'
    };
  }
  if (stage === 'evaluated') {
    return {
      type: 'warning',
      title: '患者评价完成，待归档',
      desc: '请尽快填写管理员服务评分并关闭流程，形成完整闭环。'
    };
  }
  if (stage === 'closed') {
    return {
      type: 'success',
      title: '流程已归档',
      desc: '该记录已完成，可在调度中心复盘总结经验并分享最佳实践。'
    };
  }
  return null;
}

const filteredApps = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase();
  if (!keyword) return apps.value;
  return apps.value.filter((item) => {
    const patient = item.patientName?.toLowerCase() || '';
    const expert = item.assignedExpertName?.toLowerCase() || '';
    const desc = item.description?.toLowerCase() || '';
    return patient.includes(keyword) || expert.includes(keyword) || desc.includes(keyword);
  });
});

const totalApps = computed(() => filteredApps.value.length);

const paginatedApps = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE;
  return filteredApps.value.slice(start, start + PAGE_SIZE);
});

const stageHints = computed<Record<string, StageHint | null>>(() => {
  const map: Record<string, StageHint | null> = {};
  for (const item of filteredApps.value) {
    map[item.id] = buildStageHint(item);
  }
  return map;
});

function gotoDetail(id: string) {
  router.push({ name: 'AdminTelemedicineDetail', params: { id } });
}

watch(statusFilterSegment, () => {
  page.value = 1;
  loadApps();
});

watch(searchKeyword, () => {
  page.value = 1;
});

watch(filteredApps, (list) => {
  const maxPage = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  if (page.value > maxPage) {
    page.value = maxPage;
  }
});

useTelemedicineSync(() => {
  loadApps();
});

onMounted(() => {
  loadApps();
});
</script>

<style scoped>
.telemedicine-board { padding:18px 16px; display:flex; flex-direction:column; gap:16px; }
.board-head { display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px; }
.head-title h2 { margin:0; font-size:24px; font-weight:700; color:#0f172a; }
.head-actions { display:flex; align-items:center; gap:12px; flex-wrap:wrap; justify-content:flex-end; min-height:40px; }
.tab-switch { background:#f1f5f9; border-radius:999px; padding:4px; }
.cases-search { width:240px; max-width:100%; flex:1 1 240px; min-width:200px; }
.muted { color:#6b7280; font-size:13px; }
.board-tip { border-radius:12px; }
.cases { display:flex; flex-direction:column; gap:12px; }
.app-card { cursor:pointer; border:1px solid rgba(15,23,42,0.08); border-radius:12px; padding:16px 18px; transition:transform .2s ease, box-shadow .2s ease; box-shadow:0 8px 22px rgba(15,23,42,0.06); display:flex; flex-direction:column; gap:12px; min-height:200px; background:linear-gradient(180deg, #ffffff 0%, #f8fbff 100%); }
.app-card:hover { transform:translateY(-2px); box-shadow:0 18px 34px rgba(15,23,42,0.12); }
.card-top { display:flex; justify-content:space-between; gap:12px; align-items:flex-start; }
.card-info { display:flex; flex-direction:column; gap:6px; }
.card-info .patient { font-size:18px; font-weight:700; color:#0f172a; }
.status-tags { display:flex; gap:8px; flex-wrap:wrap; justify-content:flex-end; align-items:center; }
.type-tag { background:rgba(37,99,235,0.12); border:none; color:#1d4ed8; }
.stage-tag { border:none; }
.card-desc { margin-top:4px; line-height:1.6; color:#111827; }
.card-followup { margin-top:12px; display:flex; gap:10px; padding:10px 12px; border-radius:10px; border:1px solid transparent; align-items:flex-start; }
.card-followup .followup-icon { display:flex; align-items:center; justify-content:center; width:26px; height:26px; border-radius:50%; background:rgba(37,99,235,0.12); color:#1d4ed8; flex-shrink:0; }
.card-followup .followup-text { display:flex; flex-direction:column; gap:4px; }
.card-followup .followup-title { font-weight:600; color:#0f172a; font-size:14px; }
.card-followup .followup-desc { color:#475569; font-size:12px; line-height:1.6; }
.card-followup.follow-warning { background:rgba(251,191,36,0.14); border-color:rgba(217,119,6,0.22); }
.card-followup.follow-warning .followup-icon { background:rgba(217,119,6,0.16); color:#b45309; }
.card-followup.follow-info { background:rgba(59,130,246,0.12); border-color:rgba(37,99,235,0.22); }
.card-followup.follow-info .followup-icon { background:rgba(37,99,235,0.14); color:#1d4ed8; }
.card-followup.follow-success { background:rgba(34,197,94,0.12); border-color:rgba(22,163,74,0.2); }
.card-followup.follow-success .followup-icon { background:rgba(34,197,94,0.18); color:#15803d; }
.card-meta { display:flex; flex-wrap:wrap; gap:12px; margin-top:4px; color:#0b66b3; font-size:13px; }
.card-meta span { display:flex; align-items:center; gap:4px; }
.support-tags { margin-top:10px; display:flex; flex-wrap:wrap; gap:8px; }
.support-tag { background:rgba(99,102,241,0.12); color:#4338ca; border:none; }
.card-actions { margin-top:auto; display:flex; justify-content:flex-end; }
.card-actions :deep(.arco-btn-text) { font-size:15px; font-weight:600; color:#1d4ed8; }
.cases-pagination { display:flex; justify-content:flex-end; margin-top:12px; }
@media (max-width: 768px) {
  .board-head { flex-direction:column; align-items:flex-start; }
  .cards { grid-template-columns:repeat(auto-fill, minmax(250px, 1fr)); }
}
</style>
