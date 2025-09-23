<template>
  <div class="hospital-list">
    <div class="toolbar">
      <a-input v-model:value="q" placeholder="搜索医院/科室" style="width:360px" />
      <a-select v-model:value="region" placeholder="地区" style="width:160px">
        <a-option value="">全部地区</a-option>
        <a-option value="北京市">北京市</a-option>
      </a-select>
      <a-select v-model:value="level" placeholder="医院等级" style="width:160px">
        <a-option value="">全部等级</a-option>
        <a-option value="三级甲等">三级甲等</a-option>
        <a-option value="二级甲等">二级甲等</a-option>
      </a-select>
      <a-space style="margin-left:auto">
        <a-button type="primary" @click="load">搜索</a-button>
      </a-space>
    </div>

    <div class="list">
      <div v-for="h in hospitals" :key="h.id" class="hospital-item">
        <div class="left">
          <h4>{{ h.name }}</h4>
          <div>{{ h.shortIntro }}</div>
          <div>{{ h.address }} · {{ h.phone }}</div>
        </div>
        <div class="right">
          <a-button type="text" @click="openHospital(h.id)">查看详情</a-button>
          <a-button type="primary" @click="gotoSchedule(h.id)">立即挂号</a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { fetchHospitals } from '@/api/mock/hospitals';
import { useRouter } from 'vue-router';

const q = ref('');
const region = ref('');
const level = ref('');
const hospitals = ref<any[]>([]);
const router = useRouter();

async function load() {
  const res = await fetchHospitals({ q: q.value, region: region.value || undefined, level: level.value || undefined });
  hospitals.value = res.items;
}

function openHospital(id: string) { router.push({ name: 'HospitalDetail', params: { id } }).catch(()=>{}); }
function gotoSchedule(id: string) { router.push({ name: 'DoctorList', query: { hospitalId: id } }).catch(()=>{}); }

onMounted(load);
</script>

<style scoped>
.hospital-item { display:flex; justify-content:space-between; padding:12px; border-bottom:1px solid #eee }
.left { max-width:70% }
</style>
