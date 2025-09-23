<template>
  <div class="patient-dashboard">
    <div class="grid">
      <div class="col left-col">
        <a-card class="profile-card">
          <div class="profile-top">
            <div class="avatar">{{ info.patientInfo.name.slice(0,1) }}</div>
            <div class="meta">
              <div class="name">{{ info.patientInfo.name }}</div>
              <div class="sub">{{ info.patientInfo.gender }} · {{ info.patientInfo.birthDate }}</div>
              <div class="hospital">{{ info.patientInfo.currentHospital }}</div>
            </div>
          </div>

          <div class="profile-body">
            <div class="row"><span>最近病史</span><strong>{{ info.patientInfo.severityLevel || '轻症' }}</strong></div>
            <div class="row"><span>下次预约</span><strong>{{ info.medicalSummary.nextAppointment || '无' }}</strong></div>
            <div class="row"><span>联系电话</span><strong>{{ info.patientInfo.phone || '-' }}</strong></div>
          </div>
        </a-card>
      </div>

      <div class="col right-col">
        <a-card class="summary-card">
          <div class="card-title">就诊统计</div>
          <div class="key-list">
            <div class="item"><span>总就诊次数</span><strong>{{ info.medicalSummary.totalVisits }}</strong></div>
            <div class="item"><span>总转诊次数</span><strong>{{ info.medicalSummary.totalReferrals }}</strong></div>
            <div class="item"><span>上次就诊</span><strong>{{ info.medicalSummary.lastVisitDate }}</strong></div>
          </div>
        </a-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { mockPatientDashboard } from '@/utils/mockData';

const info = mockPatientDashboard;
</script>

<style scoped lang="less">
.patient-dashboard {
  background: transparent;
  min-height: 100vh;
  padding: 24px;

  .grid { display: flex; gap: 20px; }
  .col { display: flex; flex-direction: column; gap: 16px; }
  .left-col { flex: 0 0 340px; }
  .right-col { flex: 1; }

  .profile-card .profile-top { display:flex; gap:12px; align-items:center; padding-bottom:12px; border-bottom:1px solid #e0f2fe; }
  .avatar { width:64px; height:64px; border-radius:8px; background:#dbeafe; display:flex; align-items:center; justify-content:center; font-size:22px; font-weight:700; color:#1e40af; }
  .meta .name { font-size:18px; font-weight:700; }
  .meta .sub, .meta .hospital { color:#6b7280; font-size:13px; margin-top:6px; }

  .profile-body { padding-top:12px; display:flex; flex-direction:column; gap:8px; }
  .profile-body .row { display:flex; justify-content:space-between; color:#374151; }

  .summary-card .key-list .item { display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px dashed #e0f2fe; }
  .summary-card .key-list .item:last-child { border-bottom: none; }

  .card-title { font-weight:700; color:#1e40af; margin-bottom:8px; }
}
</style>