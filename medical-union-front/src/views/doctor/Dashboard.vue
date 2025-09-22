<template>
  <div class="doctor-dashboard">
    <div style="display:flex; gap:16px; align-items:flex-start;">
      <div style="flex:1">
  <DashboardSummary :summary="patientOverview" />

        <section style="margin-top:16px; display:flex; gap:16px;">
          <div style="flex:1; background:#fff; padding:12px; border-radius:8px;">
            <h3>患者分布（按紧急程度）</h3>
            <div style="display:flex; gap:8px; margin-top:12px">
              <div style="flex:1; text-align:center; padding:8px; background:#f8fafc; border-radius:6px">
                <div style="color:#0f172a; font-weight:700; font-size:20px">{{ patientOverview.highTriage }}</div>
                <div style="color:#6b7280">高危患者</div>
              </div>
              <div style="flex:1; text-align:center; padding:8px; background:#f8fafc; border-radius:6px">
                <div style="color:#0f172a; font-weight:700; font-size:20px">{{ patientOverview.mediumTriage }}</div>
                <div style="color:#6b7280">中等危</div>
              </div>
              <div style="flex:1; text-align:center; padding:8px; background:#f8fafc; border-radius:6px">
                <div style="color:#0f172a; font-weight:700; font-size:20px">{{ patientOverview.lowTriage }}</div>
                <div style="color:#6b7280">低危</div>
              </div>
            </div>
          </div>

          <div style="width:320px; background:#fff; padding:12px; border-radius:8px;">
            <h3>最近 7 天新增就诊</h3>
            <MiniTrendChart :data="trend" />
          </div>
        </section>

        <section style="margin-top:16px; background:#fff; padding:12px; border-radius:8px;">
          <h3>最近患者</h3>
          <div style="display:flex; flex-direction:column; gap:8px; margin-top:8px; max-height:408px; overflow:auto;">
            <PatientCard v-for="p in patients.slice(0,4)" :key="p.id" :patient="p" :compact="false" :large="true" :dotOnAvatar="true" :showActions="false" @open="openPatient" />
          </div>
        </section>
      </div>

      <div style="width:320px">
        <section style="background:#fff; padding:12px; border-radius:8px;">
          <h3>快速操作</h3>
          <div style="display:flex; flex-direction:column; gap:8px; margin-top:8px">
            <a-button type="primary" @click="exportHighRisk">导出高危患者</a-button>
            <a-button type="secondary" @click="createFollowup">新建随访</a-button>
            <a-button type="text" @click="notifyPending">提醒未处理患者</a-button>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import DashboardSummary from '@/components/DashboardSummary.vue';
import MiniTrendChart from '@/components/MiniTrendChart.vue';
import PatientCard from '@/components/PatientCard.vue';
import { getDashboardSummary, getPatientOverview, getPatientTrend, getSortedPatients } from '@/api/index';
import { useRouter } from 'vue-router';

const router = useRouter();

const summary = ref<any>({});
const patientOverview = ref<any>({ totalPatients:0, highTriage:0, mediumTriage:0, lowTriage:0, ongoing:0, completed:0 });
const trend = ref<any[]>([]);
const patients = ref<any[]>([]);

async function load() {
  summary.value = await getDashboardSummary();
  patientOverview.value = await getPatientOverview();
  trend.value = await getPatientTrend(7);
  patients.value = await getSortedPatients(6);
}

function openPatient(id: string) { router.push({ name: 'PatientProfile', params: { id } }).catch(()=>{}); }

onMounted(() => { load(); });

function exportHighRisk() {
  const high = patients.value.filter((p:any) => p.triage === 'high');
  if (!high.length) return;
  const rows = [['id','name','age','gender','phone','lastVisit','triage','status']];
  high.forEach((p:any) => rows.push([p.id, p.name, p.age, p.gender, p.phone || '', p.lastVisit || '', p.triage, p.status]));
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'high_risk_patients.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

function createFollowup() {
  // placeholder behavior: navigate to patients page where followup creation exists
  router.push('/doctor/patients').catch(()=>{});
}

function notifyPending() {
  // UI placeholder — display a console message for now
  console.info('提醒已发送给未处理患者（mock）');
}
</script>

<style lang="less" scoped>
.doctor-dashboard { padding: 24px }
</style>