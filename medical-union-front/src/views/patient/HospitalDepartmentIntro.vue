<template>
  <div class="dept-intro">
    <div class="topbar">
      <a-button type="text" @click="back">← 返回</a-button>
    </div>

    <a-card class="hero-card" :bordered="false">
      <template v-if="loading">
        <a-skeleton :loading="true" animation :paragraph="{ rows: 2 }" />
      </template>
      <template v-else>
        <div class="hero">
          <div class="hero-title">{{ intro?.departmentName }}（{{ hospital?.name || '—' }}）</div>
          <div class="hero-meta">{{ intro?.overview }}</div>
          <div class="hero-meta light">
            院内位置：{{ intro?.location || '—' }} · 出诊时间：{{ intro?.openHours || '—' }}
          </div>
        </div>
      </template>
    </a-card>

    <a-card class="content-card" :bordered="false">
      <div class="grid">
        <div class="col">
          <div class="section-title">常见症状</div>
          <ul class="pill-list">
            <li v-for="s in intro?.typicalSymptoms || []" :key="s">{{ s }}</li>
          </ul>
        </div>
        <div class="col">
          <div class="section-title">常见病症</div>
          <ul class="pill-list">
            <li v-for="d in intro?.diseases || []" :key="d">{{ d }}</li>
          </ul>
        </div>
        <div class="col">
          <div class="section-title">常规检查</div>
          <ul class="pill-list">
            <li v-for="e in intro?.examinations || []" :key="e">{{ e }}</li>
          </ul>
        </div>
      </div>

      <a-divider />

      <div class="grid">
        <div class="col-2">
          <div class="section-title">可提供的服务</div>
          <ul class="bullet-list">
            <li v-for="srv in intro?.services || []" :key="srv">{{ srv }}</li>
          </ul>
        </div>
        <div class="col-2">
          <div class="section-title">就诊指引</div>
          <ul class="bullet-list">
            <li v-for="g in intro?.guidance || []" :key="g">{{ g }}</li>
          </ul>
        </div>
      </div>

      <div class="cta">
        <a-space>
          <a-button type="primary" @click="goDoctorSearch">去医生查询</a-button>
          <a-button @click="back">返回上一页</a-button>
        </a-space>
      </div>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { fetchHospitalById } from '@/api/mock/hospitals';
import { fetchDepartmentIntro, type DepartmentIntro } from '@/api/mock/departments';

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const hospital = ref<any | null>(null);
const intro = ref<DepartmentIntro | null>(null);

async function load(){
  loading.value = true;
  const hid = String(route.params.id || '');
  const did = String(route.params.deptId || '');
  hospital.value = hid ? await fetchHospitalById(hid) : null;
  intro.value = hid && did ? await fetchDepartmentIntro(hid, did) : null;
  loading.value = false;
}

function back(){ router.back(); }
function goDoctorSearch(){
  const hid = String(route.params.id || '');
  const did = String(route.params.deptId || '');
  const query: Record<string,string> = {};
  if (hid) query.hospitalId = hid;
  if (did) query.departmentId = did;
  router.push({ name: 'DoctorList', query }).catch(()=>{});
}

onMounted(load);
</script>

<style lang="less" scoped>
.dept-intro{ display:flex; flex-direction:column; gap:12px; padding:8px 0; }
.topbar{ display:flex; align-items:center; }
.hero-card{ background: linear-gradient(180deg, #f7faff 0%, #ffffff 100%); border: 1px solid rgba(11,95,255,0.06); border-radius: 12px; box-shadow: 0 6px 18px rgba(15,23,42,0.06); }
.hero-title{ font-size:20px; font-weight:800; color:#0b5fff; }
.hero-meta{ color:#334155; margin-top:6px; }
.hero-meta.light{ color:#64748b; }

.content-card{ border: 1px solid rgba(0,0,0,0.06); border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.06); }
.section-title{ font-weight:700; color:#0f172a; margin-bottom:8px; }
.grid{ display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
.col{ background:#fff; border:1px solid rgba(0,0,0,0.06); border-radius: 10px; padding:12px; box-shadow: 0 6px 18px rgba(15,23,42,0.05); }
.col-2{ background:#fff; border:1px solid rgba(0,0,0,0.06); border-radius: 10px; padding:12px; box-shadow: 0 6px 18px rgba(15,23,42,0.05); }
.pill-list{ display:flex; flex-wrap:wrap; gap:8px; }
.pill-list li{ list-style:none; padding:6px 10px; border-radius:999px; background:#f1f5f9; color:#334155; font-size:13px; }
.bullet-list{ padding-left:18px; color:#334155; }
.bullet-list li{ margin:6px 0; }
.cta{ margin-top:12px; }
</style>
