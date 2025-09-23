<template>
  <div class="appointment-voucher">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
      <a-button size="large" @click="back">返回</a-button>
      <h3 style="margin:0">挂号凭证</h3>
    </div>

    <a-card class="voucher-card">
      <div class="voucher-header">
        <h3>挂号凭证</h3>
        <div class="voucher-code">
          <span class="label">凭证码：</span>
          <span class="code">{{ order?.voucher?.code }}</span>
          <a-button type="text" size="small" @click="copyCode">复制</a-button>
        </div>
      </div>
      <div v-if="order" class="voucher-body">
        <div class="field"><strong>就诊时间：</strong><span>{{ order.date }} {{ order.time }}</span></div>
        <div class="field"><strong>地点：</strong><span>{{ order.hospitalName }}</span></div>
        <div class="field"><strong>医生：</strong><span>{{ order.doctorName }}</span></div>
        <div class="field"><strong>说明：</strong><span>{{ order.voucher?.instructions }}</span></div>
      </div>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
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

onMounted(load);
</script>

<style scoped>
.appointment-voucher { padding:20px; max-width:920px; margin:0 auto }
.voucher-card { padding:22px; border-radius:12px; box-shadow:0 8px 28px rgba(15,23,42,0.08); background:#fff }
.voucher-header { display:flex; justify-content:space-between; align-items:center }
.voucher-header h3 { margin:0; font-size:22px; font-weight:800 }
.voucher-code { display:flex; align-items:center; gap:10px; background:#0b5fff; color:white; padding:10px 14px; border-radius:10px; font-weight:800 }
.voucher-code .label{opacity:0.95;font-size:14px}
.voucher-code .code{font-size:18px;font-weight:900}
.voucher-code a-button{color:white}
.voucher-body { margin-top:18px; display:flex; flex-direction:column; gap:12px }
.field { display:flex; align-items:flex-start }
.field strong { width:130px; display:inline-block; color:#0f172a; font-weight:800; font-size:15px }
.field span { color:#334155; font-size:15px }
.back-btn{display:inline-flex;align-items:center;gap:8px;padding:10px 14px;border-radius:10px;background:#f3f6ff;color:#0b5fff;font-weight:700;box-shadow:0 4px 12px rgba(11,95,255,0.08);border:none;font-size:15px}
.back-btn:hover{background:#e8f0ff}
</style>
