<template>
  <div class="patient-detail">
    <div class="detail-header">
      <div class="title">患者详情</div>
      <div class="actions">
        <a-button type="text" size="small">编辑</a-button>
        <a-button type="primary" size="small">新建随访</a-button>
      </div>
    </div>

    <section class="basic-block">
      <div class="two-cols">
        <div>
          <div class="label">姓名</div>
          <div class="value">{{ detail.name }}</div>

          <div class="label">年龄</div>
          <div class="value">{{ detail.age }} 岁</div>

          <div class="label">电话</div>
          <div class="value">{{ detail.phone || '—' }}</div>
        </div>

        <div>
          <div class="label">当前医院</div>
          <div class="value">{{ detail.hospital?.name || '示例医院' }}</div>

          <div class="label">科室</div>
          <div class="value">{{ detail.hospital?.department || '内科' }}</div>

          <div class="label">状态</div>
          <div class="value">{{ detail.status }}</div>
        </div>
      </div>
    </section>

    <section class="visits-block">
      <div class="section-title">最近就诊</div>
      <a-list :data="visits" item-layout="horizontal">
        <template #renderItem="{ item }">
          <a-list-item>
            <a-list-item-meta :title="item.visitDate + ' · ' + item.type" :description="item.diagnosis" />
          </a-list-item>
        </template>
      </a-list>
    </section>

    <!-- 预留医嘱和图片上传区域 -->
    <section class="prescription-block">
      <div class="section-title">当前医嘱</div>
      <div class="placeholder">暂无医嘱</div>
    </section>

    <section class="images-block">
      <div class="section-title">相关图片</div>
      <div class="placeholder">暂无图片 <a-button type="text" size="small">上传</a-button></div>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { fetchPatientById } from '@/api/mock/patients';

const props = defineProps<{ id: string }>();
const detail = ref<any>({});
const visits = ref<any[]>([]);

async function load() {
  const data = await fetchPatientById(props.id);
  if (data) {
    detail.value = data;
    // mock visits
    visits.value = [
      { id: 'v1', visitDate: '2025-09-18', type: '门诊', diagnosis: '高血压' },
      { id: 'v2', visitDate: '2025-06-01', type: '住院', diagnosis: '肺炎' },
      { id: 'v3', visitDate: '2024-12-10', type: '门诊', diagnosis: '糖尿病随访' }
    ];
  } else {
    detail.value = { name: '未知患者', status: 'unregistered' };
  }
}

onMounted(load);
</script>

<style scoped lang="less">
.patient-detail { padding: 8px; }
.detail-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
.detail-header .title { font-weight:700; font-size:16px; }
.basic-block { background:#fff; padding:12px; border-radius:8px; margin-bottom:10px; border:1px solid #eef2f6; }
.two-cols { display:flex; gap:16px; }
.label { color:#6b7280; font-size:12px; margin-top:8px; }
.value { font-weight:600; color:#111827; margin-bottom:6px; }
.visits-block, .referral-block, .prescription-block, .images-block { background:#fff; padding:12px; border-radius:8px; margin-bottom:10px; border:1px solid #eef2f6; }
.section-title { font-weight:600; margin-bottom:8px; }
.placeholder { color:#6b7280; font-size:14px; }
</style>