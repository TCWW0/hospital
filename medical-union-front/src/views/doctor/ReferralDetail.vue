<template>
  <div class="referral-detail">
    <a-button type="text" @click="$router.back()">← 返回</a-button>
    <div v-if="referral" class="card">
      <h3>{{ referral.patientName }}</h3>
      <p>{{ referral.fromHospital }} → {{ referral.toHospital }}</p>
      <p>状态：{{ statusLabel }}</p>
      <p>创建于：{{ referral.createdAt }}</p>
    </div>
    <div v-else>未找到转诊信息</div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { fetchReferralById } from '@/api/mock/referrals';

const route = useRoute();
const id = route.params.id as string | undefined;
const referral = ref<any | null>(null);

onMounted(async () => {
  if (id) referral.value = await fetchReferralById(id);
});

const statusLabel = computed(() => {
  if (!referral.value) return '';
  switch (referral.value.status) {
    case 'pending': return '待处理';
    case 'accepted': return '已接收';
    case 'rejected': return '已拒绝';
    default: return '';
  }
});
</script>

<style scoped>
.referral-detail { padding:20px }
.referral-detail .card { margin-top:12px; padding:14px; background:#fff; border-radius:8px; border:1px solid #eef6ff }
</style>
