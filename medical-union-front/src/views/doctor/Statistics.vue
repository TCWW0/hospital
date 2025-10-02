<template>
  <div class="doctor-statistics">
    <div class="page-header">
      <div class="title-group">
        <h1>数据统计</h1>
        <p class="muted">快速浏览今日门诊、远程医疗以及患者满意度等关键指标。</p>
      </div>
      <a-space :size="12">
        <a-date-picker v-model:value="filters.date" type="date" placeholder="选择日期" allow-clear />
        <a-select v-model:value="filters.range" style="width: 140px">
          <a-option value="today">今日</a-option>
          <a-option value="week">近 7 天</a-option>
          <a-option value="month">本月</a-option>
        </a-select>
      </a-space>
    </div>

    <a-scrollbar class="stats-scroll">
      <div class="stats-stack">
        <a-card class="stats-card" title="门诊与会诊概览" size="large">
          <div class="card-metrics">
            <div class="metric" v-for="metric in overviewMetrics" :key="metric.key">
              <div class="metric-value">{{ metric.value }}</div>
              <div class="metric-label">{{ metric.label }}</div>
              <a-tag :color="metric.trend === 'up' ? 'green' : metric.trend === 'down' ? 'red' : 'arcoblue'" size="small">
                {{ metric.delta }}
              </a-tag>
            </div>
          </div>
        </a-card>

        <a-card class="stats-card" title="远程医疗服务" size="large">
          <div class="list-metrics">
            <div class="list-row" v-for="item in telemedicineMetrics" :key="item.key">
              <div class="row-left">
                <div class="row-title">{{ item.title }}</div>
                <div class="row-sub">{{ item.subtitle }}</div>
              </div>
              <div class="row-right">
                <div class="row-value">{{ item.value }}</div>
                <div class="row-trend" :class="`trend-${item.trend}`">{{ item.trendLabel }}</div>
              </div>
            </div>
          </div>
        </a-card>

        <a-card class="stats-card" title="患者满意度" size="large">
          <div class="satisfaction">
            <div class="satisfaction-score">
              <div class="score-value">{{ satisfaction.score }}%</div>
              <div class="score-label">综合满意度</div>
              <a-tag color="arcoblue" size="small">较昨日 {{ satisfaction.delta }}</a-tag>
            </div>
            <div class="satisfaction-breakdown">
              <div class="breakdown-item" v-for="(item, index) in satisfactionBreakdown" :key="index">
                <div class="breakdown-label">{{ item.label }}</div>
                <a-progress type="circle" :percent="item.percent" :width="64" :stroke-width="8" status="normal" />
              </div>
            </div>
          </div>
        </a-card>

        <a-card class="stats-card" title="工作提醒" size="large">
          <a-empty v-if="tasks.length === 0" description="暂无待办，敬请期待更多数据接入。" />
          <a-timeline v-else mode="alternate">
            <a-timeline-item v-for="task in tasks" :key="task.id" :label="task.time" :dot-color="task.type === 'warning' ? '#f97316' : '#22c55e'">
              <div class="timeline-title">{{ task.title }}</div>
              <div class="timeline-desc">{{ task.desc }}</div>
            </a-timeline-item>
          </a-timeline>
        </a-card>
      </div>
    </a-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';

type Trend = 'up' | 'down' | 'flat';

const filters = reactive({
  date: '',
  range: 'today'
});

const overviewMetrics = [
  { key: 'outpatient', label: '今日门诊量', value: 68, trend: 'up' as Trend, delta: '+12.5%' },
  { key: 'followup', label: '随访待办', value: 14, trend: 'flat' as Trend, delta: '持平' },
  { key: 'telemedicine', label: '远程会诊', value: 6, trend: 'down' as Trend, delta: '-14.2%' }
];

const telemedicineMetrics = [
  {
    key: 'created',
    title: '新建申请',
    subtitle: '需要确认资料完整性并安排专家排期',
    value: 3,
    trend: 'up' as Trend,
    trendLabel: '较昨日 +1'
  },
  {
    key: 'scheduled',
    title: '今日排期',
    subtitle: '请提前 30 分钟检查设备和网络，提醒患者准时上线',
    value: 4,
    trend: 'flat' as Trend,
    trendLabel: '较昨日 持平'
  },
  {
    key: 'completed',
    title: '完成会诊',
    subtitle: '会诊总结已同步至患者档案',
    value: 5,
    trend: 'down' as Trend,
    trendLabel: '较昨日 -2'
  }
];

const satisfaction = {
  score: 92,
  delta: '+3.1%'
};

const satisfactionBreakdown = [
  { label: '诊疗质量', percent: 94 },
  { label: '沟通体验', percent: 90 },
  { label: '平台体验', percent: 88 }
];

const tasks = [
  {
    id: 'task-1',
    title: '下午 14:00 远程超声会诊设备联测',
    desc: '请与设备工程师确认图像传输质量，确保正式会诊稳定。',
    time: '13:30',
    type: 'warning' as const
  },
  {
    id: 'task-2',
    title: '患者随访回访录入',
    desc: '完成 3 位慢病患者的随访记录，更新指标跟踪。',
    time: '16:00',
    type: 'success' as const
  }
];
</script>

<style lang="less" scoped>
.doctor-statistics {
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}

.title-group h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
}

.muted {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 13px;
}

.stats-scroll {
  flex: 1;
  min-height: 0;
}

.stats-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-right: 12px;
  margin-right: -12px;
}

.stats-card {
  border-radius: 12px;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
}

.card-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.metric {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 0;
}

.metric-value {
  font-size: 32px;
  font-weight: 700;
  color: #1d4ed8;
}

.metric-label {
  font-size: 14px;
  color: #475569;
}

.list-metrics {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.list-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(148, 163, 184, 0.12);
  border-radius: 12px;
  gap: 12px;
}

.row-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.row-title {
  font-weight: 600;
  color: #0f172a;
}

.row-sub {
  font-size: 13px;
  color: #64748b;
}

.row-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.row-value {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}

.row-trend {
  font-size: 13px;
  font-weight: 500;
}

.trend-up {
  color: #16a34a;
}

.trend-down {
  color: #dc2626;
}

.trend-flat {
  color: #1d4ed8;
}

.satisfaction {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  align-items: center;
}

.satisfaction-score {
  min-width: 180px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.score-value {
  font-size: 42px;
  font-weight: 700;
  color: #f97316;
}

.score-label {
  font-size: 14px;
  color: #1f2937;
}

.satisfaction-breakdown {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.breakdown-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.breakdown-label {
  font-size: 13px;
  color: #475569;
}

.timeline-title {
  font-weight: 600;
  color: #0f172a;
}

.timeline-desc {
  font-size: 13px;
  color: #475569;
}

@media (max-width: 768px) {
  .doctor-statistics {
    padding: 16px;
  }

  .stats-stack {
    padding-right: 0;
    margin-right: 0;
  }

  .stats-card {
    box-shadow: none;
    border: 1px solid rgba(148, 163, 184, 0.2);
  }

  .metric-value {
    font-size: 26px;
  }

  .row-value {
    font-size: 20px;
  }
}
</style>