<template>
  <div class="doctor-list">
    <div v-if="departmentId" class="toolbar">
      <a-input v-model:value="q" placeholder="搜索医生/专长" style="width:320px" />
      <a-select v-model:value="slotType" placeholder="号源类型" style="width:140px">
        <a-option value="">全部</a-option>
        <a-option value="normal">普通号</a-option>
        <a-option value="expert">专家号</a-option>
        <a-option value="special">特需号</a-option>
      </a-select>
      <a-button type="primary" @click="load" class="quick-search">搜索医生</a-button>
    </div>

  <div class="list">
      <!-- 如果没有指定 departmentId，则显示科室卡（如果指定了 hospitalId，则为该医院的科室；否则为聚合的科室库） -->
      <div v-if="!departmentId" class="dept-list-grid">
        <div class="dept-grid">
          <div v-for="d in departments" :key="d.id" :ref="el => setDeptRef(el as HTMLElement | null, d.id)" :class="['dept-card', { selected: isSelected(d.id) } ]" @click="openDept(d.id)">
            <div v-if="d.thumb" class="dept-thumb" :style="{ backgroundImage: 'url(' + d.thumb + ')' }"></div>
            <div v-else class="dept-icon">{{ d.name ? d.name.charAt(0) : '科' }}</div>
            <div class="dept-name">{{ d.name }}</div>
            <div class="dept-hospital" v-if="d.hospitalName">{{ d.hospitalName }}</div>
            <div class="dept-desc">点击查看该科室的医生</div>
            <a-button type="text" class="dept-btn" @click.stop="openDept(d.id)">查看医生</a-button>
          </div>
        </div>
      </div>

      <!-- 医生列表（默认或当 departmentId 有值时） -->
      <div v-else>
        <div v-if="departmentId && !props.embedded" style="margin-bottom:8px">
          <a-button type="text" @click="backToDepartments">← 返回科室</a-button>
        </div>
        <div v-for="d in doctors" :key="d.id" class="doctor-item">
          <div class="doctor-main card-like">
            <div class="doctor-left">
              <div class="doctor-name"><strong>{{ d.name }}</strong> <span class="title">{{ d.title }}</span></div>
              <div class="special">{{ d.specialties.join(', ') }}</div>
              <div class="meta">评分: <a-tag type="success" size="small">{{ d.rating ?? '—' }}</a-tag> · 擅长: {{ d.intro || '-' }}</div>
            </div>
            <div class="doctor-actions">
              <a-space>
                <a-button type="text" @click="openSchedule(d.id)">查看排班</a-button>
                <a-button type="text" @click="openDetail(d.id)">查看详情</a-button>
                <a-button type="primary" class="book-btn" @click="startBooking(d.id)">预约</a-button>
              </a-space>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, watch, computed } from 'vue';
import { fetchDoctors } from '@/api/mock/doctors';
import { fetchHospitalById, fetchHospitals } from '@/api/mock/hospitals';
import { useRoute, useRouter } from 'vue-router';

const props = defineProps<{ hospitalIdProp?: string; departmentIdProp?: string; embedded?: boolean }>();

const route = useRoute();
const router = useRouter();
const q = ref('');
const slotType = ref('');
const doctors = ref<any[]>([]);
const departments = ref<{id:string,name:string,hospitalId?:string,hospitalName?:string,thumb?:string}[]>([]);
const selectedDept = ref<string | null>(null);
const deptRefs = ref<Record<string, HTMLElement | null>>({});

function setDeptRef(el: HTMLElement | null, id: string) {
  const map = deptRefs.value || {};
  if (el) map[id] = el;
  else delete map[id];
  deptRefs.value = map;
}

function isSelected(id: string) {
  return selectedDept.value === id;
}

// reactive raw values from route
const rawHospitalId = computed(() => (route.query.hospitalId as string) || undefined);
const rawDepartmentId = computed(() => (route.query.departmentId as string) || undefined);

// decide effective ids: props (when embedded) override route
const hospitalId = computed(() => props.hospitalIdProp || rawHospitalId.value);
const departmentId = computed(() => props.departmentIdProp || rawDepartmentId.value);

// If this component is used standalone and a hospitalId query is present, keep on DoctorList and load based on query
// (avoid redirecting back to HospitalDetail to prevent navigation loops)

async function load() {
  const res = await fetchDoctors({ hospitalId: hospitalId.value, departmentId: departmentId.value, q: q.value });
  doctors.value = res.items;
  // 如果有 hospitalId 且没有 departmentId，尝试加载医院的科室信息用于一级视图（仅当独立使用或嵌入并未提供 department）
  if (hospitalId.value && !departmentId.value) {
    const h = await fetchHospitalById(hospitalId.value);
    departments.value = h?.departments?.map((d: any) => ({ id: d.id, name: d.name, hospitalId: h.id, hospitalName: h.name })) || [];
    return;
  }

  // 如果没有指定 hospitalId 和 departmentId，聚合所有医院的科室用于全局医生查询的简略卡视图
  if (!hospitalId.value && !departmentId.value) {
    const hl = await fetchHospitals({ page: 1, pageSize: 50 });
    const map = new Map<string, any>();
    for (const hh of hl.items || []) {
      for (const d of hh.departments || []) {
        if (!map.has(d.id)) {
          map.set(d.id, { id: d.id, name: d.name, hospitalId: hh.id, hospitalName: hh.name });
        }
      }
    }
    departments.value = Array.from(map.values());
    doctors.value = []; // 清空医生列表，显示科室卡
    return;
  }
}

function openSchedule(doctorId: string) { router.push({ name: 'DoctorSchedule', params: { id: doctorId } }).catch(()=>{}); }
function startBooking(doctorId: string) { router.push({ name: 'DoctorSchedule', params: { id: doctorId } }).catch(()=>{}); }

// When in hospital context, navigate to HospitalDetail and open doctors tab with department filter
function openDept(deptId: string) { 
  // Update current route query to set departmentId (stay on DoctorList)
  const q = { ...(route.query || {}) } as Record<string, any>;
  if (hospitalId.value) q.hospitalId = hospitalId.value;
  q.departmentId = deptId;
  router.push({ name: 'DoctorList', query: q }).catch(()=>{});
}

// watch for department query to auto-select and scroll
watch(() => rawDepartmentId.value, (nid) => {
  if (nid) {
    selectedDept.value = nid as string;
    // wait a bit for DOM and data to settle (allow backend fetch); longer delay makes the highlight animation visible
    setTimeout(() => {
      const el = deptRefs.value?.[nid as string];
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // add pulse class
        el.classList.add('pulse');
        setTimeout(() => el.classList.remove('pulse'), 2000);
      }
    }, 600);
  } else {
    selectedDept.value = null;
  }
});

function backToDepartments() {
  // Return to the doctor query root (clear department filter)
  router.replace({ name: 'DoctorList', query: {} }).catch(()=>{});
}
function openDetail(doctorId: string) { router.push({ name: 'DoctorDetail', params: { id: doctorId } }).catch(()=>{}); }

onMounted(load);

// reload when query changes if standalone
watch(() => [route.query.hospitalId, route.query.departmentId, q.value], () => { if (!props.embedded) load(); });
</script>

<style scoped>
.doctor-list{display:flex;flex-direction:column;gap:12px}
.toolbar{display:flex;align-items:center;gap:12px;padding:8px 0}
.list{display:flex;flex-direction:column;gap:18px}
.doctor-item{padding:0}
.doctor-main.card-like{display:flex;justify-content:space-between;align-items:center;padding:18px 20px;min-height:110px;background:#fff;border-radius:10px;box-shadow:0 6px 18px rgba(15,23,42,0.06);border:1px solid rgba(11,95,255,0.06)}
.doctor-left{display:flex;flex-direction:column}
.doctor-name{font-size:20px;color:#0b5fff;font-weight:800}
.doctor-name .title{color:#6b7280;margin-left:10px;font-size:14px;font-weight:600}
.special{color:#334155;margin-top:8px;font-size:15px}
.meta{color:#667085;margin-top:8px;font-size:13px}
.doctor-main.card-like{transition:transform .12s ease, box-shadow .12s ease}
.doctor-main.card-like:hover{transform:translateY(-6px);box-shadow:0 12px 36px rgba(15,23,42,0.08)}
.doctor-actions{display:flex;flex-direction:row;gap:12px;align-items:center}
.doctor-actions :deep(.arco-button){min-width:110px}
.book-btn{background:#0b5fff;color:white;border-color:#0b5fff;padding:8px 14px;font-size:14px}
.book-btn[ghost]{background:transparent}
.toolbar .quick-search{margin-left:6px;padding:8px 14px}

.dept-list-grid{padding:6px 0}
.dept-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;max-width:980px;margin:0 auto}
.dept-card{background:#fff;border-radius:12px;padding:14px;box-shadow:0 6px 18px rgba(15,23,42,0.04);display:flex;flex-direction:column;align-items:flex-start;gap:8px;cursor:pointer}
.dept-icon{width:44px;height:44px;border-radius:8px;background:linear-gradient(135deg,#f0f7ff,#eef6ff);display:flex;align-items:center;justify-content:center;color:#0b5fff;font-weight:900}
.dept-name{font-weight:800;color:#0b5fff;font-size:16px}
.dept-desc{color:#6b7280;font-size:13px}
.dept-btn{margin-top:8px;padding:6px 10px}

.dept-card.selected{position:relative;border:1px solid rgba(11,95,255,0.12);box-shadow:0 16px 36px rgba(11,95,255,0.08);transform:translateY(-6px);background:linear-gradient(180deg,rgba(11,95,255,0.04),#fff);transition:all .28s ease}
.dept-card.selected::before{content:'';position:absolute;left:0;top:12px;bottom:12px;width:4px;background:linear-gradient(180deg,#0b5fff,#60a5fa);border-radius:4px}
.dept-card.selected .dept-name{color:#0844d6}
.dept-card.selected .dept-desc{color:#41507a}

@keyframes pulseHighlight{0%{box-shadow:0 0 0 0 rgba(11,95,255,0.12)}50%{box-shadow:0 0 0 8px rgba(11,95,255,0.06)}100%{box-shadow:0 0 0 0 rgba(11,95,255,0.00)}}
.dept-card.pulse{animation:pulseHighlight 1.6s ease-out 1}
</style>
