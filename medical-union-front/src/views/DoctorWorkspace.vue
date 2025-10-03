<template>
  <div class="doctor-workspace mu-app-shell">
    <a-layout>
      <!-- 侧边栏 -->
      <a-layout-sider 
        :width="280" 
        :collapsed-width="95"
        :collapsed="collapsed" 
        :collapsible="true"
        :class="['mu-layout-sider', 'doctor-sider', { 'without-transition': !enableSiderTransition }]"
        @collapse="handleSiderCollapse"
      >
        <div class="logo">
          <IconHeart class="logo-icon" />
          <span v-if="!collapsed" class="logo-text">医联体系统</span>
        </div>
        <!-- 医院信息卡：在 logo 下方展示当前医院简要信息 -->
        <div class="hospital-card" :title="hospitalInfo?.hospitalName">
          <div class="hospital-left">
            <IconHome />
          </div>
          <div class="hospital-body" v-if="!collapsed">
            <div class="hospital-name">{{ hospitalInfo?.hospitalName || '示例医院' }}</div>
            <!-- <div class="hospital-stats">今日患者: {{ hospitalInfo?.todayPatients ?? 0 }}</div> -->
          </div>
        </div>
        
        <a-menu 
          :selected-keys="selectedKeys"
          :collapsed="collapsed"
          :style="{ height: 'calc(100vh - 128px)', borderRight: 0 }"
          mode="inline"
          theme="light"
          class="mu-menu"
        >
          <a-menu-item
            v-for="item in menuItems"
            :key="item.key"
            @click="handleMenuClick(item)"
          >
            <component :is="item.icon" class="menu-icon" />
            <span>{{ item.label }}</span>
          </a-menu-item>
        </a-menu>
      </a-layout-sider>
      
      <!-- 主要内容区域 -->
      <a-layout>
        <!-- 顶部导航 -->
        <a-layout-header class="mu-layout-header doctor-header">
          <div class="header-left">
            <a-button 
              type="text" 
              @click="toggleCollapse"
              class="collapse-btn"
            >
              <IconMenuUnfold v-if="collapsed" />
              <IconMenuFold v-else />
            </a-button>
          </div>
          
          <div class="header-right">
            <div class="role-switch">
              <span class="role-label">{{ roleLabel }}</span>
            </div>
            <a-dropdown>
              <a-button type="text" class="user-info">
                <IconUser />
                <span class="username">{{ userInfo?.username || '医生' }}</span>
                <IconDown />
              </a-button>
              <template #content>
                <a-doption @click="handleProfile">
                  <IconUser />
                  个人信息
                </a-doption>
                <a-doption @click="handleSettings">
                  <IconSettings />
                  设置
                </a-doption>
                <a-doption @click="handleLogout">
                  <IconPoweroff />
                  退出登录
                </a-doption>
              </template>
            </a-dropdown>
          </div>
        </a-layout-header>
        
        <!-- 内容区域 -->
        <a-layout-content class="mu-layout-content doctor-content">
          <router-view />
        </a-layout-content>
      </a-layout>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, type Component } from 'vue';
import { mockDoctorDashboard } from '@/utils/mockData';
import { useRouter, useRoute, type RouteLocationRaw } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import {
  IconHeart,
  IconHome,
  IconUser,
  IconSwap,
  IconBarChart,
  IconBook,
  IconMenuFold,
  IconMenuUnfold,
  IconDown,
  IconSettings,
  IconPoweroff
 } from '@arco-design/web-vue/es/icon';
import { useDoctorRole, resetDoctorRole } from '@/utils/doctorRole';
import { useCurrentUser, clearCurrentUser } from '@/composables/useCurrentUser';

type MenuItem = {
  key: string;
  label: string;
  icon: Component;
  to: RouteLocationRaw;
};

const router = useRouter();
const route = useRoute();
const collapsed = ref(false);
const enableSiderTransition = ref(false);
let collapseTimer: number | undefined;
const COLLAPSE_KEY = 'doctor_workspace_sider_collapsed';
const { role: doctorRole, isCommunityDoctor } = useDoctorRole();
const { currentUser, isDoctor } = useCurrentUser();

const roleLabel = computed(() =>
  doctorRole.value === 'community' ? '社区医生视角' : '医院医生视角'
);

const communityHospitalInfo = {
  hospitalName: '吉大二院',
  todayPatients: 18
};

// 从 mockData 获取医院信息（临时）
const hospitalInfo = computed(() => {
  if (isCommunityDoctor.value) {
    return communityHospitalInfo;
  }
  try {
    // mockDoctorDashboard 包含 doctorInfo.hospital 以及一些统计
    const doc = mockDoctorDashboard?.doctorInfo || null;
    return {
      hospitalName: doc?.hospital || '示例医院',
      todayPatients: mockDoctorDashboard?.todayStatistics?.newPatients ?? 0
    };
  } catch (e) {
    return { hospitalName: '示例医院', todayPatients: 0 };
  }
});

// 获取用户信息
const userInfo = computed(() => currentUser.value?.raw ?? null);

const menuItems: MenuItem[] = [
  { key: 'dashboard', label: '工作台首页', icon: IconHome, to: { name: 'DoctorDashboard' } },
  { key: 'patients', label: '患者管理', icon: IconUser, to: { name: 'PatientManagement' } },
  { key: 'referrals', label: '转诊管理', icon: IconSwap, to: { name: 'ReferralManagement' } },
  { key: 'telemedicine', label: '远程医疗', icon: IconHeart, to: { name: 'DoctorTelemedicine' } },
  { key: 'teaching', label: '远程教学', icon: IconBook, to: { name: 'DoctorTeachingList' } },
  { key: 'statistics', label: '数据统计', icon: IconBarChart, to: { name: 'DoctorStatistics' } }
];

const routeKeyMap: Record<string, string> = {
  DoctorDashboard: 'dashboard',
  PatientManagement: 'patients',
  ReferralManagement: 'referrals',
  DoctorTelemedicine: 'telemedicine',
  DoctorTeachingList: 'teaching',
  DoctorTeachingCreate: 'teaching',
  DoctorTeachingDetail: 'teaching',
  DoctorStatistics: 'statistics'
};

const selectedKeys = computed(() => {
  const name = route.name as string | undefined;
  if (name && routeKeyMap[name]) {
    return [routeKeyMap[name]];
  }
  const path = route.path;
  if (path.startsWith('/doctor/patients')) return ['patients'];
  if (path.startsWith('/doctor/referrals')) return ['referrals'];
  if (path.startsWith('/doctor/telemedicine')) return ['telemedicine'];
  if (path.startsWith('/doctor/teaching')) return ['teaching'];
  if (path.startsWith('/doctor/statistics')) return ['statistics'];
  return ['dashboard'];
});

function handleMenuClick(item: MenuItem) {
  if (!item) return;
  router.push(item.to);
}

function applyCollapse(value: boolean, withTransition = true) {
  if (collapseTimer) {
    window.clearTimeout(collapseTimer);
    collapseTimer = undefined;
  }

  if (withTransition) {
    enableSiderTransition.value = true;
  } else {
    enableSiderTransition.value = false;
  }

  collapsed.value = value;

  try {
    localStorage.setItem(COLLAPSE_KEY, value ? '1' : '0');
  } catch {}

  if (withTransition) {
    collapseTimer = window.setTimeout(() => {
      enableSiderTransition.value = false;
      collapseTimer = undefined;
    }, 360);
  }
}

function toggleCollapse() {
  applyCollapse(!collapsed.value, true);
}

function handleSiderCollapse(value: boolean) {
  if (value === collapsed.value) return;
  applyCollapse(value, true);
}
// 处理退出登录
const handleLogout = () => {
  localStorage.removeItem('medical_union_token');
  clearCurrentUser();
  resetDoctorRole();
  Message.success('已退出登录');
  router.push('/login');
};

// 占位：个人信息与设置（后续可替换为真实行为）
const handleProfile = () => {
  Message.info('个人信息功能将在后续发布');
};

const handleSettings = () => {
  Message.info('设置功能将在后续发布');
};

watch(
  () => doctorRole.value,
  (value) => {
    if (value === 'community' && route.path === '/doctor') {
      router.push('/doctor/referrals');
    }
  }
);

onMounted(() => {
  try {
    const saved = localStorage.getItem(COLLAPSE_KEY);
    if (saved !== null) {
      applyCollapse(saved === '1', false);
    }
  } catch {}

  // 检查用户权限
  if (!isDoctor.value) {
    Message.error('权限不足');
    router.push('/login');
  }
});

onBeforeUnmount(() => {
  if (collapseTimer) {
    window.clearTimeout(collapseTimer);
  }
});
</script>

<style lang="less" scoped>
.doctor-workspace {
  .doctor-sider {
    position: relative;

    .hospital-card {
      display: flex;
      align-items: center;
      padding: 12px 20px;
      gap: 12px;
      border-bottom: 1px solid #f3f4f6;
      background: #ffffff;
      transition: all 0.2s ease;

      .hospital-left {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: #f3f4f6;
        color: #10b981;
        flex-shrink: 0;
        font-size: 18px;
      }

      .hospital-body {
        display: flex;
        flex-direction: column;
        gap: 4px;
        line-height: 1.1;

        .hospital-name {
          font-size: 14px;
          color: #111827;
          font-weight: 600;
        }

        .hospital-stats {
          font-size: 12px;
          color: #6b7280;
        }
      }
    }

    &.arco-layout-sider-collapsed {
      .hospital-card {
        padding: 12px 0;
        justify-content: center;

        .hospital-left {
          width: 48px;
          height: 48px;
        }

        .hospital-body {
          display: none;
        }
      }
    }
  }

  .doctor-header {
    .header-right {
      display: flex;
      align-items: center;
      gap: 16px;

      .role-switch {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 4px;

        .role-label {
          font-size: 12px;
          color: #6b7280;
        }
      }
    }
  }

  .doctor-content {
    overflow-y: auto;
  }
}

@media (max-width: @screen-md) {
  .doctor-workspace {
    .doctor-content {
      overflow-y: auto;
    }

    .doctor-sider {
      .hospital-card {
        padding: 10px 16px;
      }
    }
  }
}
</style>