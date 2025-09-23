<template>
  <div class="appointment-confirm">
    <div class="confirm-header">
      <a-button type="text" size="large" @click="back">← 返回</a-button>
      <h3>确认挂号</h3>
    </div>

    <!-- cards viewport: supports internal scrolling when content tall -->
    <div class="cards-viewport">
      <div class="confirm-grid vertical" role="region">
      <!-- 医生卡片 -->
      <div class="card doctor-card">
        <div class="card-label">医生信息</div>
        <div class="doctor-row">
          <div class="avatar">{{ doctor?.name ? doctor.name.charAt(0) : '医' }}</div>
          <div class="doctor-meta">
            <div class="name">{{ doctor?.name }} <span class="title">{{ doctor?.title }}</span></div>
            <div class="muted">科室：{{ doctor?.department || '-' }}</div>
            <div class="muted">日期：<strong>{{ date || '-' }}</strong> · 时段：<strong>{{ time || '-' }}</strong></div>
            <div class="slot">号种：<a-tag type="primary">{{ slotLabel }}</a-tag></div>
          </div>
        </div>

        <!-- 费用与支付 -->
      </div>

      <!-- 就诊人 + 主诉卡片 -->
  <div class="card patient-card">
        <div class="card-label">选择就诊人</div>
        <div class="patient-select-row">
          <a-select v-model:value="patientId" placeholder="请选择就诊人" style="width:340px">
            <a-option v-for="p in patients" :key="p.id" :value="p.id">{{ p.name }} · {{ p.phone }}</a-option>
          </a-select>
          <a-button type="text" size="small" @click="showAddFamily = true">添加家庭成员</a-button>
        </div>

        <!-- 已有就诊人展示（mock 列表） -->
        <div class="patient-list">
          <div v-for="p in patients" :key="p.id" class="patient-item" @click="patientId = p.id">
            <div class="p-avatar">{{ p.name ? p.name.charAt(0) : '人' }}</div>
            <div class="p-meta">
              <div class="p-name">{{ p.name }} <span class="p-phone">{{ p.phone }}</span></div>
              <div class="p-sub">{{ p.relation || '' }}</div>
            </div>
            <div class="p-action" v-if="patientId === p.id">已选</div>
          </div>
        </div>

        <div class="complaint-block">
            <div class="label-row">
                <div class="card-label">主诉</div>
                <div class="char-count">{{ complaint.length || 0 }} / 300</div>
            </div>
            <a-textarea
                v-model:value="complaint"
                :maxlength="300"
                :auto-size="{ minRows: 10, maxRows: 22 }"
                placeholder="请简要描述症状/既往史/过敏史（最多300字）"
            />
        </div>

      <!-- 费用与支付 -->
      <div class="card payment-card">
        <div class="card-label">费用与支付方式</div>
        <div class="fee-row">
          <div class="fee-amount">应付：<div class="amount">¥ {{ feeAmount.toFixed(2) }}</div></div>
          <div class="payment-method">
            <a-radio-group v-model:value="paymentMethod">
              <a-space direction="vertical">
                <a-radio value="wechat">微信支付</a-radio>
                <a-radio value="alipay">支付宝</a-radio>
                <a-radio value="ehealth">医保电子支付</a-radio>
              </a-space>
            </a-radio-group>
          </div>
        </div>
      </div>
      </div>
    </div>

    <!-- 添加家庭成员模态 -->
    <a-modal v-model:visible="showAddFamily" title="添加家庭成员" width="520px" mask-closable>
      <div style="display:flex; flex-direction:column; gap:8px">
        <a-input v-model:value="newMember.name" placeholder="姓名" />
        <a-input v-model:value="newMember.phone" placeholder="手机号码" />
        <a-select v-model:value="newMember.relation" placeholder="关系">
          <a-select-option value="spouse">配偶</a-select-option>
          <a-select-option value="child">子女</a-select-option>
          <a-select-option value="parent">父母</a-select-option>
        </a-select>
      </div>
      <template #footer>
        <a-space style="width:100%; display:flex; justify-content:flex-end">
          <a-button size="large" @click="onCancelAddFamily">取消</a-button>
          <a-button size="large" type="primary" @click="onConfirmAddFamily">保存并选择</a-button>
        </a-space>
      </template>
    </a-modal>

    <div class="confirm-actions">
      <a-button size="large" @click="back">取消</a-button>
      <a-button size="large" type="primary" :disabled="!canConfirm" @click="submit">确认并支付</a-button>
    </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, watch } from 'vue';
import { fetchDoctorById } from '@/api/mock/doctors';
import { createAppointment } from '@/api/mock/appointments';
import { fetchPatients } from '@/api/mock/patients';
import { initiatePayment } from '@/api/mock/payments';
import { useRouter, useRoute } from 'vue-router';

const route = useRoute();
const router = useRouter();
const doctor = ref<any | null>(null);
const patients = ref<any[]>([]);
const patientId = ref('');
const complaint = ref('');
const date = ref(route.query.date as string || route.query.defaultDate as string || '');
const time = ref(route.query.time as string || '');
const slotType = ref((route.query.slotType as string) || 'normal');
const paymentMethod = ref<'wechat'|'alipay'|'ehealth'>('wechat');

const showAddFamily = ref(false);
const newMember = ref({ name: '', phone: '', relation: '' });

const slotLabel = computed(() => {
  switch ((slotType.value || 'normal')) {
    case 'expert': return '专家号';
    case 'special': return '特需号';
    default: return '普通号';
  }
});

// 简单的费用计算：不同号种或医生等级可能不同，这里用 mock 逻辑
const feeAmount = computed(() => {
  if (slotType.value === 'expert') return 200;
  if (slotType.value === 'special') return 500;
  return 20; // 普通号
});

const canConfirm = computed(() => {
  // 需要选择具体就诊人
  return Boolean(patientId.value);
});

// 如果没有选择就诊人但患者列表只有一个，可自动选中
watch(patients, (v) => {
  if (!patientId.value && v?.length === 1) patientId.value = v[0].id;
});

async function load() {
  const doctorId = (route.query.doctorId || route.params.doctorId) as string | undefined;
  if (doctorId) doctor.value = await fetchDoctorById(doctorId);
  patients.value = await fetchPatients();
}

function back() { router.back(); }

function onCancelAddFamily() {
  showAddFamily.value = false;
  newMember.value = { name: '', phone: '', relation: '' };
}

function genMemberId() { return 'p' + Math.random().toString(36).slice(2,8); }

function onConfirmAddFamily() {
  // simple mock: push into patients and select
  const id = genMemberId();
  const nm = { id, name: newMember.value.name || '新成员', phone: newMember.value.phone || '未知', relation: newMember.value.relation || 'other' };
  patients.value.push(nm);
  patientId.value = id;
  showAddFamily.value = false;
  newMember.value = { name: '', phone: '', relation: '' };
}

async function submit() {
  if (!canConfirm.value) return;
  const order = await createAppointment({ patientId: patientId.value || patients.value[0]?.id, doctorId: doctor.value?.id, doctorName: doctor.value?.name, date: date.value, time: time.value, slotType: slotType.value as 'normal' | 'expert' | 'special', complaint: complaint.value, hospitalId: route.query.hospitalId as string || 'h1', hospitalName: '示例医院', payment: { method: paymentMethod.value, status: 'pending' } });
  const pay = await initiatePayment(order.orderId, paymentMethod.value);
  if (pay.status === 'success') {
    // mark paid in mock orders (simple approach)
    order.payment.status = 'paid';
    order.status = 'paid';
    router.push({ name: 'AppointmentVoucher', params: { id: order.orderId } }).catch(()=>{});
  } else {
    alert('支付失败（模拟）');
  }
}

onMounted(load);
</script>

<style scoped>
.appointment-confirm{ padding:16px; display:flex; flex-direction:column; gap:16px }
.confirm-header{ display:flex; align-items:center; gap:12px }
.confirm-header h3{ margin:0; font-size:18px }
.confirm-grid{ display:flex; flex-direction:column; gap:16px }
.confirm-grid.horizontal{ flex-direction:row }

.cards-viewport{ max-height: calc(100vh - 200px); overflow:auto; padding-right:8px }
/* light gray scrollbar for viewport */
.cards-viewport::-webkit-scrollbar{ width:10px }
.cards-viewport::-webkit-scrollbar-thumb{ background:#e6e6e6; border-radius:6px }
.cards-viewport::-webkit-scrollbar-track{ background:transparent }
.card{ background:#fff; border-radius:8px; padding:12px; box-shadow:0 1px 6px rgba(0,0,0,0.06); border:1px solid rgba(0,0,0,0.04) }
.card-label{ font-weight:600; margin-bottom:8px }
.doctor-row{ display:flex; gap:12px; align-items:center }
.avatar{ width:56px; height:56px; border-radius:50%; background:linear-gradient(180deg,#e6f4ff,#c6e6ff); color:#0b66b3; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:20px }
.doctor-meta .name{ font-size:16px; font-weight:600 }
.muted{ color:#666; font-size:13px; margin-top:6px }
.slot{ margin-top:8px }
.patient-select-row{ display:flex; align-items:center; gap:12px }

.patient-list{ margin-top:12px; display:flex; flex-direction:column; gap:8px }
.patient-item{ display:flex; align-items:center; gap:10px; padding:8px; border-radius:6px; cursor:pointer; border:1px solid rgba(0,0,0,0.04); background:#fafafa }
.p-avatar{ width:40px; height:40px; border-radius:50%; background:#e6f4ff; color:#0b66b3; display:flex; align-items:center; justify-content:center; font-weight:700 }
.p-meta{ flex:1 }
.p-name{ font-weight:600 }
.p-phone{ margin-left:8px; color:#888; font-weight:400 }
.p-sub{ font-size:12px; color:#888 }
.p-action{ color:#1a72d6; font-weight:600 }
.complaint-block{ margin-top:12px }
.label-row{ display:flex; justify-content:space-between; align-items:center }
.char-count{ font-size:12px; color:#888 }
a-textarea{ width:100%; min-height:88px; max-height:220px; resize:vertical }
/* ensure textarea resize handle visible and limited */
a-textarea textarea{ min-height:88px; max-height:220px }
.fee-row{ display:flex; gap:12px; align-items:flex-start }
.fee-amount{ flex:0 0 140px; color:#333 }
.fee-amount .amount{ font-size:20px; font-weight:700; margin-top:6px }
.payment-method{ flex:1 }
.confirm-actions{ display:flex; justify-content:flex-end; gap:12px; padding-top:8px }

/* keep vertical layout by default; provide horizontal when explicitly needed */
@media (max-width: 1000px){
  .confirm-grid{ flex-direction:column }
}
</style>
