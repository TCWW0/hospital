<template>
  <div class="patient-dashboard">
    <div class="content-scroll">
      <div class="grid">
        <div class="col left-col">
          <a-card class="profile-card">
            <div class="profile-top">
              <div class="avatar">{{ initials }}</div>
              <div class="meta">
                <div class="hello">您好，{{ info.patientInfo.name }}！</div>
                <div class="sub">我们会陪伴您保持健康节奏。</div>
                <div class="detail">
                  <span>{{ info.patientInfo.gender }}</span>
                  <span class="dot">·</span>
                  <span>{{ info.patientInfo.birthDate }}</span>
                </div>
                <div class="hospital">当前就诊机构：{{ info.patientInfo.currentHospital }}</div>
              </div>
            </div>

            <div class="profile-body">
              <div class="row"><span>当前关注</span><strong>{{ info.patientInfo.severityLevel || '健康观察中' }}</strong></div>
              <div class="row"><span>下一次就诊安排</span><strong>{{ nextAppointmentDisplay }}</strong></div>
              <div class="row"><span>联系手机</span><strong>{{ info.patientInfo.phone || '-' }}</strong></div>
            </div>

            <div class="profile-note">
              若身体状况有变化，请及时更新资料或联系医护团队，我们会第一时间响应。
            </div>
          </a-card>

          <a-card class="support-card">
            <div class="card-title">安心提醒</div>
            <ul class="tip-list">
              <li v-for="tip in wellbeingTips" :key="tip">{{ tip }}</li>
            </ul>
          </a-card>
        </div>

        <div class="col right-col">
          <a-card class="actions-card">
            <div class="card-title">下一步行动</div>
            <div class="actions-list">
              <div v-for="action in upcomingActions" :key="action.title" class="action-item">
                <div class="action-icon">
                  <component :is="action.icon" />
                </div>
                <div class="action-body">
                  <div class="action-title">{{ action.title }}</div>
                  <div class="action-desc">{{ action.description }}</div>
                </div>
              </div>
            </div>
          </a-card>

          <a-card v-if="recentVisit" class="recent-card">
            <div class="card-title">最近一次就诊</div>
            <div class="recent-main">
              <div class="recent-row">
                <span class="label">就诊时间</span>
                <span class="value">{{ recentVisit.visitDate }}</span>
              </div>
              <div class="recent-row">
                <span class="label">就诊医院</span>
                <span class="value">{{ recentVisit.hospitalName }}</span>
              </div>
              <div class="recent-row">
                <span class="label">医生</span>
                <span class="value">{{ recentVisit.doctorName }}</span>
              </div>
              <div class="recent-row">
                <span class="label">医生备注</span>
                <span class="value">{{ recentVisit.treatment }}</span>
              </div>
            </div>
            <div class="recent-foot">
              若需要帮助准备复诊材料，可在“我的预约”中查看详情或向我们留言。
            </div>
          </a-card>

        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { mockPatientDashboard } from '@/utils/mockData';
import {
  IconCalendarClock,
  IconHeart,
  IconMessage
} from '@arco-design/web-vue/es/icon';

const info = mockPatientDashboard;

const initials = computed(() => info.patientInfo?.name?.slice(0, 1) || '患者');
const nextAppointmentDisplay = computed(() => info.medicalSummary.nextAppointment || '暂无安排');
const recentVisit = computed(() => (info.recentVisits && info.recentVisits.length ? info.recentVisits[0] : null));

const upcomingActions = computed(() => {
  const actions = [] as Array<{ title: string; description: string; icon: any }>;

  if (info.medicalSummary.nextAppointment) {
    actions.push({
      title: '下次预约提醒',
      description: `${info.medicalSummary.nextAppointment} 记得提前 15 分钟到院签到，并带上既往病历。`,
      icon: IconCalendarClock
    });
  } else {
    actions.push({
      title: '暂无预约',
      description: '当前没有新的门诊安排，如需复诊可随时在“我的预约”发起预约。',
      icon: IconCalendarClock
    });
  }

  if (recentVisit.value) {
    actions.push({
      title: '医生建议',
      description: `上次就诊建议：${recentVisit.value.treatment}。如有不适，请及时留言告知。`,
      icon: IconHeart
    });
  }

  actions.push({
    title: '健康档案提醒',
    description: '定期更新过敏史、用药信息等，医护团队才能更及时地照护您。',
    icon: IconMessage
  });

  return actions;
});

const wellbeingTips = [
  '保持规律作息与适度运动，让身体保持活力。',
  '每日饮水 1500-2000 毫升，少盐低油有助于血压稳定。',
  '如有任何不适，随时通过平台留言，我们会尽快回应。',
  '与家人朋友分享心情，可获得更多情绪支持。'
];

</script>

<style scoped lang="less">
.patient-dashboard {
  background: transparent;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 0;
  --card-radius: 20px;
  --card-shadow: 0 24px 55px -32px rgba(15, 62, 165, 0.45), 0 18px 40px -28px rgba(37, 99, 235, 0.28);

  :deep(.arco-card) {
    border: none;
    border-radius: var(--card-radius);
    box-shadow: var(--card-shadow);
    overflow: hidden;
    backdrop-filter: blur(2px);
  }

  :deep(.arco-card-body) {
    padding: 24px 28px;
  }

  .content-scroll {
    flex: 1;
    min-height: 0;
    padding: 24px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    overflow-y: auto;   // ✅ 改成 auto
    scrollbar-width: thin;
    scrollbar-color: rgba(148, 163, 184, 0.45) transparent;

    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(37, 99, 235, 0.28);
      border-radius: 8px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: rgba(29, 78, 216, 0.45);
    }
  }


  .grid {
    display: flex;
    flex: 1;
    min-height: 0;
    flex-wrap: nowrap;
    gap: 20px;
  }

  .col {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-height: 0;
  }

  .left-col {
    flex: 0 0 340px;
  }

  .right-col {
    flex: 1;
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
    overflow-y: auto;
    padding-right: 8px;
    scrollbar-width: thin;
    scrollbar-color: rgba(148, 163, 184, 0.45) transparent;

    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, rgba(96, 165, 250, 0.8), rgba(37, 99, 235, 0.7));
      border-radius: 999px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(180deg, rgba(37, 99, 235, 0.85), rgba(29, 78, 216, 0.85));
    }
  }

  .card-title {
    font-weight: 700;
    color: #1f3c88;
    font-size: 18px;
    margin-bottom: 12px;
  }

  .profile-card {
    position: relative;

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(219, 234, 254, 0.35), rgba(191, 219, 254, 0));
      pointer-events: none;
    }

    :deep(.arco-card-body) {
      position: relative;
      z-index: 1;
    }
    .profile-top {
      display: flex;
      gap: 16px;
      align-items: center;
      padding-bottom: 14px;
      border-bottom: 1px solid #e0f2fe;
    }

    .avatar {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      background: linear-gradient(135deg, #dbeafe, #bfdbfe);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 700;
      color: #1e3a8a;
    }

    .meta {
      .hello {
        font-size: 20px;
        font-weight: 700;
        color: #1f2937;
      }

      .sub {
        margin-top: 4px;
        color: #6b7280;
        font-size: 15px;
      }

      .detail {
        margin-top: 6px;
        color: #6b7280;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .hospital {
        margin-top: 8px;
        font-weight: 600;
        color: #0f3ea5;
        font-size: 14px;
      }
    }

    .profile-body {
      padding-top: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;

      .row {
        display: flex;
        justify-content: space-between;
        color: #374151;
        font-size: 15px;

        strong {
          color: #1f2937;
          font-size: 16px;
        }
      }
    }

    .profile-note {
      margin-top: 14px;
      font-size: 14px;
      line-height: 1.6;
      color: #5b6473;
      background: #f8fbff;
      padding: 12px 14px;
      border-radius: 12px;
    }
  }

  .support-card {
    .tip-list {
      list-style: none;
      margin: 0;
      padding-left: 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
      color: #4b5563;
      font-size: 14px;
      line-height: 1.65;

      li {
        position: relative;
        padding-left: 18px;

        &::before {
          content: '';
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: linear-gradient(135deg, #60a5fa, #2563eb);
          left: 0;
          top: 8px;
        }
      }
    }
  }

  .actions-card {
    .actions-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .action-item {
      display: flex;
      gap: 12px;
      padding: 16px;
      border-radius: 16px;
      background: linear-gradient(135deg, rgba(239, 246, 255, 0.95), rgba(219, 234, 254, 0.65));
      box-shadow: 0 14px 28px -24px rgba(29, 78, 216, 0.3);

      .action-icon {
        width: 42px;
        height: 42px;
        border-radius: 14px;
        background: #eef2ff;
        color: #1d4ed8;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
      }

      .action-body {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .action-title {
          font-weight: 600;
          font-size: 16px;
          color: #1f2937;
        }

        .action-desc {
          color: #6b7280;
          font-size: 14px;
          line-height: 1.7;
        }
      }
    }
  }

  .recent-card {
    .recent-main {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 18px;
      border-radius: 16px;
      background: rgba(248, 250, 252, 0.7);
      border: 1px solid rgba(226, 232, 240, 0.5);
    }

    .recent-row {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      color: #374151;

      .label {
        color: #6b7280;
      }

      .value {
        font-weight: 600;
        color: #1f2937;
        font-size: 16px;
      }
    }

    .recent-foot {
      margin-top: 12px;
      font-size: 14px;
      color: #6b7280;
      line-height: 1.6;
    }
  }

  .resources-card {
    .resource-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .resource-item {
      display: flex;
      gap: 14px;
      padding: 16px;
      border-radius: 16px;
      background: linear-gradient(135deg, rgba(239, 246, 255, 0.85), rgba(221, 242, 254, 0.8));
      box-shadow: 0 14px 34px -26px rgba(14, 116, 144, 0.32);

      .resource-icon {
        width: 42px;
        height: 42px;
        border-radius: 14px;
        background: #eef2ff;
        color: #1d4ed8;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
      }

      .resource-body {
        display: flex;
        flex-direction: column;
        gap: 6px;

        .resource-title {
          font-weight: 600;
          font-size: 16px;
          color: #1f2937;
        }

        .resource-desc {
          color: #6b7280;
          font-size: 14px;
          line-height: 1.65;
        }

        .resource-contact {
          font-size: 14px;
          color: #1e40af;
          font-weight: 600;
        }

        .resource-actions {
          margin-top: 6px;
          display: flex;

          .resource-link {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 8px 16px;
            border-radius: 999px;
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            color: #ffffff;
            font-size: 14px;
            font-weight: 600;
            text-decoration: none;
            box-shadow: 0 8px 20px -12px rgba(59, 130, 246, 0.68);
            transition: transform 0.2s ease, box-shadow 0.2s ease;

            &:hover {
              transform: translateY(-1px);
              box-shadow: 0 16px 32px -20px rgba(37, 99, 235, 0.55);
            }

            :deep(.arco-icon) {
              font-size: 16px;
            }
          }
        }
      }
    }
  }
}

@media (max-width: 992px) {
  .patient-dashboard {
    .content-scroll {
      overflow-y: auto;
      padding: 20px;
    }

    .grid {
      flex-wrap: wrap;
      gap: 16px;
    }

    .left-col {
      flex: 1 1 100%;
    }

    .right-col {
      flex: 1 1 100%;
      max-height: none;
      overflow: visible;
      padding-right: 0;
    }
  }
}

@media (max-width: 640px) {
  .patient-dashboard {
    .content-scroll {
      padding: 16px;
    }

    :deep(.arco-card-body) {
      padding: 20px;
    }

    .profile-card .profile-top {
      flex-direction: column;
      align-items: flex-start;
    }

    .actions-card .action-item {
      align-items: flex-start;
      flex-direction: column;
      gap: 10px;
      width: 100%;
    }

    .resources-card .resource-item {
      flex-direction: column;
      align-items: flex-start;
    }

    .recent-card .recent-row {
      flex-direction: column;
      gap: 4px;
      align-items: flex-start;
    }
  }
}
</style>