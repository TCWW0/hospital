<template>
  <div class="my-appointments">
    <h3>我的预约</h3>
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
        <a-card v-for="o in orders" :key="o.orderId" class="order-card">
          <div class="order-top">
          <div class="order-info">
            <div class="order-title">{{ o.date }} {{ o.time }}</div>
            <div class="doctor-name">{{ o.doctorName }}</div>
            <div class="muted">{{ o.hospitalName }} · {{ translateSlot(o.slotType) }}</div>
          </div>
          <div class="order-status-vertical">
            <a-tag class="status-tag" :type="getStatusTagType(o.status)">{{ translateStatus(o.status) }}</a-tag>
            <a-tag v-if="o.payment?.status" class="status-tag payment" :type="getPaymentTagType(o.payment.status)">{{ translatePaymentStatus(o.payment.status) }}</a-tag>
          </div>
        </div>
        <div class="order-actions">
          <a-space>
            <a-button v-if="o.status === 'pending' || o.status === 'paid'" type="text" @click="cancel(o.orderId)">取消</a-button>
            <a-button @click="openVoucher(o.orderId)">查看凭证</a-button>
          </a-space>
        </div>
        </a-card>
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
.toolbar{display:flex;align-items:center;gap:12px;padding:8px 0;margin-bottom:10px}
.toolbar a-input{flex:0 0 auto}
.toolbar a-select{flex:0 0 auto}
.toolbar a-space{flex:0 0 auto}
.toolbar .quick-search{margin-left:6px;padding:6px 12px}
.cards-viewport{flex:1 1 auto; min-height:420px; max-height:calc(100vh - 220px); overflow:auto; padding-right:8px; scrollbar-gutter: stable both-edges}

/* hide default scrollbar visuals but reserve space to avoid layout shift */
.cards-viewport::-webkit-scrollbar { width:8px; height:8px }
.cards-viewport::-webkit-scrollbar-thumb{ background: transparent; border-radius:8px }
.cards-viewport{ scrollbar-width: thin; scrollbar-color: transparent transparent; -ms-overflow-style: -ms-autohiding-scrollbar }
.cards-viewport::-webkit-scrollbar-thumb{ background: rgba(11,95,255,0.12); border-radius:8px }
.cards-viewport:hover::-webkit-scrollbar-thumb{ background: rgba(11,95,255,0.28) }
.cards-viewport{ scrollbar-color: rgba(11,95,255,0.28) transparent }
.cards { display:flex; flex-direction:column; gap:14px; max-width:960px; margin:0 auto }
.order-card { padding:22px; background: #ffffff; border-radius:12px; box-shadow: 0 8px 28px rgba(15,23,42,0.08); display:flex; flex-direction:column; justify-content:space-between; min-height:140px }
.order-top { display:flex; justify-content:space-between; align-items:stretch }
.order-info { display:flex; flex-direction:column; justify-content:center }
.order-title { font-weight:900; font-size:22px; color:#0f172a }
.doctor-name { font-size:19px; margin-top:8px; color:#0b5fff; font-weight:900 }
.muted { color:#6b7280 }
.order-status-vertical { display:flex; flex-direction:column; gap:14px; align-items:flex-end; min-width:180px; justify-content:center }
.status-tag { padding:10px 16px; border-radius:999px; font-weight:800; font-size:15px; line-height:1.4 }
.status-tag[type="success"] { background:#dff9f3; color:#027a60 }
.status-tag[type="warning"] { background:#fff4e6; color:#bb6b00 }
.status-tag[type="error"] { background:#ffecec; color:#9b2c2c }
.status-tag.payment{background:#e8f0ff;color:#0b5fff}
.order-actions { margin-top:12px; text-align:right }
.order-actions a-button{font-size:15px}
</style>
