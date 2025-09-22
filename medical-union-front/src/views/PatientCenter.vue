<template>
  <div class="patient-center">
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
        
        <a-menu 
          :default-selected-keys="[currentRoute]"
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
          <router-view />
        </a-layout-content>
      </a-layout>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
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
  IconMenuUnfold
} from '@arco-design/web-vue/es/icon';

const router = useRouter();
const route = useRoute();
const collapsed = ref(false);

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
  if (path === '/patient') return 'dashboard';
  if (path.includes('/profile')) return 'profile';
  if (path.includes('/visits')) return 'visits';
  if (path.includes('/referrals')) return 'referrals';
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
});
</script>

<style lang="less" scoped>
.patient-center {
  height: 100vh;
  /* 全局渐变基底：左上到右下 */
  background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%);
  position: fixed; // 固定整个布局
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden; // 防止整体滚动
}

.layout-sider {
  background: rgba(255,255,255,0.9); // 半透明，让渐变透出
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
      padding: 0 16px;
      justify-content: center;
      
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
      padding: 12px 4px; // 进一步减少padding
      width: 100%;
      overflow: hidden; // 确保没有滚动条
      height: auto; // 让高度自适应
      
      .arco-menu-item {
        width: 100%;
        max-width: 56px;
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
  background: rgba(255,255,255,0.92);
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
  background: #f9fafb;
  padding: 24px;
  overflow-y: auto; // 仅内容区域可滚动
  height: calc(100vh - 64px); // 减去header高度
  position: relative;
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
    :deep(.patient-menu) {
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