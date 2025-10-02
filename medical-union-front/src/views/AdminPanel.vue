<template>
  <div class="admin-panel">
    <a-layout>
      <a-layout-sider
        :collapsed-width="92"
        :collapsed="collapsed"
        collapsible
        :width="248"
        class="layout-sider"
      >
        <div class="logo" @click="navigate('/admin')">
          <IconHeart class="logo-icon" />
          <span v-if="!collapsed" class="logo-text">医联体 · 管理中心</span>
        </div>
        <a-menu
          class="admin-menu"
          :selected-keys="[currentKey]"
          :collapsed="collapsed"
          mode="inline"
        >
          <a-menu-item key="dashboard" @click="navigate('/admin')">
            <IconHome />
            <span>系统概览</span>
          </a-menu-item>
          <a-menu-item key="users" @click="navigate('/admin/users')">
            <IconUser />
            <span>用户管理</span>
          </a-menu-item>
          <a-menu-item key="hospitals" @click="navigate('/admin/hospitals')">
            <IconHeart />
            <span>医院管理</span>
          </a-menu-item>
          <a-menu-item key="telemedicine" @click="navigate('/admin/telemedicine')">
            <IconMobile />
            <span>远程医疗调度</span>
          </a-menu-item>
          <a-menu-item key="teaching" @click="navigate('/admin/teaching')">
            <IconBook />
            <span>远程教学调度</span>
          </a-menu-item>
          <a-menu-item key="statistics" @click="navigate('/admin/statistics')">
            <IconBarChart />
            <span>统计分析</span>
          </a-menu-item>
        </a-menu>
      </a-layout-sider>

      <a-layout>
        <a-layout-header class="layout-header">
          <div class="header-left">
            <a-button type="text" class="collapse-btn" @click="toggleCollapse">
              <IconMenuUnfold v-if="collapsed" />
              <IconMenuFold v-else />
            </a-button>
            <span class="page-title">{{ pageTitle }}</span>
          </div>
          <div class="header-right">
            <a-dropdown trigger="hover">
              <a-button type="text" class="user-info">
                <IconUser />
                <span class="username">{{ userInfo?.username || '管理员' }}</span>
                <IconDown />
              </a-button>
              <template #content>
                <a-doption @click="handleProfile">
                  <IconSettings />
                  账号设置
                </a-doption>
                <a-doption @click="handleLogout">
                  <IconPoweroff />
                  退出登录
                </a-doption>
              </template>
            </a-dropdown>
          </div>
        </a-layout-header>

        <a-layout-content class="layout-content">
          <router-view :key="$route.fullPath" />
        </a-layout-content>
      </a-layout>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import {
  IconHeart,
  IconHome,
  IconMenuFold,
  IconMenuUnfold,
  IconUser,
  IconMobile,
  IconBook,
  IconBarChart,
  IconDown,
  IconSettings,
  IconPoweroff
} from '@arco-design/web-vue/es/icon';

const router = useRouter();
const route = useRoute();
const collapsed = ref(false);

const userInfo = computed(() => {
  try {
    const raw = localStorage.getItem('medical_union_user');
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn('Failed to parse admin user info', error);
    return null;
  }
});

const currentKey = computed(() => {
  const path = route.path;
  if (path === '/admin' || path === '/admin/') return 'dashboard';
  if (path.includes('/admin/users')) return 'users';
  if (path.includes('/admin/hospitals')) return 'hospitals';
  if (path.includes('/admin/telemedicine')) return 'telemedicine';
  if (path.includes('/admin/teaching')) return 'teaching';
  if (path.includes('/admin/statistics')) return 'statistics';
  return 'dashboard';
});

const pageTitle = computed(() => {
  const map: Record<string, string> = {
    dashboard: '系统概览',
    users: '用户管理',
    hospitals: '医院管理',
    telemedicine: '远程医疗调度',
    teaching: '远程教学调度',
    statistics: '统计分析'
  };
  return map[currentKey.value] || '管理员后台';
});

function navigate(path: string) {
  if (route.path === path) return;
  router.push(path).catch(() => undefined);
}

function toggleCollapse() {
  collapsed.value = !collapsed.value;
}

function handleProfile() {
  Message.info('账号设置功能即将推出');
}

function handleLogout() {
  localStorage.removeItem('medical_union_token');
  localStorage.removeItem('medical_union_user');
  Message.success('已退出登录');
  router.push('/login').catch(() => undefined);
}

// keep icon imports referenced to satisfy treeshaking
void IconHeart;
void IconHome;
void IconMenuFold;
void IconMenuUnfold;
void IconUser;
void IconMobile;
void IconBook;
void IconBarChart;
void IconDown;
void IconSettings;
void IconPoweroff;
</script>

<style scoped>
.admin-panel { height: 100%; min-height: 100vh; }
.layout-sider { background: #fff; box-shadow: 2px 0 8px rgba(15, 23, 42, 0.08); z-index: 1; }
.logo { display:flex; align-items:center; gap:10px; padding:18px 20px; cursor:pointer; border-bottom:1px solid rgba(15,23,42,0.06); }
.logo-icon{ font-size:20px; color:#165dff }
.logo-text{ font-weight:700; font-size:15px; color:#0f172a }
.admin-menu { border-right: none; height: calc(100vh - 80px); padding-top:12px; }
.layout-header { display:flex; align-items:center; justify-content:space-between; padding:0 24px; background:#ffffff; box-shadow:0 2px 12px rgba(15,23,42,0.08); position:sticky; top:0; z-index:2; }
.collapse-btn { color:#0f172a }
.page-title { font-size:18px; font-weight:700; color:#0f172a; margin-left:12px }
.layout-content { padding:24px; min-height: calc(100vh - 64px); background:#f6f8fb }
.user-info { display:flex; align-items:center; gap:8px; color:#0f172a }
.username { font-weight:600 }
.header-right :deep(.arco-dropdown-option) { min-width:140px }
@media (max-width: 960px) {
  .layout-content { padding:16px }
  .logo-text { display:none }
}
</style>