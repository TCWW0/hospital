<template>
  <div class="doctor-workspace">
    <a-layout>
      <!-- 侧边栏 -->
      <a-layout-sider 
        :width="280" 
        :collapsed-width="80"
        :collapsed="collapsed" 
        :collapsible="true"
        class="layout-sider"
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
            <div class="hospital-stats">今日患者: {{ hospitalInfo?.todayPatients ?? 0 }}</div>
          </div>
        </div>
        
        <a-menu 
          :default-selected-keys="[currentRoute]"
          :collapsed="collapsed"
          :style="{ height: 'calc(100vh - 64px)', borderRight: 0 }"
          mode="inline"
          theme="light"
          class="doctor-menu"
        >
          <a-menu-item key="dashboard" @click="$router.push('/doctor')">
            <IconHome />
            <span>工作台首页</span>
          </a-menu-item>
          <a-menu-item key="patients" @click="$router.push('/doctor/patients')">
            <IconUser />
            <span>患者管理</span>
          </a-menu-item>
          <a-menu-item key="referrals" @click="$router.push('/doctor/referrals')">
            <IconSwap />
            <span>转诊管理</span>
          </a-menu-item>
          <a-menu-item key="hospitals" @click="$router.push('/patient/hospitals')">
            <IconHome />
            <span>医院列表</span>
          </a-menu-item>
          <a-menu-item key="doctors" @click="$router.push('/patient/doctors')">
            <IconUser />
            <span>医生查询</span>
          </a-menu-item>
          <a-menu-item key="appointments" @click="$router.push('/patient/appointments')">
            <IconFile />
            <span>我的预约</span>
          </a-menu-item>
          <a-menu-item key="telemedicine" @click="$router.push('/patient/telemedicine/apply')">
            <IconHeart />
            <span>远程医疗</span>
          </a-menu-item>
          <a-menu-item key="statistics" @click="$router.push('/doctor/statistics')">
            <IconBarChart />
            <span>数据统计</span>
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
              @click="collapsed = !collapsed"
              class="collapse-btn"
            >
              <IconMenuUnfold v-if="collapsed" />
              <IconMenuFold v-else />
            </a-button>
          </div>
          
          <div class="header-right">
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
        <a-layout-content class="layout-content">
          <router-view />
        </a-layout-content>
      </a-layout>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { mockDoctorDashboard } from '@/utils/mockData';
import { useRouter, useRoute } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import {
  IconHeart,
  IconHome,
  IconUser,
  IconSwap,
  IconBarChart,
  IconMenuFold,
  IconMenuUnfold,
  IconDown,
  IconSettings,
  IconPoweroff
 } from '@arco-design/web-vue/es/icon';
 import { IconUserGroup, IconFile, IconMobile } from '@arco-design/web-vue/es/icon';

const router = useRouter();
const route = useRoute();
const collapsed = ref(false);

// ensure imported icons are referenced so TypeScript doesn't warn
void IconUserGroup;
void IconFile;
void IconMobile;

// 从 mockData 获取医院信息（临时）
const hospitalInfo = computed(() => {
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
const userInfo = computed(() => {
  try {
    const user = localStorage.getItem('medical_union_user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
});

// 当前路由
const currentRoute = computed(() => {
  const path = route.path;
  if (path === '/doctor') return 'dashboard';
  if (path.includes('/patients')) return 'patients';
  if (path.includes('/referrals')) return 'referrals';
  if (path.includes('/statistics')) return 'statistics';
  if (path.includes('/hospital')) return 'hospital';
  return 'dashboard';
});
// 处理退出登录
const handleLogout = () => {
  localStorage.removeItem('medical_union_token');
  localStorage.removeItem('medical_union_user');
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

onMounted(() => {
  // 检查用户权限
  if (!userInfo.value || userInfo.value.userType !== 'DOCTOR') {
    Message.error('权限不足');
    router.push('/login');
  }
});
</script>

<style lang="less" scoped>
.doctor-workspace {
  height: 100vh;
  /* 整体渐变基底：左上到右下 */
  background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%);
  position: fixed; // 固定整个布局
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden; // 防止整体滚动
}

.layout-sider {
  background: rgba(255,255,255,0.94);
  border-right: 1px solid rgba(229,230,235,0.8);
  transition: all 0.3s ease;
  overflow-x: hidden; // 防止水平滚动
  overflow-y: hidden;
  
    .logo {
    height: 64px;
    display: flex;
    align-items: center;
      justify-content: flex-start;
    padding: 0 20px;
    background: rgba(255,255,255,0.9);
    border-bottom: 1px solid rgba(229,230,235,0.7);
    overflow: hidden;
    transition: padding 0.3s ease;
    
    .logo-icon {
      font-size: 20px;
      color: #2563eb; // 更深的蓝色
      margin-right: 10px;
      flex-shrink: 0;
      transition: transform 0.2s ease, margin 0.3s ease;
    }
    
    .logo-text {
      color: #374151;
      font-weight: 600;
      font-size: 15px;
      letter-spacing: 0.3px;
      white-space: nowrap;
      opacity: 1;
      transition: opacity 0.2s ease, transform 0.2s ease;
      overflow: hidden;
    }
  }
  .hospital-card {
    display: flex;
    align-items: center;
    padding: 10px 16px;
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
      border-radius: 8px;
      background: #f3f4f6;
      color: #3b82f6;
      flex-shrink: 0;
    }

    .hospital-body {
      display: flex;
      flex-direction: column;
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
  
  // 收缩状态下的logo样式
  &.arco-layout-sider-collapsed {
    .logo {
      padding: 0 16px;
      justify-content: center;

      .logo-icon { transform: scale(1.05); }

      .logo-text { opacity: 0; transform: translateX(-6px); width: 0; }
    }
    .hospital-card {
      padding: 8px 0;
      justify-content: center;

      .hospital-left {
        width: 48px;
        height: 48px;
      }

      .hospital-body { display: none; }
    }
  }
  
  // OpenAI ChatGPT风格的医生菜单
  :deep(.arco-menu-light) {
    background-color: #ffffff;
    padding: 16px 12px;
    height: 100%;
    overflow-y: hidden;
    overflow-x: hidden;
    
    // 隐藏滚动条
    scrollbar-width: none; // Firefox
    -ms-overflow-style: none; // IE/Edge
    &::-webkit-scrollbar {
      display: none; // Chrome/Safari/Opera
    }
    
    .arco-menu-item {
      color: #374151;
      background-color: transparent;
      border-radius: 8px;
      margin: 4px 0;
      font-size: 14px;
      font-weight: 500;
      padding: 12px 16px;
      transition: all 0.2s ease;
      border: none;
      min-height: 44px;
      display: flex;
      align-items: center;
      
      &:hover {
        background-color: #f3f4f6;
        color: #1f2937;
      }
      
      &.arco-menu-selected {
        background-color: #f3f4f6;
        color: #1f2937;
        font-weight: 600;
        
        .arco-icon {
          color: #1f2937;
        }
      }
    }
    
    .arco-icon {
      color: #6b7280;
      font-size: 20px;
      margin-right: 16px;
      flex-shrink: 0;
    }
    
    .arco-menu-selected .arco-icon {
      color: #1f2937;
    }
    
    // OpenAI风格的侧边栏收缩设计
    &.arco-menu-collapsed {
      padding: 12px 0; // 进一步减少padding
      width: 100%;
      overflow-x: hidden;     // 再次强制关闭横向滚动
      height: auto; // 让高度自适应
      
      .arco-menu-item {
        width: 100%;
        max-width: 64px;
        height: 56px; // 对应调整高度
        padding: 0;
        margin: 4px auto; // 减少边距
        text-align: center;
        justify-content: center;
        align-items: center;
        display: flex;
        border-radius: 10px; // 稍微减少圆角
        position: relative;
        flex-shrink: 0; // 防止压缩
        
        .arco-icon {
          margin-right: 0;
          font-size: 20px; // 调整图标尺寸适配56px容器
          color: #6b7280;
        }
        
        &:hover {
          background-color: #f3f4f6;
          
          .arco-icon {
            color: #1f2937;
          }
        }
        
        &.arco-menu-selected {
          background-color: #f3f4f6;
          border: 2px solid #d1d5db; // GPT风格的中性灰色边框
          
          .arco-icon {
            color: #1f2937;
            font-size: 20px;
          }
        }
        
        span {
          display: none;
        }
      }
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
    .collapse-btn {
      color: #6b7280;
      font-size: 20px;
      padding: 8px;
      border-radius: 6px;
      transition: all 0.2s ease;
      
      &:hover {
        background-color: #f3f4f6;
        color: #1f2937;
      }
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
  /* 内容区透明，让整体渐变基底透出，但保持内部卡片为白色以保证可读性 */
  background: transparent;
  padding: 24px;
  overflow-y: auto; // 仅内容区域可滚动
  height: calc(100vh - 64px); // 减去header高度
  position: relative;
}

// 移动端适配 - OpenAI风格
@media (max-width: @screen-md) {
  .layout-header {
    padding: 0 16px;
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
    
    :deep(.arco-menu-light) {
      padding: 12px 8px;
      
      .arco-menu-item {
        font-size: 13px;
        padding: 10px 12px;
        margin: 2px 0;
      }
      
      &.arco-menu-collapsed {
        padding: 12px 4px;
        
        .arco-menu-item {
          width: 56px;
          height: 56px;
          margin: 6px 0;
          border-radius: 10px;
          
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
    :deep(.arco-menu-light) {
      padding: 8px 6px;
      
      .arco-menu-item {
        font-size: 12px;
        padding: 8px 10px;
        margin: 1px 0;
      }
      
      &.arco-menu-collapsed {
        padding: 8px 2px;
        
        .arco-menu-item {
          width: 48px;
          height: 48px;
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