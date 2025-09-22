<template>
  <div class="patient-visits">
    <a-card>
      <template #header>
        <div class="card-title">就诊记录</div>
      </template>

      <a-list :data="visits" item-layout="horizontal">
        <template #renderItem="{ item }">
          <a-list-item>
            <a-list-item-meta :title="item.hospitalName + ' - ' + item.doctorName" :description="item.visitDate + ' · ' + item.diagnosis" />
          </a-list-item>
        </template>
      </a-list>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { mockPatientDashboard } from '@/utils/mockData';

const visits = mockPatientDashboard.recentVisits || [];
</script>

<style lang="less" scoped>
.patient-visits { padding: 12px 0; }
</style>