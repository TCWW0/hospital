<template>
  <div class="patient-profile">
    <h2>个人信息</h2>
    <a-form :model="form" label-align="left" label-col="6">
      <a-form-item label="姓名">
        <a-input v-model:value="form.name" placeholder="请输入姓名" />
      </a-form-item>
      <a-form-item label="证件号">
        <a-input v-model:value="form.idNumber" placeholder="例如：身份证号" />
      </a-form-item>
      <a-form-item label="联系电话">
        <a-input v-model:value="form.phone" placeholder="手机号" />
      </a-form-item>
      <a-form-item label="默认就诊人">
        <a-select v-model:value="form.defaultPatient" placeholder="请选择默认就诊人" style="width:240px">
          <a-option v-for="p in patients" :key="p.id" :value="p.id">{{ p.name }} - {{ p.idNumber || p.phone }}</a-option>
        </a-select>
      </a-form-item>
      <a-form-item>
        <a-space>
          <a-button type="primary" @click="save">保存</a-button>
          <a-button @click="reset">重置</a-button>
        </a-space>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fetchPatients } from '@/api/mock/patients';
import { Message } from '@arco-design/web-vue';

const form = ref({ name: '', idNumber: '', phone: '', defaultPatient: '' });
const patients = ref<any[]>([]);

async function loadPatients() {
  patients.value = await fetchPatients();
}

function loadSaved() {
  const v = localStorage.getItem('medical_union_profile');
  if (v) {
    try { Object.assign(form.value, JSON.parse(v)); } catch (e) {}
  }
}

function save() {
  localStorage.setItem('medical_union_profile', JSON.stringify(form.value));
  Message.success('个人信息已保存（本地模拟）');
}

function reset() {
  localStorage.removeItem('medical_union_profile');
  form.value = { name: '', idNumber: '', phone: '', defaultPatient: '' };
  Message.info('已重置');
}

onMounted(() => { loadPatients(); loadSaved(); });
</script>

<style lang="less" scoped>
.patient-profile { padding: 20px; max-width:760px; margin:0 auto }
.patient-profile h2 { margin-bottom:16px }
</style>