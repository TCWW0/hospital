<template>
  <div class="doctor-detail">
    <div style="display:flex;align-items:center;gap:12px;">
      <a-button type="text" size="large" @click="back">← 返回</a-button>
      <div style="flex:1"></div>
    </div>
    <div class="card doctor-detail-card" style="margin-top:8px; padding:18px; background:#fff; border-radius:12px;">
        <div style="display:flex; gap:18px; align-items:flex-start">
          <div class="avatar-placeholder" style="width:96px;height:96px;border-radius:50%;background:linear-gradient(135deg,#e6f0ff,#f7fbff);display:flex;align-items:center;justify-content:center;font-weight:800;color:#0b5fff;border:4px solid rgba(11,95,255,0.06)">
            <template v-if="doctor?.avatar">
              <img :src="doctor.avatar" alt="avatar" style="width:88px;height:88px;border-radius:50%;object-fit:cover" />
            </template>
            <template v-else>
              <div style="font-size:28px">{{ (doctor?.name||'').slice(0,1) }}</div>
            </template>
          </div>
          <div style="flex:1;display:flex;flex-direction:column;gap:8px">
            <div style="display:flex;align-items:center;justify-content:space-between">
              <div>
                <div style="font-size:20px; color:#0b5fff; font-weight:800">{{ doctor?.name }} <span style="font-size:14px; color:#6b7280; margin-left:8px">{{ doctor?.title }}</span></div>
                <div style="margin-top:6px">{{ doctor?.intro }}</div>
                <div style="margin-top:6px; color:#667085">擅长：{{ (doctor?.specialties||[]).join(', ') }}</div>
              </div>
              <div style="text-align:right">
                <div style="color:#6b7280;font-size:13px">评分</div>
                <a-tag type="success" style="margin-top:6px">{{ doctor?.rating ?? '—' }}</a-tag>
              </div>
            </div>
            <div style="margin-top:12px;display:flex;gap:12px;align-items:center;color:#475569">
              <div style="display:flex;flex-direction:column">
                <div style="font-weight:700;color:#0b5fff">联系</div>
                <div style="margin-top:4px;color:#64748b">电话：010-xxxx-xxxx</div>
              </div>
              <div style="display:flex;flex-direction:column">
                <div style="font-weight:700;color:#0b5fff">科室</div>
                <div style="margin-top:4px;color:#64748b">内科 · 心血管</div>
              </div>
            </div>
          </div>
        </div>

      <div style="margin-top:16px">
        <h4>履历与经历</h4>
        <ul>
          <li v-for="(it,idx) in history" :key="idx">{{ it }}</li>
        </ul>
      </div>

      <div style="margin-top:12px; display:flex; gap:8px; justify-content:flex-end">
        <a-button size="large" @click="openSchedule(doctor?.id)">查看排班</a-button>
        <a-button size="large" type="primary" @click="startBooking(doctor?.id)">预约</a-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { fetchDoctorById } from '@/api/mock/doctors';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const doctor = ref<any | null>(null);
const history = ref<string[]>([]);

async function load() {
  const id = route.params.id as string;
  if (!id) return;
  doctor.value = await fetchDoctorById(id);
  // mock history
  history.value = [
    '毕业于示例医学院',
    '从事临床工作20年',
    '发表学术论文 15 篇',
    '擅长心血管疾病诊治'
  ];
}

function back() { router.back(); }
function openSchedule(id?: string) { if (id) router.push({ name: 'DoctorSchedule', params: { id } }).catch(()=>{}); }
function startBooking(id?: string) { if (id) router.push({ name: 'DoctorSchedule', params: { id } }).catch(()=>{}); }

onMounted(load);
</script>

<style scoped>
.doctor-detail{display:flex;flex-direction:column;gap:12px}
</style>
