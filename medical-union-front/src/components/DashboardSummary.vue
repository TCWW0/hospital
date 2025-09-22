<template>
  <div class="dashboard-summary">
    <div class="cards">
      <div class="card" v-for="(value, key) in displayMap" :key="key">
        <div class="label">{{ value.label }}</div>
        <div class="value">{{ summary[key] ?? 0 }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps } from 'vue';

const props = defineProps<{ summary: Record<string, number> }>();

const summary = props.summary || {};

const displayMap: Record<string, { label: string }> = {
  totalPatients: { label: '患者总数' },
  highTriage: { label: '高危患者' },
  mediumTriage: { label: '中等危' },
  lowTriage: { label: '低危' },
  ongoing: { label: '进行中' },
  completed: { label: '已完成' },
};
</script>

<style scoped lang="less">
.dashboard-summary { padding: 12px; }
.cards { display:flex; gap:12px; flex-wrap:wrap }
.card { background:#fff; padding:12px 16px; border-radius:8px; box-shadow:0 2px 8px rgba(16,24,40,0.04); min-width:120px }
.label { color:#6b7280; font-size:12px }
.value { font-weight:700; font-size:20px; margin-top:6px }
</style>
