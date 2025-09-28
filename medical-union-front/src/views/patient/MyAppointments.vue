<template>
  <div class="my-appointments">
    <h3 class="page-title">我的预约</h3>
    <div class="toolbar">
      <a-input v-model:value="q" placeholder="搜索医生/医院/科室" style="width:360px" />
      <a-select v-model:value="filterStatus" placeholder="状态" style="width:140px">
        <a-option value="">全部</a-option>
        <a-option value="active">进行中</a-option>
        <a-option value="completed">已完成</a-option>
        <a-option value="cancelled">已取消</a-option>
      </a-select>
      <a-select v-model:value="sortBy" placeholder="排序" style="width:160px">
        <a-option value="default">默认</a-option>
        <a-option value="date_desc">时间（新→旧）</a-option>
        <a-option value="date_asc">时间（旧→新）</a-option>
        <a-option value="doctor">医生</a-option>
      </a-select>
      <a-button type="primary" @click="load" class="quick-search">搜索</a-button>
    </div>
    <div class="cards-viewport">
      <div class="cards">
        <div v-for="o in orders" :key="o.orderId" class="appointment-card card-like">
          <div class="appointment-main">
            <div class="line1">
              <span class="slot">{{ o.date }} {{ o.time }}</span>
              <span class="sep">·</span>
              <span class="hospital">{{ o.hospitalName }}</span>
              <span class="sep">·</span>
              <span class="slot-type">{{ translateSlot(o.slotType) }}</span>
            </div>
            <div class="line2">
              <span class="doctor">{{ o.doctorName }}</span>
              <span class="muted">预约单号：{{ o.orderId }}</span>
            </div>
            <div class="line3">
              <span class="status-group">
                <a-tag class="status-tag" :type="getStatusTagType(o.status)">{{ translateStatus(o.status) }}</a-tag>
                <a-tag v-if="o.payment?.status" class="status-tag payment" :type="getPaymentTagType(o.payment.status)">{{ translatePaymentStatus(o.payment.status) }}</a-tag>
              </span>
              <span class="muted">创建时间：{{ o.createdAt }}</span>
            </div>
          </div>
          <div class="appointment-actions">
            <a-space>
              <a-button v-if="o.status === 'pending' || o.status === 'paid'" type="text" @click="cancel(o.orderId)">取消</a-button>
              <a-button type="primary" status="normal" @click="openVoucher(o.orderId)">查看凭证</a-button>
            </a-space>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { fetchAppointments, cancelAppointment } from '@/api/mock/appointments';
import { useRouter } from 'vue-router';
import { Modal, Message } from '@arco-design/web-vue';

const orders = ref<any[]>([]);
const q = ref('');
const filterStatus = ref('');
const sortBy = ref('default');
const router = useRouter();

function getStatusTagType(s: string) {
  switch (s) {
    case 'pending': return 'warning';
    case 'paid': return 'success';
    case 'confirmed': return 'success';
    case 'cancelled': return 'error';
    case 'completed': return 'default';
    default: return 'default';
  }
}

function getPaymentTagType(s?: string) {
  switch (s) {
    case 'paid': return 'success';
    case 'refunded': return 'error';
    case 'pending': return 'warning';
    case 'none': return 'default';
    default: return 'default';
  }
}

function translateStatus(s: string) {
  switch (s) {
    case 'pending': return '待处理';
    case 'paid': return '已预约（已支付）';
    case 'confirmed': return '已确认';
    case 'cancelled': return '已取消';
    case 'completed': return '已完成';
    default: return s;
  }
}

function translatePaymentStatus(s: string | undefined) {
  switch (s) {
    case 'paid': return '已支付';
    case 'refunded': return '已退款';
    case 'pending': return '待支付';
    case 'none': return '无';
    default: return s || '';
  }
}

// translatePaymentMethod removed because not used in this view

function translateSlot(t: string) {
  switch (t) {
    case 'normal': return '普通号';
    case 'expert': return '专家号';
    case 'special': return '特需号';
    default: return t;
  }
}

async function load() {
  let list = await fetchAppointments();
  // simple search filter by q
  if (q.value) {
    const key = q.value.toLowerCase();
    list = list.filter(o => (o.doctorName || '').toLowerCase().includes(key) || (o.hospitalName || '').toLowerCase().includes(key) );
  }
  // status filter
  if (filterStatus.value === 'active') {
    list = list.filter(o => ['pending','paid','confirmed'].includes(o.status));
  } else if (filterStatus.value === 'completed') {
    list = list.filter(o => o.status === 'completed');
  } else if (filterStatus.value === 'cancelled') {
    list = list.filter(o => o.status === 'cancelled');
  }

  // sort logic
  const active = ['pending','paid','confirmed'];
  if (sortBy.value === 'date_desc') {
    list.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } else if (sortBy.value === 'date_asc') {
    list.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } else if (sortBy.value === 'doctor') {
    list.sort((a,b) => ((a.doctorName||'').localeCompare(b.doctorName||'')));
  } else {
    // default: active first, then completed by date desc, then others by createdAt desc
    list.sort((a,b) => {
      const aActive = active.includes(a.status) ? 0 : 1;
      const bActive = active.includes(b.status) ? 0 : 1;
      if (aActive !== bActive) return aActive - bActive;
      if (a.status === 'completed' && b.status === 'completed') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  orders.value = list;
}
function openVoucher(id: string) { router.push({ name: 'AppointmentVoucher', params: { id } }).catch(()=>{}); }
async function cancel(id: string) {
  Modal.confirm({
    title: '确认取消',
    content: '是否确认取消此预约？根据支付方式可能会发起退款（模拟）。',
    onOk: async () => {
      const res = await cancelAppointment(id, '用户取消');
      if (res.success) {
        Message.success('已取消，退款已处理（模拟）');
      } else {
        Message.error('取消失败');
      }
      await load();
    }
  });
}

onMounted(load);
</script>

<style scoped>
.my-appointments { padding:16px; display:flex; flex-direction:column; height:100%; }
.page-title { font-size:20px; font-weight:800; color:#1f2937; margin: 0 0 6px; }
.toolbar{display:flex;align-items:center;gap:12px;padding:8px 0;margin-bottom:10px}
.toolbar .quick-search{margin-left:6px;padding:6px 12px}
.cards-viewport{flex:1 1 auto; min-height:420px; max-height:calc(100vh - 220px); overflow:auto; padding-right:8px; scrollbar-gutter: stable both-edges}

/* scrollbar visuals */
.cards-viewport::-webkit-scrollbar { width:8px; height:8px }
.cards-viewport::-webkit-scrollbar-thumb{ background: rgba(11,95,255,0.12); border-radius:8px }
.cards-viewport:hover::-webkit-scrollbar-thumb{ background: rgba(11,95,255,0.28) }
.cards-viewport{ scrollbar-width: thin; scrollbar-color: rgba(11,95,255,0.28) transparent; -ms-overflow-style: -ms-autohiding-scrollbar }

.cards { display:flex; flex-direction:column; gap:14px; max-width:960px; margin:0 auto }
.appointment-card { display:flex; justify-content:space-between; align-items:center; gap:20px; padding:20px 22px; min-height:120px; background:#fff; border-radius:14px; box-shadow:0 8px 24px rgba(15,23,42,0.08); border:1px solid rgba(15,23,42,0.06); transition:transform .15s ease, box-shadow .15s ease; }
.appointment-card:hover { transform:translateY(-4px); box-shadow:0 18px 44px rgba(15,23,42,0.12); }
.appointment-main { display:flex; flex-direction:column; gap:10px; min-width:0; }
.line1, .line2, .line3 { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.slot { font-size:18px; font-weight:700; color:#0f3ea5; }
.hospital, .slot-type { color:#374151; font-weight:600; }
.doctor { font-size:16px; font-weight:700; color:#111827; }
.muted { color:#6b7280; font-size:13px; }
.line3 { justify-content:space-between; gap:16px; }
.status-group { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
.status-tag { padding:6px 14px; border-radius:999px; font-weight:600; font-size:13px; line-height:1.3; }
.status-tag[type="success"] { background:#dff9f3; color:#027a60 }
.status-tag[type="warning"] { background:#fff4e6; color:#bb6b00 }
.status-tag[type="error"] { background:#ffecec; color:#9b2c2c }
.status-tag.payment{background:#e8f0ff;color:#0b5fff}
.appointment-actions { display:flex; align-items:center; justify-content:flex-end; min-width:160px; }
.appointment-actions .arco-btn { min-width:92px; }
</style>
