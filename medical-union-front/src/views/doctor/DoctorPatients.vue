<template>
  <div class="doctor-patients">
    <div class="toolbar">
      <a-input v-model:value="q" placeholder="搜索姓名/手机号/病历号" style="width:320px" />
  <!-- 合并筛选：在弹出面板内展示状态与优先级，自定义面板仅保留触发按钮 -->
      <a-popover trigger="click" :show-arrow="false">
        <template #trigger>
          <div class="filter-trigger">
            <span>筛选</span>
            <span class="arrow">▾</span>
          </div>
        </template>
        <div class="popover-content">
          <div class="custom-area">
            <div class="custom-header">
              <div style="font-weight:600">自定义筛选</div>
              <div style="display:flex; gap:8px; align-items:center">
                <a-button size="small" type="text" @click="showCustom = !showCustom">{{ showCustom ? '收起' : '展开' }}</a-button>
                <a-button type="text" size="small" class="reset-btn" @click="preset='all'; statusFilter='all'; filter='all'; department='all'">⟲ 重置</a-button>
              </div>
            </div>

            <div :class="['custom-body', { collapsed: !showCustom }]">
              <div class="filter-col">
                <div class="filter-label">就诊状态</div>
                <a-select v-model:value="statusFilter" size="small" placeholder="全部" style="width:140px">
                  <a-option value="all">全部</a-option>
                  <a-option value="ongoing">进行中</a-option>
                  <a-option value="completed">已完成</a-option>
                </a-select>
              </div>

              <div class="filter-col">
                <div class="filter-label">优先级</div>
                <a-select v-model:value="filter" size="small" placeholder="全部" style="width:140px">
                  <a-option value="all">全部</a-option>
                  <a-option value="high">高</a-option>
                  <a-option value="medium">中</a-option>
                  <a-option value="low">低</a-option>
                </a-select>
              </div>

              <div class="filter-col">
                <div class="filter-label">科室</div>
                <a-select v-model:value="department" size="small" placeholder="全部" style="width:140px">
                  <a-option value="all">全部</a-option>
                  <a-option v-for="d in departmentsList" :key="d" :value="d">{{ d }}</a-option>
                </a-select>
              </div>

              <!-- 最近就诊日期筛选已移除，避免水平滚动 -->
            </div>
          </div>
        </div>
      </a-popover>

      <div class="preset-wrapper" style="display:flex; align-items:center; gap:8px; margin-left:8px">
        <div class="preset-label" style="color:#000; font-weight:600;">预设筛选</div>
        <a-select v-model:value="preset" size="small" placeholder="全部" style="width:180px">
          <a-option value="all">全部患者</a-option>
          <a-option value="ongoing_high">进行中 · 高优先</a-option>
          <a-option value="ongoing">进行中</a-option>
          <a-option value="high">高优先</a-option>
          <a-option value="neike">内科患者</a-option>
          <a-option value="waike">外科患者</a-option>
        </a-select>
      </div>

      <a-space style="margin-left:auto">
        <a-button type="text" size="small" class="reset-btn" @click="preset='all'; statusFilter='all'; filter='all'; department='all'">⟲ 重置</a-button>
        <a-button type="primary" size="small" @click="refresh">刷新</a-button>
      </a-space>
    </div>

    <div class="list">
      <PatientCard v-for="p in filtered" :key="p.id" :patient="p" :large="true" @open="openPatient" />
    </div>

    <a-drawer v-model:visible="drawerVisible" width="600" placement="right" :footer="false">
      <template #title>患者详情</template>
      <div v-if="currentPatient">
        <PatientDetail :id="currentPatient.id" />
      </div>
    </a-drawer>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, watch } from 'vue';
import PatientCard from '@/components/PatientCard.vue';
import PatientDetail from '@/components/PatientDetail.vue';
import { fetchPatients } from '@/api/mock/patients';
import { useRoute, useRouter } from 'vue-router';

const q = ref('');
const filter = ref('all');
const statusFilter = ref('all');
const department = ref('all');
const dateRange = ref<any | null>(null);
const preset = ref('all');
const showCustom = ref(false);
const list = ref([] as any[]);
const drawerVisible = ref(false);
const currentPatient = ref<any | null>(null);
const route = useRoute();
const router = useRouter();

async function load() {
  list.value = await fetchPatients();
}

function refresh() { load(); }

function openPatient(id: string) {
  currentPatient.value = list.value.find(x => x.id === id) || null;
  drawerVisible.value = true;
}

const filtered = computed(() => {
  const matched = list.value.filter(p => {
    if (statusFilter.value !== 'all' && p.status !== statusFilter.value) return false;
    if (filter.value !== 'all' && p.triage !== filter.value) return false;
    if (department.value !== 'all' && p.department && p.department !== department.value) return false;
    if (dateRange.value && Array.isArray(dateRange.value) && dateRange.value.length === 2 && p.lastVisit) {
      const from = new Date(dateRange.value[0]).getTime();
      const to = new Date(dateRange.value[1]).getTime();
      const lv = new Date(p.lastVisit).getTime();
      if (isNaN(lv) || lv < from || lv > to) return false;
    }
    if (!q.value) return true;
    const s = q.value.toLowerCase();
    return (p.name || '').toLowerCase().includes(s) || (p.phone || '').includes(s) || (p.id || '').includes(s);
  });

  // sort: ongoing first, then by triage (high > medium > low)
  const triageRank: Record<string, number> = { high: 3, medium: 2, low: 1 };
  matched.sort((a: any, b: any) => {
    if (a.status !== b.status) {
      if (a.status === 'ongoing') return -1;
      if (b.status === 'ongoing') return 1;
    }
    const ra = triageRank[a.triage] || 0;
    const rb = triageRank[b.triage] || 0;
    return rb - ra; // higher triage first
  });

  return matched;
});

onMounted(load);

// initialize from query
onMounted(() => {
  const qv = route.query.q as string | undefined;
  const sf = route.query.status as string | undefined;
  const f = route.query.triage as string | undefined;
  const d = route.query.department as string | undefined;
  const dateFrom = route.query.dateFrom as string | undefined;
  const dateTo = route.query.dateTo as string | undefined;
  if (qv) q.value = qv;
  if (sf) statusFilter.value = sf;
  if (f) filter.value = f;
  if (d) department.value = d;
  if (dateFrom && dateTo) dateRange.value = [new Date(dateFrom), new Date(dateTo)];
  const pr = route.query.preset as string | undefined;
  if (pr) preset.value = pr;
});

const departmentsList = computed(() => {
  const set = new Set<string>();
  list.value.forEach((p: any) => { if (p.department) set.add(p.department); });
  return Array.from(set);
});

// sync to query (replace to avoid polluting history)
watch([q, statusFilter, filter, department, dateRange], () => {
  const query: Record<string, any> = { ...route.query };
  if (q.value) query.q = q.value; else delete query.q;
  if (statusFilter.value && statusFilter.value !== 'all') query.status = statusFilter.value; else delete query.status;
  if (filter.value && filter.value !== 'all') query.triage = filter.value; else delete query.triage;
  if (department.value && department.value !== 'all') query.department = department.value; else delete query.department;
  if (dateRange.value && Array.isArray(dateRange.value) && dateRange.value.length === 2) {
    const from = (dateRange.value[0] instanceof Date) ? dateRange.value[0].toISOString() : new Date(dateRange.value[0]).toISOString();
    const to = (dateRange.value[1] instanceof Date) ? dateRange.value[1].toISOString() : new Date(dateRange.value[1]).toISOString();
    query.dateFrom = from;
    query.dateTo = to;
  } else {
    delete query.dateFrom; delete query.dateTo;
  }
  router.replace({ query }).catch(() => {});
});

// apply preset mappings
watch(preset, (val) => {
  if (!val) return;
  if (val === 'all') { statusFilter.value = 'all'; filter.value = 'all'; department.value = 'all'; }
  if (val === 'ongoing_high') { statusFilter.value = 'ongoing'; filter.value = 'high'; }
  if (val === 'ongoing') { statusFilter.value = 'ongoing'; filter.value = 'all'; }
  if (val === 'high') { statusFilter.value = 'all'; filter.value = 'high'; }
  if (val === 'neike') { department.value = '内科'; }
  if (val === 'waike') { department.value = '外科'; }
  // also sync preset into query
  const query = { ...route.query, preset: val };
  router.replace({ query }).catch(() => {});
});
</script>

<style scoped lang="less">
.doctor-patients {
  padding:20px;
  background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
  min-height: calc(100vh - 64px);
  border-radius: 8px;
}
.toolbar { display:flex; gap:12px; align-items:center; margin-bottom:16px; height:72px; }
.toolbar a-input { background: #fff; border: 1px solid #e6eefc; border-radius:6px; }
.toolbar .filter-trigger {
  display:inline-flex; align-items:center; gap:8px; padding:4px 8px; border:1px solid rgba(226,238,252,0.9); border-radius:6px; background: rgba(255,255,255,0.92); color:#1e3a8a; cursor:pointer; font-size:14px;
}
.toolbar a-input, .toolbar .filter-trigger, .toolbar a-select, .toolbar a-button { height:40px; }
.popover-content :deep(.arco-select-selection) { height: 40px; line-height:40px; }
.toolbar .filter-trigger .arrow { font-size:12px; color:#6b7280; }
.list { display:flex; flex-direction:column; gap:10px; }

.filters-row { display:flex; gap:12px; align-items:flex-start; }
.filter-item { flex: none; }

.popover-content { width:auto; max-width:520px; padding:8px; display:flex; gap:12px; background: transparent; border-radius:6px; box-shadow:none; border:none; min-height:64px; overflow-x:visible; white-space:normal; align-items:center; flex-wrap:wrap; }
.reset-btn { color:#6b7280; }
.custom-area { flex:1; }
.custom-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; }
.custom-body { display:flex; gap:12px; align-items:flex-start; flex-wrap:nowrap; }
.filter-col { display:flex; flex-direction:column; width:140px; }
.filter-label { margin-bottom:6px; font-weight:600; font-size:13px; }

/* keep alignment centered so baseline doesn't jump when collapsing */
.custom-body { align-items:center; }

/* responsive: allow filters to wrap on narrow screens */
@media (max-width: 900px) {
  .custom-body { flex-wrap:wrap; gap:10px; }
  .filter-col { width: 100%; max-width: 320px; }
}

/* collapsed state: preserve height but hide visibility */
.custom-body.collapsed { visibility:hidden; height:0; overflow:hidden; }

/* Remove focus outline / background on popover trigger to avoid visual artifact */
.filter-trigger:focus { outline: none; box-shadow: none; }

/* If Arco inserts an empty popover wrapper element used only for positioning, hide its background but keep it interactive-free */
:deep(.arco-popover-content-wrapper[style*="background: transparent"]) { background: transparent !important; box-shadow: none !important; }

/* hide arco popover small triangle if present */
.popover-content :deep(.arco-popover-arrow), :deep(.arco-popover-arrow) { display:none !important; }

/* Ensure selects keep white selection box on top of transparent popover */
.popover-content :deep(.arco-select-selection) {
  background: #fff;
  border-radius: 6px;
}

/* Ensure selects show readable label text and padding */
.toolbar :deep(.arco-select-selection), .popover-content :deep(.arco-select-selection) {
  color: #0f172a;
  padding: 6px 10px;
}

/* Make the trigger less boxy to blend with toolbar */
.toolbar .filter-trigger { background: rgba(255,255,255,0.96); border:1px solid rgba(230,240,255,0.9); }

// make popover trigger subtle
.arco-popover-trigger .arco-btn { color: #2563eb; }
</style>