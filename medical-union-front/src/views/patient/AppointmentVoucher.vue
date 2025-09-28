<template>
  <div class="appointment-voucher">
    <header class="voucher-toolbar">
      <a-button type="text" class="back-btn" @click="back">返回</a-button>
      <span class="toolbar-note">请在就诊当天携带有效证件并出示此凭证。</span>
    </header>

    <div class="voucher-scroll">
      <a-card v-if="order" class="voucher-card" :bordered="false">
        <div class="voucher-header">
          <div class="header-main">
            <h1>{{ order.hospitalName }}</h1>
            <p class="header-meta">预约单号：{{ order.orderId }} · 提交于 {{ createdAtText }}</p>
          </div>
          <div class="code-panel">
            <span class="code-label">凭证码</span>
            <span class="code-value">{{ order.voucher?.code || '—' }}</span>
            <a-button size="small" type="primary" @click="copyCode">复制凭证码</a-button>
          </div>
        </div>

        <a-divider />

        <div class="details-grid">
          <div v-for="item in detailRows" :key="item.label" class="detail-item">
            <div class="detail-label">{{ item.label }}</div>
            <div class="detail-value">{{ item.value }}</div>
          </div>
        </div>

        <a-divider />

        <section class="reminder-block">
          <h3>就诊提醒</h3>
          <ul>
            <li v-for="item in reminders" :key="item">{{ item }}</li>
          </ul>
        </section>
      </a-card>

      <a-empty v-else class="voucher-empty" description="未找到相关预约凭证" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { fetchAppointments } from '@/api/mock/appointments';
import { Message } from '@arco-design/web-vue';

const route = useRoute();
const router = useRouter();
const order = ref<any | null>(null);

async function load() {
  const id = route.params.id as string;
  const list = await fetchAppointments();
  order.value = list.find((o:any) => o.orderId === id) || null;
}

function back() { router.back(); }

function copyCode() {
  const code = order.value?.voucher?.code || '';
  if (!code) { Message.info('无凭证码可复制'); return; }
  // try navigator.clipboard first
  try {
    navigator.clipboard?.writeText(code);
    Message.success('凭证码已复制到剪贴板');
  } catch (e) {
    // fallback
    const ta = document.createElement('textarea');
    ta.value = code;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    Message.success('凭证码已复制');
  }
}

const createdAtText = computed(() => {
  if (!order.value?.createdAt) return '—';
  const date = new Date(order.value.createdAt);
  if (Number.isNaN(date.getTime())) return order.value.createdAt;
  return date.toLocaleString('zh-CN', { hour12: false });
});

const appointmentSlot = computed(() => {
  if (!order.value) return '—';
  const dateStr = formatDate(order.value.date);
  return [dateStr, order.value.time].filter(Boolean).join(' ');
});

const departmentLabel = computed(() => {
  if (!order.value?.departmentId) return '—';
  const map: Record<string, string> = {
    'd-nei': '内科',
    'd-waike': '外科',
    'd-fuchan': '妇产科',
    'd-erkang': '儿科',
    'd-kouqiang': '口腔科',
    'd-yanjing': '眼科'
  };
  return map[order.value.departmentId] || '未识别科室';
});

const slotTypeLabel = computed(() => {
  const type = order.value?.slotType;
  const map: Record<string, string> = {
    expert: '专家号',
    normal: '普通号',
    followup: '复诊号'
  };
  return map[type as string] || '挂号';
});

const reminders = computed(() => {
  const core: string[] = [];
  const base = order.value?.voucher?.instructions;
  if (base) core.push(base);
  core.push('请提前15分钟到达医院办理取号。');
  core.push('携带本人有效证件及医保卡，如需取消请在就诊前一日完成。');
  return Array.from(new Set(core.filter(Boolean)));
});

const detailRows = computed(() => {
  if (!order.value) return [];
  const rows = [
    appointmentSlot.value && { label: '就诊时间', value: appointmentSlot.value },
    order.value.hospitalName && { label: '就诊地点', value: order.value.hospitalName },
    departmentLabel.value && { label: '科室', value: departmentLabel.value },
    order.value.doctorName && { label: '接诊医生', value: order.value.doctorName },
    order.value.slotType && { label: '号源类型', value: slotTypeLabel.value }
  ].filter(Boolean) as Array<{ label: string; value: string }>;
  return rows;
});

function formatDate(value?: string) {
  if (!value) return '';
  const safe = value.replace(/-/g, '/');
  const date = new Date(safe);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  });
}

onMounted(load);
</script>

<style scoped>
.appointment-voucher { height:100%; display:flex; flex-direction:column; padding:20px; box-sizing:border-box; }
.voucher-toolbar { display:flex; align-items:center; gap:16px; margin-bottom:12px; color:#475569; font-size:14px; }
.back-btn { padding:6px 14px; border-radius:999px; }
.toolbar-note { opacity:0.8; }

.voucher-scroll { flex:1; min-height:0; overflow:auto; padding-right:4px; }

.voucher-card { max-width:720px; margin:0 auto; padding:26px; border-radius:16px; box-shadow:0 12px 32px rgba(15,23,42,0.12); }

.voucher-header { display:flex; flex-wrap:wrap; gap:16px; justify-content:space-between; align-items:flex-start; margin-bottom:4px; }
.header-main h1 { margin:0; font-size:24px; font-weight:700; color:#0f172a; }
.header-meta { margin:4px 0 0; color:#64748b; font-size:14px; }

.code-panel { display:flex; flex-direction:column; align-items:flex-end; gap:8px; min-width:180px; }
.code-label { font-size:12px; color:#6b7280; letter-spacing:1px; text-transform:uppercase; }
.code-value { font-family:'Fira Code', 'SFMono-Regular', Consolas, 'Liberation Mono', monospace; font-size:22px; font-weight:700; padding:10px 16px; border-radius:12px; border:1px dashed rgba(37,99,235,0.5); color:#1d4ed8; background:#f8fafc; }
.code-panel .arco-btn { border-radius:10px; }

.details-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:18px; }
.detail-item { display:flex; flex-direction:column; gap:4px; padding:10px 12px; border-radius:12px; background:#f8fafc; }
.detail-label { font-size:13px; color:#64748b; }
.detail-value { font-size:16px; font-weight:600; color:#0f172a; word-break:break-word; }

.reminder-block h3 { margin:0 0 10px; font-size:16px; font-weight:700; color:#0f172a; }
.reminder-block ul { margin:0; padding-left:18px; display:flex; flex-direction:column; gap:6px; color:#334155; }
.reminder-block li { line-height:1.6; }

.voucher-empty { margin-top:40px; }

@media (max-width:768px) {
  .appointment-voucher { padding:16px 14px; }
  .voucher-card { padding:22px; }
  .code-panel { width:100%; align-items:flex-start; }
  .code-value { font-size:20px; }
}

@media (max-width:480px) {
  .voucher-card { padding:18px; }
  .header-main h1 { font-size:20px; }
  .details-grid { grid-template-columns:1fr; }
}
</style>
