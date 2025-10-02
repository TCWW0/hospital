<template>
  <div class="patient-center">
    <a-layout>
      <!-- 侧边栏 -->
            <a-layout-sider 
              :width="280" 
              :collapsed-width="95"
              :collapsed="collapsed" 
              :collapsible="true"
              :class="['layout-sider', { 'without-transition': !enableSiderTransition }]"
            >
        <div class="logo">
          <IconHeart class="logo-icon" />
          <span v-if="!collapsed" class="logo-text">医联体系统</span>
        </div>
        
        <a-menu 
          :selected-keys="[currentRoute]"
          :collapsed="collapsed"
          :style="{ height: 'calc(100vh - 64px)', borderRight: 0 }"
          mode="inline"
          theme="light"
          class="patient-menu"
        >
          <a-menu-item key="dashboard" @click="$router.push('/patient')">
            <IconHome />
            <span>个人中心</span>
          </a-menu-item>
          <a-menu-item key="hospital" @click="$router.push('/patient/hospital')">
            <IconBarChart />
            <span>医院概览</span>
          </a-menu-item>
          <a-menu-item key="profile" @click="$router.push('/patient/profile')">
            <IconUser />
            <span>个人信息</span>
          </a-menu-item>
          <a-menu-item key="visits" @click="$router.push('/patient/visits')">
            <IconFile />
            <span>就诊记录</span>
          </a-menu-item>
          <a-menu-item key="referrals" @click="$router.push('/patient/referrals')">
            <IconSwap />
            <span>转诊记录</span>
          </a-menu-item>
          <a-menu-item key="doctors" @click="$router.push('/patient/doctors')">
            <IconUserGroup />
            <span>医生查询</span>
          </a-menu-item>
          <a-menu-item key="appointments" @click="$router.push('/patient/appointments')">
            <IconCalendarClock />
            <span>我的预约</span>
          </a-menu-item>
          <a-menu-item key="education" @click="$router.push('/patient/education')">
            <IconBook />
            <span>健康宣教</span>
          </a-menu-item>
          <a-menu-item key="telemedicine" @click="$router.push('/patient/telemedicine/apply')">
            <IconMobile />
            <span>远程医疗</span>
          </a-menu-item>
        </a-menu>
      </a-layout-sider>
      
      <!-- 主要内容区域 -->
      <a-layout>
        <!-- 顶部导航 -->
        <a-layout-header class="layout-header">
          <div class="header-left">
            <a-button 
              type="text" 
              @click="toggleCollapse()"
              class="collapse-btn"
            >
              <IconMenuUnfold v-if="collapsed" />
              <IconMenuFold v-else />
            </a-button>
            
            <div class="page-title">
              {{ getPageTitle() }}
            </div>
          </div>
          
          <div class="header-right">
            <a-dropdown>
              <a-button type="text" class="user-info">
                <IconUser />
                <span class="username">{{ userInfo?.username || '患者' }}</span>
                <IconDown />
              </a-button>
              <template #content>
                <a-doption @click="handleProfile">
                  <IconUser />
                  个人信息
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
        <a-layout-content class="layout-content">
          <router-view :key="$route.fullPath" />
        </a-layout-content>
      </a-layout>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import {
  IconHeart,
  IconHome,
  IconUser,
  IconFile,
  IconSwap,
  IconDown,
  IconPoweroff,
  IconMenuFold,
  IconMenuUnfold,
  IconBarChart,
  IconUserGroup,
  IconCalendarClock,
  IconBook,
  IconMobile
} from '@arco-design/web-vue/es/icon';

const router = useRouter();
const route = useRoute();
const collapsed = ref(false);
const enableSiderTransition = ref(false);
let collapseTimer: number | undefined;
const COLLAPSE_KEY = 'patient_center_sider_collapsed';

// 获取用户信息
const userInfo = computed(() => {
  try {
    const user = localStorage.getItem('medical_union_user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
});

// 当前路由
const MENU_KEY_BY_ROUTE: Record<string, string> = {
  PatientDashboard: 'dashboard',
  PatientProfile: 'profile',
  PatientVisits: 'visits',
  VisitDetail: 'visits',
  PatientReferrals: 'referrals',
  PatientReferralDetail: 'referrals',
  HospitalList: 'hospital',
  HospitalOverview: 'hospital',
  HospitalDetail: 'hospital',
  HospitalDepartmentIntro: 'hospital',
  DoctorList: 'doctors',
  DoctorDetail: 'doctors',
  DoctorSchedule: 'doctors',
  MyAppointments: 'appointments',
  AppointmentConfirm: 'appointments',
  AppointmentVoucher: 'appointments',
  TelemedicineApply: 'telemedicine',
  PatientEducationCenter: 'education',
  PatientEducationLectureDetail: 'education'
};

const currentRoute = computed(() => {
  const name = route.name ? String(route.name) : '';
  if (name && MENU_KEY_BY_ROUTE[name]) {
    return MENU_KEY_BY_ROUTE[name];
  }
  const path = route.path;
  if (path === '/patient') return 'dashboard';
  if (path.includes('/visit/')) return 'visits';
  if (path.includes('/profile')) return 'profile';
  if (path.includes('/visits')) return 'visits';
  if (path.includes('/referral')) return 'referrals';
  if (path.includes('/referrals')) return 'referrals';
  if (path.includes('/hospital')) return 'hospital';
  if (path.includes('/doctors')) return 'doctors';
  if (path.includes('/appointments')) return 'appointments';
  if (path.includes('/education')) return 'education';
  if (path.includes('/telemedicine')) return 'telemedicine';
  return 'dashboard';
});

// 获取页面标题
  const getPageTitle = () => {
  const titles: Record<string, string> = {
    dashboard: '个人中心',
    profile: '个人信息',
    visits: '就诊记录',
    referrals: '转诊记录'
  };
  titles.hospital = '医院';
  titles.doctors = '医生查询';
  titles.appointments = '我的预约';
  titles.education = '健康宣教';
  titles.telemedicine = '远程医疗申请';
  // special case: appointment voucher
  if (route.path.includes('/patient/appointment/voucher')) return '预约凭证';
  if (route.path.includes('/patient/education/')) return '健康宣教详情';
  // special case: visit detail
  if (route.path.includes('/patient/visit/')) return '就诊详情';
  return titles[currentRoute.value] || '个人中心';
};

// 处理个人信息
const handleProfile = () => {
  router.push('/patient/profile');
};

// 处理退出登录
const handleLogout = () => {
  localStorage.removeItem('medical_union_token');
  localStorage.removeItem('medical_union_user');
  Message.success('已退出登录');
  router.push('/login');
};

onMounted(() => {
  // 检查用户权限
  if (!userInfo.value || userInfo.value.userType !== 'PATIENT') {
    Message.error('权限不足');
    router.push('/login');
  }
  // 恢复侧边栏折叠状态
  try {
    const saved = localStorage.getItem(COLLAPSE_KEY);
    if (saved !== null) {
      collapsed.value = saved === '1';
    }
  } catch {}
});

// 切换侧边栏展开/收起时，记忆状态
function toggleCollapse(){
  enableSiderTransition.value = true;
  collapsed.value = !collapsed.value;
  try { localStorage.setItem(COLLAPSE_KEY, collapsed.value ? '1' : '0'); } catch {}
  if (collapseTimer) {
    window.clearTimeout(collapseTimer);
  }
  collapseTimer = window.setTimeout(() => {
    enableSiderTransition.value = false;
    collapseTimer = undefined;
  }, 360);
}

onBeforeUnmount(() => {
  if (collapseTimer) {
    window.clearTimeout(collapseTimer);
  }
});
</script>

<style lang="less" scoped>
.patient-center {
  /* 使用默认页面背景，避免全局渐变遮罩影响子页面 */
  min-height: 100vh;
  background: #ffffff;
  position: relative;
  overflow: visible;
}

.layout-sider {
  background: #ffffff; // 改为纯白色，移除透明度
  border-right: 1px solid #e5e7eb;
  transition: all 0.3s ease;
  overflow-x: hidden; // 防止水平滚动
  overflow-y: hidden;   // 禁止竖向滚动
  
  .logo {
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 0 20px;
    background: #ffffff;
    border-bottom: 1px solid #e5e7eb;
    overflow: hidden;
    transition: padding 0.3s ease;
    
    .logo-icon {
      font-size: 24px;
      color: #10b981;
      margin-right: 12px;
      flex-shrink: 0;
      transition: margin 0.3s ease;
    }
    
    .logo-text {
      color: #1f2937;
      font-weight: 600;
      font-size: 18px;
      white-space: nowrap;
      opacity: 1;
      transition: opacity 0.3s ease;
      overflow: hidden;
    }
  }
  
  // 收缩状态下的logo样式
  &.arco-layout-sider-collapsed {
    .logo {
      padding: 0 20px;
      justify-content: flex-start;
      
      .logo-icon {
        margin-right: 0;
      }
      
      .logo-text {
        opacity: 0;
        width: 0;
      }
    }
  }
  
  // OpenAI ChatGPT风格的患者菜单
  :deep(.patient-menu) {
    --menu-icon-size: 20px;
    --menu-padding-left: 24px;

    background-color: #ffffff;
    padding: 16px 12px;
    height: 100%;              // 占满父容器高度
    overflow-y: hidden;        // 禁止纵向滚动
    overflow-x: hidden;        // 禁止横向滚动
    
    // 隐藏滚动条但保持滚动功能
    scrollbar-width: none; // Firefox
    -ms-overflow-style: none; // IE/Edge
    &::-webkit-scrollbar {
      display: none; // Chrome/Safari/Opera
    }
    
    .arco-menu-item {
      color: #374151;
      background-color: transparent;
      border-radius: 12px;
      margin: 8px 0;
      font-size: 14px;
      font-weight: 500;
      padding: 14px 20px 14px var(--menu-padding-left);
      transition: all 0.2s ease;
      border: none;
      min-height: 52px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 12px;
      position: relative;
      z-index: 0;
      
      &:hover {
        background-color: #f3f4f6;
        color: #1f2937;
      }
      
      &.arco-menu-selected {
        background-color: #eef2f7;
        color: #1f2937;
        font-weight: 600;
        box-shadow: inset 0 0 0 1px #d1d5db;
        
        .arco-icon {
          color: #1f2937;
        }
      }
    }
    
    .arco-icon {
      color: #6b7280;
      font-size: var(--menu-icon-size) !important;
      flex-shrink: 0;
      transition: color 0.2s ease;
    }
    
    .arco-menu-selected .arco-icon {
      color: #1f2937;
    }

    .arco-menu-item span {
      display: inline-block;
      white-space: nowrap;
      transition: opacity 0.28s ease, max-width 0.28s ease, margin 0.28s ease, transform 0.28s ease;
      overflow: hidden;
      max-width: 160px;
    }
    
    // OpenAI风格的侧边栏收缩设计
    &.arco-menu-collapsed {
      padding: 16px 12px;
      width: 100%;
      overflow: hidden;

      .arco-menu-item {
        position: relative;
        width: 100%;
        min-height: 52px;
        padding: 14px 20px 14px var(--menu-padding-left);
        margin: 8px 0;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 12px;
        background-color: transparent;

        .arco-icon {
          margin: 0;
          font-size: var(--menu-icon-size) !important;    // 控制图标大小
        }

        &:hover {
          background-color: transparent;
        }

        &.arco-menu-selected {
          background-color: transparent;
          box-shadow: none;
        }

        &::after {
          content: '';
          position: absolute;
          left: max(calc(var(--menu-padding-left) - 18px), 0px);
          top: 50%;
          width: 56px;
          height: 56px;
          border-radius: 14px;
          transform: translateY(-50%);
          background-color: transparent;
          box-shadow: none;
          transition: background-color 0.2s ease, box-shadow 0.2s ease;
          z-index: -1;
          pointer-events: none;
        }

        &.arco-menu-selected::after,
        &:hover::after {
          background-color: #eef2f7;
          box-shadow: inset 0 0 0 1px #d1d5db;
        }

        span {
          max-width: 0;
          opacity: 0;
          margin-left: 0;
          transform: translateX(-6px);
        }
      }
    }
  }
}

.without-transition {
  transition: none !important;

  .logo {
    transition: none !important;

    .logo-icon,
    .logo-text {
      transition: none !important;
    }
  }
}

.layout-header {
  background: #ffffff;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
  height: 64px;
  box-shadow: none;
  
  .header-left {
    display: flex;
    align-items: center;
    
    .collapse-btn {
      color: #6b7280;
      font-size: 20px;
      margin-right: 16px;
      padding: 8px;
      border-radius: 6px;
      transition: all 0.2s ease;
      
      &:hover {
        background-color: #f3f4f6;
        color: #1f2937;
      }
    }
    
    .page-title {
      font-size: 20px;
      font-weight: 600;
      color: #1f2937;
    }
  }
  
  .header-right {
    .user-info {
      color: #6b7280;
      padding: 8px 12px;
      border-radius: 8px;
      transition: all 0.2s ease;
      
      &:hover {
        background-color: #f3f4f6;
        color: #1f2937;
      }
      
      .username {
        margin: 0 8px;
        font-weight: 500;
      }
    }
  }
}

.layout-content {
  background: #ffffff; /* 使用纯白背景，移除浅蓝底色 */
  padding: 24px;
  height: calc(100vh - 64px); /* 减去header高度 */
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  :deep(> *) {
    flex: 1;
    min-height: 0;
  }
}

// 移动端适配 - OpenAI风格
@media (max-width: @screen-md) {
  .layout-header {
    padding: 0 16px;
    
    .header-left {
      .page-title {
        font-size: 18px;
      }
    }
  }
  
  .layout-content {
    padding: 16px;
  }
  
  .layout-sider {
    .logo {
      padding: 0 16px;
      
      .logo-text {
        display: none;
      }
    }
    
    :deep(.patient-menu) {
      --menu-padding-left: 18px;
      
      .arco-menu-item {
        font-size: 13px;
        padding: 10px 16px 10px var(--menu-padding-left);
        margin: 2px 0;
      }
      
      &.arco-menu-collapsed {
        padding: 12px 8px;
        
        .arco-menu-item {
          padding: 10px 16px 10px var(--menu-padding-left);
          margin: 4px 0;
          
          .arco-icon {
            font-size: 22px;
          }
        }
      }
    }
  }
}

@media (max-width: @screen-sm) {
  .layout-content {
    padding: 12px;
  }
  
  .layout-sider {
    :deep(.patient-menu) {
      --menu-padding-left: 16px;
      padding: 8px 6px;
      
      .arco-menu-item {
        font-size: 12px;
        padding: 8px 14px 8px var(--menu-padding-left);
        margin: 1px 0;
      }
      
      &.arco-menu-collapsed {
        padding: 8px 4px;
        
        .arco-menu-item {
          padding: 8px 14px 8px var(--menu-padding-left);
          margin: 4px 0;
          border-radius: 8px;
          
          .arco-icon {
            font-size: 20px;
          }
        }
      }
    }
  }
}
</style>