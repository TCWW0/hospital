<template>
  <div class="hospital-detail">
    <div class="topbar">
      <a-button v-if="route.params.id" type="text" @click="back">← 返回</a-button>
    </div>

    <!-- 顶部信息 Hero -->
    <a-card class="hero-card" :bordered="false">
      <template v-if="loading">
        <a-skeleton :loading="true" animation :paragraph="{ rows: 2 }" />
      </template>
      <template v-else>
        <div class="hero">
          <div class="hero-main">
            <div class="hero-title">{{ hospital?.name }}</div>
            <div class="hero-meta">{{ hospital?.shortIntro || '——' }}</div>
            <div class="hero-meta light">地址：{{ hospital?.address || '—' }} · 电话：{{ hospital?.phone || '—' }}</div>
          </div>
        </div>
      </template>
    </a-card>

    <!-- 主体内容 -->
    <a-card class="content-card" :bordered="false">
      <a-tabs v-model:value="activeTab">
        <a-tab-pane key="departments" title="科室">
          <div class="section">
            <div class="section-head">
              <div class="section-title">全部科室</div>
              <div class="section-tools">
                <a-input v-model="deptKeyword" allow-clear placeholder="搜索科室..." style="width: 220px" />
              </div>
            </div>
            <div class="dept-grid">
              <div v-for="d in filteredDepartments" :key="d.id" class="dept-card" @click="openDept(d.id)">
                <div class="dept-name">{{ d.name }}</div>
                <div class="dept-desc">该科室的简介或常见疾病</div>
              </div>
              <div v-if="!filteredDepartments.length" class="empty-hint">未找到相关科室</div>
            </div>
          </div>
        </a-tab-pane>
        <a-tab-pane key="intro" title="简介">
          <div class="section">
            <div class="section-title">医院简介</div>
            <div class="intro-text">{{ hospital?.fullIntro || '暂无介绍' }}</div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </div>
  
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { fetchHospitalById, fetchHospitals } from '@/api/mock/hospitals';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const hospital = ref<any | null>(null);
const loading = ref(true);
const activeTab = ref((route.query.open as string) || 'departments');
const deptKeyword = ref('');
const filteredDepartments = computed(() => {
  const list = hospital.value?.departments || [];
  const kw = deptKeyword.value.trim().toLowerCase();
  if (!kw) return list;
  return list.filter((d: any) => String(d?.name || '').toLowerCase().includes(kw));
});

async function load() {
  loading.value = true;
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
  loading.value = false;
}

function back() { router.back(); }
function openDept(deptId: string) { 
  // 改为跳转科室介绍页，聚焦“该医院该科室能看什么病/做什么检查”
  const hid = String(route.params.id || hospital.value?.id || '');
  if (!hid) return;
  router.push({ name: 'HospitalDepartmentIntro', params: { id: hid, deptId } }).catch(()=>{});
}

// doctor search entry removed from hospital page

onMounted(load);
</script>

<style lang="less" scoped>
.hospital-detail{
  display:flex;flex-direction:column;gap:12px;padding:8px 0;min-height:100%;
}
.topbar{ display:flex; align-items:center; }
.hero-card{ 
  background: linear-gradient(180deg, #f7faff 0%, #ffffff 100%);
  border: 1px solid rgba(11,95,255,0.06);
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(15,23,42,0.06);
}
.hero{ display:flex; align-items:flex-start; gap:16px; }
.hero-title{ font-size:22px; font-weight:800; color:#0b5fff; }
.hero-meta{ color:#334155; margin-top:4px; }
.hero-meta.light{ color:#64748b; }

.content-card{ border: 1px solid rgba(0,0,0,0.06); border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.06); }
.section{ margin-top: 8px; }
.section-head{ display:flex; align-items:center; gap:12px; margin-bottom: 12px; }
.section-title{ font-size:16px; font-weight:700; color:#0f172a; }
.section-tools{ margin-left:auto; }

.dept-grid{ display:grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
.dept-card{ padding:12px; border-radius:10px; background:#fff; border:1px solid rgba(0,0,0,0.06); box-shadow:0 6px 18px rgba(15,23,42,0.05); cursor:pointer; transition: all .2s ease; }
.dept-card:hover{ transform: translateY(-2px); box-shadow:0 10px 24px rgba(15,23,42,0.08); }
.dept-name{ font-weight:700; color:#0b5fff; }
.dept-desc{ color:#6b7280; margin-top:6px; font-size:13px; }
.empty-hint{ grid-column: 1/-1; text-align:center; color:#94a3b8; padding:24px 0; }

.intro-text{ color:#334155; white-space:pre-wrap; line-height:1.7; }
</style>
