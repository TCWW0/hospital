<template>
  <div class="hospital-detail">
  <a-button v-if="route.params.id" type="text" @click="back">← 返回</a-button>
    <div class="header-row">
      <div>
        <h2>{{ hospital?.name }}</h2>
        <div class="meta">{{ hospital?.shortIntro }}</div>
        <div class="meta">地址：{{ hospital?.address }} · 电话：{{ hospital?.phone }}</div>
      </div>
      <div style="margin-left:auto; text-align:right">
        <!-- 简洁化：医院页不显示医生查询入口或实时余票 -->
      </div>
    </div>

    <div style="margin-top:16px">
      <a-tabs v-model:value="activeTab">
        <a-tab-pane key="departments" title="科室">
          <div style="margin-top:8px">
            <div class="dept-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px">
              <div v-for="d in hospital?.departments||[]" :key="d.id" class="dept-card" @click="openDept(d.id)" style="padding:10px;border-radius:8px;background:#fff;box-shadow:0 4px 12px rgba(12,16,24,0.04)">
                <div style="font-weight:700;color:#0b5fff">{{ d.name }}</div>
                <div style="color:#6b7280;margin-top:6px;font-size:13px">该科室的简介或常见疾病</div>
              </div>
            </div>
          </div>
        </a-tab-pane>
        <!-- 医生子页已移除：医生列表通过独立页面 /patient/doctors?hospitalId=.. 展示 -->
        <a-tab-pane key="intro" title="简介">
          <div style="margin-top:8px">
            <h3>医院简介</h3>
            <div>{{ hospital?.fullIntro }}</div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { fetchHospitalById, fetchHospitals } from '@/api/mock/hospitals';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const hospital = ref<any | null>(null);
const activeTab = ref((route.query.open as string) || 'departments');

async function load() {
  let id = route.params.id as string | undefined;
  if (!id) {
    // single-hospital deployment: pick the first hospital as overview
    const list = await fetchHospitals({ page: 1, pageSize: 1 });
    const first = list.items[0];
    if (!first) return;
    hospital.value = await fetchHospitalById(first.id);
    id = first.id;
  } else {
    hospital.value = await fetchHospitalById(id);
  }

  // no per-department availability shown on hospital page; department browsing happens in DoctorList
}

function back() { router.back(); }
function openDept(deptId: string) { 
  // navigate explicitly to independent DoctorList view with hospital and department filters
  const hid = String(route.params.id || hospital.value?.id || '');
  if (!hid) {
    router.push({ name: 'DoctorList', query: { departmentId: deptId } }).catch(()=>{});
    return;
  }
  router.push({ name: 'DoctorList', query: { hospitalId: hid, departmentId: deptId } }).catch(()=>{});
}

// doctor search entry removed from hospital page

onMounted(load);
</script>

<style scoped>
</style>
