<template>
  <div class="telemedicine-doctor">
    <div class="page-head">
      <div>
        <h3>远程医疗协同管理</h3>
        <p class="muted">发起或接收远程会诊、影像会诊、联合门诊等服务，并跟踪全流程（演示数据）。</p>
      </div>
      <div class="head-actions">
        <a-input-search
          v-model:value="searchKeyword"
          allow-clear
          placeholder="搜索患者、专家或备注"
          class="cases-search"
        />
        <a-button type="outline" :loading="loading" @click="loadApps">刷新</a-button>
  <a-button v-if="activeTab === 'initiated'" type="primary" @click="gotoCreate">新建申请</a-button>
      </div>
    </div>

    <div class="toolbar">
      <a-radio-group
        v-model:value="activeTab"
        type="button"
        size="large"
        class="tab-switch"
      >
        <a-radio
          v-for="option in tabOptions"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </a-radio>
      </a-radio-group>
    </div>

    <a-alert type="info" show-icon class="tip">
      当前为演示环境，远程诊断环节提供接口占位，可在接入第三方“互联网+”诊疗系统后替换实现。
    </a-alert>

    <a-spin :loading="loading">
      <template #element>
        <div class="cases">
          <template v-if="paginatedApps.length">
            <a-card v-for="item in paginatedApps" :key="item.id" class="case-card">
              <div class="card-top">
                <div class="card-info">
                  <div class="patient">{{ item.patientName }}</div>
                  <div class="muted">创建：{{ formatDateTime(item.createdAt) }}</div>
                </div>
                <div class="status-area">
                  <a-tag class="type-tag" color="arcoblue">{{ serviceTypeLabel(item.serviceType) }}</a-tag>
                  <a-tag
                    class="stage-tag"
                    :color="stageStyle(item.serviceStage).color"
                    :style="{ backgroundColor: stageStyle(item.serviceStage).bg, border: 'none' }"
                  >
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
                <span><IconClockCircle /> 期望方式：{{ methodLabel(item.preferredMethod) }}</span>
                <span v-if="item.preferredTime">期望时间：{{ item.preferredTime }}</span>
                <span v-if="item.assignedExpertName">指派专家：{{ item.assignedExpertName }}</span>
                <span v-if="item.schedule">会诊时间：{{ formatDateTime(item.schedule.scheduledAt) }}</span>
              </div>
              <div class="support-tags" v-if="item.supportTags?.length">
                <a-tag v-for="tag in item.supportTags" :key="tag" class="support-tag">{{ supportTagLabel(tag) }}</a-tag>
              </div>
              <div class="card-actions">
                <a-button type="text" @click="gotoDetail(item.id)">查看进度</a-button>
              </div>
            </a-card>
          </template>
          <a-empty v-else description="暂无符合条件的远程医疗服务记录" />
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
    </a-spin>

  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import { IconBulb, IconClockCircle } from '@arco-design/web-vue/es/icon';
import {
  fetchTelemedicineByDoctor,
  fetchTelemedicineForExpert,
  type TelemedicineApp,
  type TelemedicineServiceStage
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
import { useCurrentUser } from '@/composables/useCurrentUser';

const router = useRouter();

const { doctorProfile, currentUser } = useCurrentUser();

const doctorId = computed(() => {
  const id = doctorProfile.value?.id ?? currentUser.value?.id;
  return id != null ? String(id) : '';
});

const doctorExpertId = computed(() => {
  const expertId = doctorProfile.value?.expertId ?? currentUser.value?.expertId;
  const fallback = doctorId.value;
  return expertId || (fallback ? String(fallback) : '');
});

const tabOptions = [
  { label: '我发起的', value: 'initiated' },
  { label: '指派给我的', value: 'assigned' }
] as const;

const loading = ref(false);
const apps = ref<TelemedicineApp[]>([]);
const assignedApps = ref<TelemedicineApp[]>([]);
const activeTab = ref<(typeof tabOptions)[number]['value']>('initiated');

type StageHint = {
  type: 'warning' | 'info' | 'success';
  title: string;
  desc: string;
};

void IconBulb;
void IconClockCircle;

const PAGE_SIZE = 2;

const searchKeyword = ref('');
const page = ref(1);

const currentList = computed(() => (activeTab.value === 'initiated' ? apps.value : assignedApps.value));

const isExpertTab = computed(() => activeTab.value === 'assigned');

const filteredApps = computed(() => {
  const list = currentList.value;
  const keyword = searchKeyword.value.trim().toLowerCase();
  if (!keyword) return list;
  return list.filter((item) => {
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

function buildExpertHint(app: TelemedicineApp): StageHint | null {
  const stage: TelemedicineServiceStage = app.serviceStage;
  if (stage === 'review') {
    return {
      type: 'info',
      title: '管理员审核中',
      desc: '管理员正在核对资料，稍后将同步排期信息，请保持沟通畅通。'
    };
  }
  if (stage === 'scheduled') {
    if (app.patientConfirmation) {
      return {
        type: 'success',
        title: '患者已确认参加会诊',
        desc: '可根据患者反馈提前准备会诊要点，确保远程诊断顺利开展。'
      };
    }
    return {
      type: 'info',
      title: '即将开始远程会诊',
      desc: '请提前查看患者资料，确认会议链接可用，按时进入会诊。'
    };
  }
  if (stage === 'in_consult') {
    return {
      type: 'warning',
      title: '会诊进行中，待提交报告',
      desc: '完成诊断后及时提交报告，便于患者与管理员进入反馈环节。'
    };
  }
  if (stage === 'report_submitted') {
    return {
      type: 'info',
      title: '报告已提交，等待反馈',
      desc: '可与发起医生沟通后续安排，关注患者评价与管理员归档。'
    };
  }
  if (stage === 'evaluated') {
    return {
      type: 'success',
      title: '患者已完成评价',
      desc: '管理员将很快归档，留意反馈建议，为下次会诊做准备。'
    };
  }
  if (stage === 'closed') {
    return {
      type: 'success',
      title: '流程已归档',
      desc: '该案例结束，可在归档记录中复盘经验并沉淀模板。'
    };
  }
  if (app.status === 'pending') {
    return {
      type: 'warning',
      title: '等待管理员审核',
      desc: '调度尚未完成，可与信息员保持沟通，确保及时排期。'
    };
  }
  return null;
}

function buildInitiatorHint(app: TelemedicineApp): StageHint | null {
  const stage: TelemedicineServiceStage = app.serviceStage;
  if (stage === 'applied') {
    return {
      type: 'warning',
      title: '等待管理员审核',
      desc: '调度中心正在审核，请准备补充资料并关注排期通知。'
    };
  }
  if (stage === 'review' || app.status === 'pending') {
    return {
      type: 'info',
      title: '管理员审核中',
      desc: '请保持电话畅通，准备好专家指派所需的补充材料。'
    };
  }
  if (stage === 'scheduled') {
    if (app.patientConfirmation) {
      return {
        type: 'success',
        title: '患者已确认按时参加',
        desc: '可提前与专家沟通重点问题，准备完善的补充资料。'
      };
    }
    return {
      type: 'info',
      title: '专家排期已确认',
      desc: '提醒患者按时参加，会前检查网络与影像资料是否齐全。'
    };
  }
  if (stage === 'in_consult') {
    return {
      type: 'warning',
      title: '远程会诊进行中',
      desc: '可实时跟进专家与患者需求，必要时补充最新检查结果。'
    };
  }
  if (stage === 'report_submitted') {
    return {
      type: 'info',
      title: '专家报告已出',
      desc: '及时查阅诊断结果，并引导患者在患者端完成满意度评价。'
    };
  }
  if (stage === 'evaluated') {
    return {
      type: 'success',
      title: '患者评价完成',
      desc: '等待管理员服务评价，可整理材料用于MDT或院内复盘。'
    };
  }
  if (stage === 'closed') {
    return {
      type: 'success',
      title: '流程归档',
      desc: '该远程服务已闭环，可在团队例会上分享经验并沉淀模板。'
    };
  }
  return null;
}

const stageHints = computed<Record<string, StageHint | null>>(() => {
  const hints: Record<string, StageHint | null> = {};
  for (const app of filteredApps.value) {
    hints[app.id] = isExpertTab.value ? buildExpertHint(app) : buildInitiatorHint(app);
  }
  return hints;
});

watch([activeTab, searchKeyword], () => {
  page.value = 1;
});

watch(filteredApps, (list) => {
  const maxPage = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  if (page.value > maxPage) {
    page.value = maxPage;
  }
});

async function loadApps() {
  loading.value = true;
  try {
    const doctorKey = doctorId.value;
    if (!doctorKey) {
      Message.error('未获取到医生登录信息，无法加载远程医疗列表');
      apps.value = [];
      assignedApps.value = [];
      return;
    }

    const expertKey = doctorExpertId.value || doctorKey;

    const [initiated, assigned] = await Promise.all([
      fetchTelemedicineByDoctor(doctorKey),
      fetchTelemedicineForExpert(expertKey)
    ]);
    apps.value = initiated;
    assignedApps.value = assigned;
    page.value = 1;
  } finally {
    loading.value = false;
  }
}

function gotoDetail(id: string) {
  router.push({ name: 'DoctorTelemedicineDetail', params: { id } });
}

function gotoCreate() {
  router.push({ name: 'DoctorTelemedicineCreate' });
}

watch([doctorId, doctorExpertId], ([currentDoctorId, currentExpertId], [prevDoctorId, prevExpertId]) => {
  if (
    currentDoctorId &&
    (currentDoctorId !== prevDoctorId || currentExpertId !== prevExpertId)
  ) {
    loadApps();
  }
});

useTelemedicineSync(() => {
  loadApps();
});

onMounted(() => {
  if (doctorId.value) {
    loadApps();
  }
});
</script>

<style scoped>
.telemedicine-doctor { padding:16px; display:flex; flex-direction:column; gap:16px; }
.page-head { display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px; }
.head-actions { display:flex; align-items:center; justify-content:flex-end; gap:12px; min-height:38px; flex-wrap:wrap; }
.page-head h3 { margin:0; font-size:22px; font-weight:700; color:#0f172a; }
.muted { color:#6b7280; font-size:13px; }
.tip { border-radius:12px; }
.toolbar { display:flex; justify-content:flex-start; align-items:center; flex-wrap:wrap; gap:12px; }
.tab-switch { background:#f1f5f9; border-radius:999px; padding:4px; }
.cases-search { width:240px; max-width:100%; flex:1 1 240px; min-width:200px; }
.summary-row { display:grid; grid-template-columns:repeat(auto-fit, minmax(150px, 1fr)); gap:12px; }
.summary-card { background:#f8fafc; border:1px solid rgba(15,23,42,0.06); border-radius:12px; padding:14px 18px; display:flex; flex-direction:column; gap:4px; transition:transform .2s ease, box-shadow .2s ease; }
.summary-card.tone-primary { border-color:rgba(37,99,235,0.18); }
.summary-card.tone-warning { background:rgba(251,191,36,0.16); border-color:rgba(217,119,6,0.28); }
.summary-card.tone-info { background:rgba(59,130,246,0.14); border-color:rgba(37,99,235,0.2); }
.summary-card.tone-success { background:rgba(34,197,94,0.16); border-color:rgba(22,163,74,0.24); }
.summary-card:hover { transform:translateY(-2px); box-shadow:0 16px 28px rgba(15,23,42,0.12); }
.summary-number { font-size:24px; font-weight:700; color:#0f172a; }
.summary-label { font-size:13px; color:#6b7280; }
.cases { display:flex; flex-direction:column; gap:12px; }
.case-card { border:1px solid rgba(15,23,42,0.08); border-radius:12px; padding:16px 18px; box-shadow:0 8px 22px rgba(15,23,42,0.06); min-height:200px; display:flex; flex-direction:column; gap:12px; }
.card-top { display:flex; justify-content:space-between; gap:12px; align-items:flex-start; }
.card-info { display:flex; flex-direction:column; gap:6px; }
.card-info .patient { font-size:18px; font-weight:700; color:#0f172a; }
.status-area { display:flex; gap:8px; align-items:center; }
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
.create-form { display:flex; flex-direction:column; gap:16px; }
.create-hint { border-radius:10px; }
.create-actions { display:flex; justify-content:flex-end; }
.cases-pagination { display:flex; justify-content:flex-end; margin-top:12px; }
@media (max-width: 768px) {
  .page-head { flex-direction:column; align-items:flex-start; }
  .toolbar { flex-direction:column; align-items:flex-start; }
  .summary-row { grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); }
}
</style>