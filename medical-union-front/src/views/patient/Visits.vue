<template>
  <div class="patient-visits no-outer-scroll">
    <div class="toolbar">
      <div class="title">就诊记录</div>
      <div class="filters">
        <a-select v-model="qType" placeholder="就诊类型" style="width: 120px" @change="onFilterChange">
          <a-option value="">全部</a-option>
          <a-option value="门诊">门诊</a-option>
          <a-option value="复查">复查</a-option>
          <a-option value="急诊">急诊</a-option>
          <a-option value="住院">住院</a-option>
        </a-select>
        <a-select v-model="qStatus" placeholder="状态" style="width: 120px" @change="onFilterChange">
          <a-option value="">全部</a-option>
          <a-option value="已完成">已完成</a-option>
          <a-option value="已取消">已取消</a-option>
        </a-select>
        <a-select v-model="qRange" placeholder="时间范围" style="width: 140px" @change="onFilterChange">
          <a-option value="">全部时间</a-option>
          <a-option value="7d">近7天</a-option>
          <a-option value="30d">近一月</a-option>
        </a-select>
      </div>
    </div>

    <div class="list scroll-container">
      <div v-for="v in visits" :key="v.id" class="visit-item">
        <div class="visit-card card-like">
          <div class="visit-left">
            <div class="line1">
              <span class="hospital">{{ v.hospitalName }}</span>
              <span class="sep">·</span>
              <span class="dept">{{ v.department }}</span>
              <a-tag size="small" :color="typeColor(v.visitType)" class="tag">{{ v.visitType }}</a-tag>
              <a-tag size="small" :color="statusColor(v.status)" class="tag outline">{{ v.status }}</a-tag>
            </div>
            <div class="line2">
              <span class="doctor"><strong>{{ v.doctorName }}</strong></span>
              <span class="diag">诊断：{{ v.diagnosis }}</span>
            </div>
            <div class="line3">
              <span class="time">{{ v.startTime }}<template v-if="v.endTime"> ~ {{ v.endTime }}</template></span>
              <span class="cost" v-if="v.cost != null">费用：¥{{ v.cost }}</span>
            </div>
          </div>
          <div class="visit-actions">
            <a-space>
              <a-button type="text" @click="exportPdf(v)">导出PDF</a-button>
              <a-button type="text" @click="toDetail(v.id)">查看详情</a-button>
            </a-space>
          </div>
        </div>
      </div>

      <a-empty v-if="!loading && visits.length===0" description="暂无就诊记录" />

      <div class="pager" v-if="total>0">
        <a-pagination
          :current="page"
          :page-size="pageSize"
          :total="total"
          show-total
          size="small"
          @change="onPageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { fetchPatientVisits, type VisitRecord, type VisitStatus } from '@/api/mock/visits';
import { Message } from '@arco-design/web-vue';

const visits = ref<VisitRecord[]>([]);
const page = ref(1);
const pageSize = ref(5);
const total = ref(0);
const loading = ref(false);
const qType = ref<VisitRecord['visitType'] | ''>('');
const qStatus = ref<VisitRecord['status'] | ''>('');
const qRange = ref<'' | '7d' | '30d'>('');
const router = useRouter();


const defaultStatuses: VisitStatus[] = ['已完成','已取消'];

function typeColor(t: VisitRecord['visitType']) {
  switch (t) {
    case '门诊': return 'arcoblue';
    case '复查': return 'cyan';
    case '急诊': return 'orangered';
    case '住院': return 'purple';
    default: return 'arcoblue';
  }
}
function statusColor(s: VisitRecord['status']) {
  switch (s) {
    case '已完成': return 'green';
    case '进行中': return 'gold';
    case '已预约': return 'blue';
    case '已取消': return 'red';
    default: return 'blue';
  }
}

async function load() {
  loading.value = true;
  try {
    const params: any = { page: page.value, pageSize: pageSize.value };
    if (qType.value) params.type = qType.value;
    if (qRange.value) params.range = qRange.value;
    if (qStatus.value) {
      params.status = qStatus.value;
    } else {
      // 默认仅显示已完成/已取消
      params.statuses = defaultStatuses;
    }
    const res = await fetchPatientVisits(params);
    visits.value = res.items;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
}

function onPageChange(p: number) { page.value = p; load(); }
function onFilterChange() { page.value = 1; load(); }
function exportPdf(v: VisitRecord) {
  // 占位：可接入 jsPDF / html2canvas 等
  console.debug('Export visit to PDF (placeholder):', v.id);
  Message.info('导出 PDF 功能开发中…');
}

function toDetail(id: string) {
  router.push(`/patient/visit/${id}`);
}

onMounted(load);
</script>

<style lang="less" scoped>
.patient-visits { display:flex; flex-direction:column; gap:12px; padding: 8px 0; height: calc(100vh - 160px); }
.no-outer-scroll { overflow: hidden; }
.toolbar { display:flex; align-items:center; justify-content:space-between; }
.title { font-size:20px; font-weight:800; color:#1f2937; } /* 更偏黑 */
.filters { display:flex; gap:10px; align-items:center; }
.list { display:flex; flex-direction:column; gap:14px; flex:1; overflow:auto; padding-right:6px; }
.visit-item { padding:0; }
.visit-card.card-like { display:flex; justify-content:space-between; align-items:center; padding:18px 20px; min-height:110px; background:#fff; border-radius:10px; box-shadow:0 6px 18px rgba(15,23,42,0.06); border:1px solid rgba(11,95,255,0.06); transition:transform .12s ease, box-shadow .12s ease; }
.visit-card.card-like:hover { transform:translateY(-6px); box-shadow:0 12px 36px rgba(15,23,42,0.08); }
.visit-left { display:flex; flex-direction:column; gap:8px; }
.line1 { display:flex; align-items:center; gap:8px; color:#0f3ea5; font-weight:700; } /* 降低蓝饱和，偏深蓝 */
.hospital { font-size:18px; color:#111827; } /* 更偏黑 */
.dept { color:#374151; font-weight:600; }
.sep { color:#9aa5b1; }
.tag { margin-left:6px; }
.tag.outline { background: #f6f9ff; }
.line2 { color:#374151; }
.line2 .doctor { color:#0f3ea5; }
.diag { margin-left:10px; color:#6b7280; }
.line3 { color:#6b7280; font-size:13px; display:flex; gap:16px; }
.cost { color:#0f3ea5; font-weight:700; }
.visit-actions { display:flex; flex-direction:row; gap:12px; align-items:center; }
.pager { display:flex; justify-content:center; padding:12px 0 6px; }

/* 提示：卡片通用样式见 src/styles/global.less 中 .mu-card / .mu-card--interactive；本页临时使用 .visit-card.card-like */
/* 隐藏组件外层滚动条，使用内部容器滚动 */
:global(body) { overflow: hidden; }

/* （已移除就诊详情抽屉相关样式） */
</style>