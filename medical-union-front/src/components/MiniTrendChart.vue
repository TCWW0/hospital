<template>
  <div style="position:relative">
    <svg v-if="hasData" :width="width" :height="height" viewBox="0 0 300 80" @mousemove="onMouseMove" @mouseleave="onMouseLeave">
      <polyline :points="points" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
      <polyline :points="areaPoints" fill="rgba(59,130,246,0.08)" stroke="none" />
      <rect x="10" y="10" :width="width-20" :height="height-20" fill="transparent" />
      <circle v-if="hoverPoint" :cx="hoverPoint.x" :cy="hoverPoint.y" r="3" fill="#3b82f6" />
    </svg>
    <div v-else style="height:80px; display:flex; align-items:center; justify-content:center; color:#9ca3af">无数据</div>

    <div v-if="tooltip.visible" :style="tooltipStyle" class="trend-tooltip">{{ tooltip.text }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue';
const props = defineProps<{ data: { date: string; count: number }[]; width?: number; height?: number }>();
const width = props.width || 300;
const height = props.height || 80;
const data = props.data || [];

const hasData = computed(() => data.length > 0 && data.some(d => d.count > 0));

const points = computed(() => {
  if (!data.length) return '';
  const max = Math.max(...data.map(d => d.count), 1);
  return data.map((d, i) => {
    const x = Math.round((i / (data.length - 1)) * (width - 20)) + 10;
    const y = Math.round(height - 10 - (d.count / max) * (height - 20));
    return `${x},${y}`;
  }).join(' ');
});

const areaPoints = computed(() => {
  if (!data.length) return '';
  const pts = points.value.split(' ');
  return `10,${height-10} ${pts.join(' ')} ${width-10},${height-10}`;
});

// hover state
import { ref } from 'vue';
const hoverPoint = ref<{ x:number; y:number } | null>(null);
const tooltip = ref<{ visible: boolean; text: string; x: number; y: number }>({ visible: false, text: '', x: 0, y: 0 });

function onMouseMove(e: MouseEvent) {
  if (!data.length) return;
  const rect = (e.target as SVGElement).getBoundingClientRect();
  const offsetX = e.clientX - rect.left - 10; // relative to inner chart
  const idx = Math.round((offsetX / (width - 20)) * (data.length - 1));
  const clamped = Math.max(0, Math.min(data.length - 1, idx));
  const item = data[clamped];
  if (!item) return;
  const point = computePoint(clamped);
  hoverPoint.value = { x: point.x, y: point.y };
  tooltip.value = { visible: true, text: `${item.date}: ${item.count}`, x: point.x + 12, y: point.y - 8 };
}

function onMouseLeave() {
  hoverPoint.value = null;
  tooltip.value.visible = false;
}

function computePoint(i: number) {
  const max = Math.max(...data.map(d => d.count), 1);
  const x = Math.round((i / (data.length - 1)) * (width - 20)) + 10;
  const item = data[i] || { count: 0 };
  const y = Math.round(height - 10 - (item.count / max) * (height - 20));
  return { x, y };
}
const tooltipStyle = computed(() => {
  // return inline CSS string to avoid strict style typing issues
  const left = tooltip.value.x || 0;
  const top = tooltip.value.y || 0;
  return `position:absolute; left:${left}px; top:${top}px; background:#0f172a; color:#fff; padding:6px 8px; border-radius:6px; font-size:12px; transform:translate(-50%,-100%); pointer-events:none;`;
});
</script>

<style scoped>
svg { display:block }
</style>
