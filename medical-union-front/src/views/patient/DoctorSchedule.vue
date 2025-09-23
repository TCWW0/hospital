<template>
  <div class="doctor-schedule" style="display:flex;flex-direction:column;height:100vh;padding:16px;box-sizing:border-box">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
      <a-button type="text" size="large" @click="back">← 返回</a-button>
      <h3 style="margin:0">{{ doctor?.name }} 的排班</h3>
    </div>

  <!-- 将时段列表放入滚动容器，保留上方标题不滚动 -->
  <div class="schedules-viewport" style="flex:1 1 auto;">
      <div v-for="day in schedules" :key="day.date" style="margin-bottom:12px">
        <div style="font-weight:600">{{ day.date }}</div>
        <a-space>
          <a-card v-for="s in day.slots" :key="s.time" style="width:220px">
            <div style="display:flex; justify-content:space-between; align-items:center">
              <div>{{ s.time }}</div>
              <div class="tag">{{ s.type === 'normal' ? '普通号' : s.type === 'expert' ? '专家号' : '特需号' }}</div>
            </div>
            <div style="margin-top:8px">余票: <strong>{{ s.available }}</strong></div>
            <div style="margin-top:8px; text-align:right">
              <a-button :disabled="s.available<=0" type="primary" size="small" @click="reserve(day.date, s.time, s.type)">预约</a-button>
            </div>
          </a-card>
        </a-space>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { fetchDoctorById } from '@/api/mock/doctors';
import { fetchSchedules, reserveSlot } from '@/api/mock/schedules';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const doctor = ref<any | null>(null);
const schedules = ref<any[]>([]);

async function load() {
  const id = route.params.id as string;
  if (!id) return;
  doctor.value = await fetchDoctorById(id);
  const res = await fetchSchedules(id);
  schedules.value = res.schedules;
}

function back() { router.back(); }

async function reserve(date: string, time: string, slotType: 'normal'|'expert'|'special') {
  const ok = await reserveSlot(route.params.id as string, date, time);
  if (ok.success) {
    // go to confirm page with prefilled doctor/date/time/slotType
  router.push({ name: 'AppointmentConfirm', query: { doctorId: String(route.params.id), date, time, slotType } }).catch(()=>{});
  } else {
    alert(ok.message || '预约失败');
  }
}

onMounted(load);
</script>

<style scoped>
.schedules-viewport{
  /* 占满剩余高度（父容器为 100vh 的 column flex） */
  min-height:200px;
  max-height:calc(100vh - 140px);
  overflow:auto;
  padding-right:8px; /* 保留滚动条间隙，避免内容抖动 */
}

/* 浅灰色滚动条，hover 时稍微加深 */
.schedules-viewport::-webkit-scrollbar{width:10px;height:10px}
.schedules-viewport::-webkit-scrollbar-track{background:transparent}
.schedules-viewport::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:8px}
.schedules-viewport:hover::-webkit-scrollbar-thumb{background:#cbd5e1}
.schedules-viewport{ scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent }

.tag{background:#eef6ff;color:#0b5fff;padding:6px 10px;border-radius:8px;font-size:13px}
</style>

*** End Patch
