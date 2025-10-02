<template>
  <div class="telemedicine-apply">
    <a-card class="info-card">
      <div class="info-head">
        <div>
          <h3>远程医疗进度</h3>
          <div class="muted">医生已为您发起远程诊疗申请，可在此查看各环节推进情况并完成评价。</div>
        </div>
        <a-tag color="arcoblue" class="info-tag">医生发起 · 患者追踪</a-tag>
      </div>
      <a-alert
        type="info"
        show-icon
        class="info-alert"
        message="如需发起远程医疗，请先联系您的主诊医生，由医生评估后提交申请。"
      />
      <div class="filter-row">
        <span class="filter-label">选择就诊人</span>
        <a-select v-model:value="patientId" style="width:260px" @change="loadApps">
          <a-option v-for="p in patients" :key="p.id" :value="p.id">{{ p.name }} · {{ p.relation || '' }}</a-option>
        </a-select>
        <a-button type="text" class="refresh-btn" @click="loadApps">刷新数据</a-button>
      </div>
    </a-card>

    <div class="apps-list" v-if="apps.length">
      <h4>我的远程医疗记录</h4>
      <div class="cards-viewport">
        <div class="cards">
          <a-card v-for="a in apps" :key="a.id" class="app-card">
            <div class="card-top">
              <div>
                <strong>{{ a.patientName }}</strong>
                <div class="muted">{{ formatDateTime(a.createdAt) }} · {{ methodLabel(a.preferredMethod) }}</div>
              </div>
              <div class="status-chips">
                <a-tag class="type-tag" color="arcoblue">{{ serviceTypeLabel(a.serviceType) }}</a-tag>
                <a-tag class="stage-tag" :color="stageStyle(a.serviceStage).color" :style="{ backgroundColor: stageStyle(a.serviceStage).bg, border:'none' }">
                  {{ stageLabel(a.serviceStage) }}
                </a-tag>
                <a-tag :color="statusStyle(a.status).color" :style="{ backgroundColor: statusStyle(a.status).bg, border:'none' }">
                  {{ statusLabel(a.status) }}
                </a-tag>
              </div>
            </div>
            <div class="card-body">{{ a.description }}</div>
            <div v-if="stageHints[a.id]" class="card-followup" :class="`follow-${stageHints[a.id]?.type}`">
              <div class="followup-icon"><IconBulb /></div>
              <div class="followup-text">
                <div class="followup-title">{{ stageHints[a.id]?.title }}</div>
                <div class="followup-desc">{{ stageHints[a.id]?.desc }}</div>
              </div>
            </div>
            <div class="card-meta" v-if="a.createdByDoctorName">
              <IconUser />
              <span>发起医生：{{ a.createdByDoctorName }}</span>
            </div>
            <div class="card-meta" v-if="a.assignedExpertName">
              <IconUser />
              <span>专家：{{ a.assignedExpertName }}</span>
            </div>
            <div class="card-meta" v-if="a.schedule">
              <IconClockCircle />
              <span>安排：{{ formatDateTime(a.schedule.scheduledAt) }} · {{ methodLabel(a.schedule.method) }}</span>
            </div>
            <div class="card-support" v-if="a.supportTags?.length">
              <a-tag v-for="tag in a.supportTags" :key="tag" class="support-tag">{{ supportTagLabel(tag) }}</a-tag>
            </div>
            <div class="card-actions">
              <a-button size="mini" type="text" @click="gotoDetail(a.id)">查看详情</a-button>
            </div>
          </a-card>
        </div>
      </div>
    </div>
    <a-empty v-else description="暂无远程医疗记录" />
  </div>

</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { IconBulb, IconClockCircle, IconUser } from '@arco-design/web-vue/es/icon';
import { fetchPatients } from '@/api/mock/patients';
import {
  fetchTelemedicineApplications,
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

void IconBulb;
void IconClockCircle;
void IconUser;

const router = useRouter();

const patients = ref<any[]>([]);
const patientId = ref('');
const apps = ref<TelemedicineApp[]>([]);

type StageHint = {
  type: 'warning' | 'info' | 'success';
  title: string;
  desc: string;
};

function buildPatientHint(app: TelemedicineApp): StageHint | null {
  const stage: TelemedicineServiceStage = app.serviceStage;
  if (app.status === 'pending' || stage === 'applied') {
    return {
      type: 'warning',
      title: '等待医院审核',
      desc: '主诊医生与管理员正在审核资料，请保持电话畅通并准备补充检查结果。'
    };
  }
  if (stage === 'review') {
    return {
      type: 'info',
      title: '医院正在安排排期',
      desc: '管理员核对资料并协调专家时间，请留意来自医院的通知。'
    };
  }
  if (stage === 'scheduled') {
    if (app.patientConfirmation) {
      return {
        type: 'success',
        title: '已确认按时参加',
        desc: '请按计划提前 10 分钟进入会诊，如需调整请及时联系医生。'
      };
    }
    return {
      type: 'info',
      title: '会诊已排期',
      desc: '记下会诊时间并点击详情页确认出席，提前检查网络与病历资料。'
    };
  }
  if (stage === 'in_consult') {
    return {
      type: 'warning',
      title: '远程诊断进行中',
      desc: '请按时进入会诊房间，如有影像或化验补充，可联系主诊医生上传。'
    };
  }
  if (stage === 'report_submitted') {
    return {
      type: 'info',
      title: '专家报告已发布',
      desc: '点击进入详情可查看诊疗结论，记得在“我的评价”中反馈服务体验。'
    };
  }
  if (stage === 'evaluated') {
    return {
      type: 'success',
      title: '感谢您的评价',
      desc: '管理员将结合反馈完成归档，如有补充资料需求医生会与您联系。'
    };
  }
  if (stage === 'closed') {
    return {
      type: 'success',
      title: '远程医疗服务已结束',
      desc: '所有诊疗记录已归档，可随时回看报告。如需继续跟进，请联系主诊医生。'
    };
  }
  return null;
}

const stageHints = computed<Record<string, StageHint | null>>(() => {
  const map: Record<string, StageHint | null> = {};
  for (const item of apps.value) {
    map[item.id] = buildPatientHint(item);
  }
  return map;
});

async function loadApps() {
  const params = patientId.value ? { patientId: patientId.value } : {};
  apps.value = await fetchTelemedicineApplications(params);
}

async function load() {
  patients.value = await fetchPatients();
  if (!patientId.value && patients.value.length) {
    patientId.value = patients.value[0].id;
  }
  await loadApps();
}

function gotoDetail(id: string) {
  router.push({ name: 'PatientTelemedicineDetail', params: { id } });
}

onMounted(load);

useTelemedicineSync(() => {
  loadApps();
});
</script>

<style scoped>
.telemedicine-apply { padding:16px; }
.info-card { max-width: 980px; margin: 0 auto 18px; border-radius:10px; box-shadow:0 4px 18px rgba(12,45,89,0.06); }
.info-head { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; }
.info-head h3 { margin:0; font-size:22px; font-weight:700; color:#0f172a; }
.info-tag { border:none; }
.info-alert { margin-top:12px; }
.filter-row { display:flex; align-items:center; gap:12px; margin-top:16px; flex-wrap:wrap; }
.filter-label { font-weight:600; color:#1f2937; }
.refresh-btn { padding:0; }
.muted { color:#6b7280; font-size:13px; }
.apps-list { max-width:980px; margin: 12px auto; }
.cards-viewport { max-height: 360px; overflow:auto; padding-right:8px; }
.cards-viewport::-webkit-scrollbar{ width:10px; }
.cards-viewport::-webkit-scrollbar-thumb{ background:#e6e6e6; border-radius:6px; }
.cards { display:flex; flex-direction:column; gap:12px; }
.app-card{ border-radius:12px; box-shadow:0 10px 24px rgba(15,23,42,0.08); }
.card-top{ display:flex; justify-content:space-between; align-items:flex-start; gap:12px; }
.status-chips { display:flex; gap:6px; flex-wrap:wrap; justify-content:flex-end; }
.type-tag { background:rgba(37,99,235,0.12); border:none; color:#1d4ed8; }
.stage-tag { border:none; }
.card-body{ margin-top:8px; line-height:1.6; }
.card-followup{ margin-top:10px; display:flex; gap:10px; padding:10px 12px; border-radius:10px; border:1px solid transparent; align-items:flex-start; }
.card-followup .followup-icon{ display:flex; align-items:center; justify-content:center; width:24px; height:24px; border-radius:50%; background:rgba(59,130,246,0.14); color:#1d4ed8; flex-shrink:0; }
.card-followup .followup-text{ display:flex; flex-direction:column; gap:3px; }
.card-followup .followup-title{ font-weight:600; color:#0f172a; font-size:14px; }
.card-followup .followup-desc{ color:#475569; font-size:12px; line-height:1.6; }
.card-followup.follow-warning{ background:rgba(251,191,36,0.14); border-color:rgba(217,119,6,0.2); }
.card-followup.follow-warning .followup-icon{ background:rgba(217,119,6,0.16); color:#b45309; }
.card-followup.follow-info{ background:rgba(59,130,246,0.12); border-color:rgba(37,99,235,0.2); }
.card-followup.follow-info .followup-icon{ background:rgba(37,99,235,0.14); color:#1d4ed8; }
.card-followup.follow-success{ background:rgba(34,197,94,0.14); border-color:rgba(22,163,74,0.2); }
.card-followup.follow-success .followup-icon{ background:rgba(34,197,94,0.18); color:#15803d; }
.card-meta{ display:flex; align-items:center; gap:6px; color:#0b66b3; font-size:13px; margin-top:6px; }
.card-support { margin-top:8px; display:flex; gap:8px; flex-wrap:wrap; }
.support-tag { background:rgba(99,102,241,0.12); color:#4338ca; border:none; }
.card-actions{ text-align:right; margin-top:8px; }
@media (max-width: 900px){
  .info-head { flex-direction:column; align-items:flex-start; }
}
</style>
