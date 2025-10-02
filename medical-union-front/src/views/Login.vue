<template>
  <div class="login-container">
    <div class="login-background">
      <div class="background-overlay"></div>
    </div>
    
    <div class="login-content">
      <!-- 左侧信息区域 -->
      <div class="login-info">
        <div class="logo-section">
          <div class="logo">
            <IconHeart class="logo-icon" />
            <span class="logo-text">医联体管理系统</span>
          </div>
          <p class="subtitle">Medical Union Management System</p>
        </div>
        
        <div class="features">
          <div class="feature-item">
            <IconUser class="feature-icon" />
            <div>
              <h3>统一患者管理</h3>
              <p>集中管理患者信息，提供完整的医疗档案</p>
            </div>
          </div>
          <div class="feature-item">
            <IconSwap class="feature-icon" />
            <div>
              <h3>便捷转诊服务</h3>
              <p>简化转诊流程，提升医疗服务效率</p>
            </div>
          </div>
          <div class="feature-item">
            <IconBarChart class="feature-icon" />
            <div>
              <h3>数据统计分析</h3>
              <p>全面的数据分析，支持科学决策</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧登录表单 -->
      <div class="login-form-container">
        <div class="login-form">
          <div class="form-header">
            <h2>欢迎登录</h2>
            <p>请输入您的账号信息</p>
          </div>
          
          <form @submit.prevent="handleSubmit">
            <a-form
              ref="formRef"
              :model="loginForm"
              :rules="rules"
              layout="vertical"
              size="large"
            >
            <a-form-item field="phone" :label="phoneLabel">
              <a-input
                v-model="loginForm.phone"
                :placeholder="phonePlaceholder"
                allow-clear
              >
                <template #prefix>
                  <IconMobile />
                </template>
              </a-input>
            </a-form-item>
            
            <a-form-item field="password" label="密码">
              <a-input-password
                v-model="loginForm.password"
                placeholder="请输入密码"
                allow-clear
              >
                <template #prefix>
                  <IconLock />
                </template>
              </a-input-password>
            </a-form-item>
            
            <a-form-item field="userType" label="用户类型">
              <a-select
                v-model="loginForm.userType"
                placeholder="请选择用户类型"
              >
                <template #prefix>
                  <IconUserGroup />
                </template>
                <a-option value="DOCTOR">医生</a-option>
                <a-option value="PATIENT">患者</a-option>
                <a-option value="ADMIN">管理员</a-option>
              </a-select>
            </a-form-item>
            
            <div class="form-options">
              <a-checkbox v-model="rememberPassword">记住密码</a-checkbox>
              <a-link href="#" class="forgot-password" @click.prevent="handleForgotPassword">忘记密码？</a-link>
            </div>
            
            <a-form-item>
              <a-button
                type="primary"
                html-type="button"
                long
                :loading="loading"
                class="login-button"
                @click.prevent="handleSubmit"
              >
                {{ loading ? '登录中...' : '登录' }}
              </a-button>
            </a-form-item>
            
            </a-form>

          </form>

          <div class="form-footer">
            <p>还没有账号？<a-link href="#" @click.prevent="handleRegister">立即注册</a-link></p>
            
            <!-- 开发模式提示 -->
            <div v-if="isDevelopment && isUsingMockAuth" class="dev-mode-info">
              
              <div class="mock-accounts">
                <p class="mock-title">测试账号：</p>
                <div class="mock-account-list">
                  <p><code>患者：13800138000 / password123</code></p>
                  <p><code>医院医生：DOC001 / doctor123</code></p>
                  <p><code>社区医生：DOC002 / password123</code></p>
                  <p><code>管理员：ADMIN001 / admin123</code></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import {
  IconHeart,
  IconUser,
  IconLock,
  IconUserGroup,
  IconSwap,
  IconBarChart,
  IconMobile
} from '@arco-design/web-vue/es/icon';
import { authApi } from '@/api';
import { shouldUseMockAuth } from '@/config/runtime';
import { mockAuthLogin } from '@/api/mock/auth';
import { setCurrentUser } from '@/composables/useCurrentUser';
import type { LoginRequest } from '@/types';
import { setDoctorRole, resetDoctorRole, type DoctorRole } from '@/utils/doctorRole';

const router = useRouter();
const formRef = ref();
const loading = ref(false);
const rememberPassword = ref(false);

// 环境变量检测
const isDevelopment = computed(() => import.meta.env.DEV);
const isUsingMockAuth = computed(() => shouldUseMockAuth());

// 表单数据
const loginForm = reactive<LoginRequest>({
  phone: '',
  password: '',
  userType: 'PATIENT'
});

// 动态 label / placeholder
const phoneLabel = computed(() => (loginForm.userType === 'DOCTOR' ? '工号' : '手机号'));
const phonePlaceholder = computed(() => (loginForm.userType === 'DOCTOR' ? '请输入工号' : '请输入手机号'));

// 表单验证规则（根据用户类型动态返回）
const rules = computed(() => {
  const phoneRule = loginForm.userType === 'DOCTOR'
    ? [{ required: true, message: '请输入工号' }]
    : [
        { required: true, message: '请输入手机号' },
        { match: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式' }
      ];

  return {
    phone: phoneRule,
    password: [
      { required: true, message: '请输入密码' },
      { minLength: 6, message: '密码至少6个字符' }
    ],
    userType: [
      { required: true, message: '请选择用户类型' }
    ]
  };
});

// 处理登录
const handleSubmit = async (payload?: any) => {
  // 支持三种调用场景：
  // 1. a-form 验证后传入 { errors }
  // 2. 原生 DOM Event（如浏览器默认提交）
  // 3. 无参数直接调用（脚本触发）

  // 如果是 DOM Event，阻止默认导航
  try {
    if (payload && typeof payload.preventDefault === 'function') {
      payload.preventDefault();
    }
  } catch (e) {
    // ignore
  }

  // 如果表单验证器传入了 errors 对象，检查并返回
  if (payload && payload.errors) {
    if (payload.errors) {
      console.log('表单验证未通过：', payload.errors);
      return;
    }
  }

  // 兜底：如果没有 errors 信息，使用 formRef 的 validate 方法（如果可用）来确保字段验证
  if (!payload || typeof payload.errors === 'undefined') {
    if (formRef.value && typeof formRef.value.validate === 'function') {
      try {
        // validate() 在通过时返回 Promise.resolve(), 验证失败会抛出或返回 rejected promise
        await formRef.value.validate();
      } catch (err) {
        console.log('表单验证失败（validate 返回）:', err);
        return;
      }
    }
  }

  loading.value = true;

  try {
    let response: any;

    console.log('handleSubmit invoked; loginForm:', JSON.parse(JSON.stringify(loginForm)));
    
    // 根据环境变量选择登录方式
    const useMockAuth = shouldUseMockAuth();
    console.log('使用', useMockAuth ? 'Mock' : '真实后端', 'API 进行登录');
    
    if (useMockAuth) {
      // 使用 Mock 登录
      console.log('Mock login payload:', loginForm);
      response = await mockAuthLogin(loginForm.phone, loginForm.password, loginForm.userType);
    } else {
      // 使用真实后端 API 登录
      console.log('API call payload:', loginForm);
      response = await authApi.login(loginForm);
    }
    
    // 处理登录响应 (支持两种格式：mock格式和后端格式)
    console.log('Login response raw:', response);
    if (response.code === 200 || response.code === 0) {
      const { data } = response;

      // 兼容后端和mock的不同数据结构；尝试从任意深度提取 token
      const findToken = (obj: any): string | null => {
        if (!obj || typeof obj !== 'object') return null;
        if (typeof obj.token === 'string' && obj.token) return obj.token;
        for (const k of Object.keys(obj)) {
          try {
            const v = obj[k];
            if (v && typeof v === 'object') {
              const t = findToken(v);
              if (t) return t;
            }
          } catch (e) {
            // ignore
          }
        }
        return null;
      };

      let token: string | null = null;
      let userInfo: any = null;

      const pickDoctorRole = (source: any): DoctorRole | undefined => {
        if (!source) return undefined;
        const value = source.doctorRole ?? source.roleTag;
        return value === 'community' || value === 'hospital' ? value : undefined;
      };

      const backendData = data as any;
      token = backendData.token || findToken(backendData);

      if (backendData.user) {
        const normalizedDoctorRole =
          pickDoctorRole(backendData.user) ?? pickDoctorRole(backendData);
        userInfo = {
          ...backendData.user,
          ...(normalizedDoctorRole ? { doctorRole: normalizedDoctorRole } : {}),
          ...(typeof backendData.user.expertId === 'string'
            ? { expertId: backendData.user.expertId }
            : {}),
          ...(typeof backendData.expertId === 'string'
            ? { expertId: backendData.expertId }
            : {}),
          ...(typeof backendData.user.organizerId === 'string'
            ? { organizerId: backendData.user.organizerId }
            : {}),
          ...(typeof backendData.organizerId === 'string'
            ? { organizerId: backendData.organizerId }
            : {})
        };
      } else {
        const normalizedDoctorRole = pickDoctorRole(backendData);
        userInfo = {
          id: backendData.userId,
          username: backendData.username,
          userType: backendData.userType || backendData.role, // 优先使用 userType，兼容后端
          role: backendData.role,
          relatedId: backendData.userId,
          profileJson: backendData.profileJson,
          name: backendData.name,
          phone: backendData.phone,
          doctorRole: normalizedDoctorRole,
          ...(typeof backendData.expertId === 'string'
            ? { expertId: backendData.expertId }
            : {}),
          ...(typeof backendData.organizerId === 'string'
            ? { organizerId: backendData.organizerId }
            : {})
        };
      }

      console.log('Extracted token:', token);
      console.log('Extracted userInfo:', userInfo);

      if (!token) {
        console.error('登录失败：未能在后端响应中提取到 token，响应为：', response);
        return;
      }

  // 存储用户信息和 token
  localStorage.setItem('medical_union_token', token);
  setCurrentUser(userInfo);

      // 根据医生账号的 doctorRole 初始化视角
      if ((userInfo.userType || userInfo.role) === 'DOCTOR') {
        const roleFromBackend = (userInfo.doctorRole || userInfo.roleTag) as DoctorRole | undefined;
        setDoctorRole(roleFromBackend === 'community' || roleFromBackend === 'hospital' ? roleFromBackend : 'hospital');
      } else {
        resetDoctorRole();
      }
      
      // 记住密码功能
      if (rememberPassword.value) {
        localStorage.setItem('medical_union_remember', JSON.stringify({
          phone: loginForm.phone,
          userType: loginForm.userType
        }));
      } else {
        localStorage.removeItem('medical_union_remember');
      }
      
  // 患者登录后的友好提示：优先显示姓名，其次手机号或用户名
  const displayName = (userInfo && (userInfo.name || userInfo.username || userInfo.phone)) || loginForm.phone;
  Message.success(response.message || `欢迎，${displayName}！`);
      
      // 根据用户类型跳转到对应页面
      const userType = userInfo.userType || userInfo.role;
      switch (userType) {
        case 'DOCTOR':
          router.push('/doctor');
          break;
        case 'PATIENT':
          router.push('/patient');
          break;
        case 'ADMIN':
          router.push('/admin');
          break;
        default:
          router.push('/');
      }
    } else {
      Message.error(response.message || '登录失败');
    }
  } catch (error: any) {
    console.error('登录错误:', error);
    Message.error(error.message || '登录失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 处理注册
const handleRegister = () => {
  Message.info('注册功能即将开放，请联系管理员');
};

// 处理忘记密码（阻止默认链接导航）
const handleForgotPassword = (ev?: Event) => {
  if (ev && ev.preventDefault) ev.preventDefault();
  Message.info('请联系管理员重置密码或使用忘记密码流程（开发中）');
};

// （已移除开发调试相关函数：showApiInfo/testConnection）

// 页面初始化 - 检查是否有记住的用户信息
const initForm = () => {
  try {
    const remembered = localStorage.getItem('medical_union_remember');
    if (remembered) {
      const data = JSON.parse(remembered);
      loginForm.phone = data.phone;
      loginForm.userType = data.userType;
      rememberPassword.value = true;
    }
  } catch (error) {
    console.warn('Failed to load remembered login info:', error);
  }
};

// 组件挂载时初始化
initForm();

// 初始化完成
</script>

<style lang="less" scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  position: relative;
  overflow: hidden;
}

.login-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, @medical-blue 0%, @medical-dark-blue 100%);
  
  .background-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><defs><pattern id="medical-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="2" fill="white" opacity="0.1"/></pattern></defs><rect width="100%" height="100%" fill="url(%23medical-pattern)"/></svg>');
  }
}

.login-content {
  display: flex;
  width: 100%;
  position: relative;
  z-index: 1;
}

.login-info {
  flex: 1;
  padding: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: @white;
  
  .logo-section {
    margin-bottom: 60px;
    
    .logo {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
      
      .logo-icon {
        font-size: 48px;
        color: @white;
        margin-right: 16px;
      }
      
      .logo-text {
        font-size: 32px;
        font-weight: 600;
        color: @white;
      }
    }
    
    .subtitle {
      font-size: 16px;
      opacity: 0.8;
      margin: 0;
    }
  }
  
  .features {
    .feature-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 32px;
      
      .feature-icon {
        font-size: 24px;
        margin-right: 16px;
        margin-top: 4px;
        opacity: 0.9;
      }
      
      h3 {
        font-size: 18px;
        font-weight: 600;
        margin: 0 0 8px 0;
        color: @white;
      }
      
      p {
        font-size: 14px;
        margin: 0;
        opacity: 0.8;
        line-height: 1.5;
      }
    }
  }
}

.login-form-container {
  flex: 0 0 480px;
  background: @white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.1);
}

.login-form {
  width: 360px;
  padding: 0 24px;
  
  .form-header {
    text-align: center;
    margin-bottom: 32px;
    
    h2 {
      font-size: 28px;
      font-weight: 600;
      color: @gray-800;
      margin: 0 0 8px 0;
    }
    
    p {
      font-size: 14px;
      color: @gray-500;
      margin: 0;
    }
  }
  
  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    
    .forgot-password {
      font-size: 14px;
    }
  }
  
  .login-button {
    height: 48px;
    font-size: 16px;
    font-weight: 500;
    background: @medical-blue;
    border-color: @medical-blue;
    
    &:hover {
      background: @medical-dark-blue;
      border-color: @medical-dark-blue;
    }
  }
  
  .form-footer {
    text-align: center;
    margin-top: 24px;
    
    p {
      font-size: 14px;
      color: @gray-600;
      margin: 0;
    }
    
    .dev-mode-info {
      margin-top: 16px;
      text-align: left;
      
      .mock-accounts {
        margin-top: 12px;
        padding: 8px;
        background: @gray-50;
        border-radius: 6px;
        
        .mock-title {
          font-size: 13px;
          font-weight: 500;
          margin: 0 0 8px 0;
          color: @gray-700;
        }
        
        .mock-account-list {
          p {
            margin: 4px 0;
            font-size: 12px;
            
            code {
              background: @white;
              border: 1px solid @gray-200;
              padding: 4px 8px;
              border-radius: 4px;
              font-family: 'Courier New', monospace;
              color: @gray-700;
              font-size: 11px;
              display: inline-block;
              width: 100%;
            }
          }
        }
      }
    }
  }
  
  .test-button {
    margin-top: 8px;
    border-color: @warning-color;
    color: @warning-color;
    
    &:hover {
      border-color: darken(@warning-color, 10%);
      color: darken(@warning-color, 15%);
      background: lighten(@warning-color, 35%);
    }
  }
  
  .dev-info {
    margin-top: 16px;
    
    .api-status {
      margin-bottom: 8px;
      display: flex;
      justify-content: center;
    }
    
    .dev-tips {
      p {
        font-size: 12px;
        color: @gray-500;
        margin: 4px 0;
        
        code {
          font-family: 'Courier New', monospace;
          background: @gray-100;
          padding: 2px 4px;
          border-radius: 4px;
          font-size: 11px;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: @screen-lg) {
  .login-info {
    padding: 40px;
    
    .logo-section {
      margin-bottom: 40px;
      
      .logo {
        .logo-icon {
          font-size: 40px;
        }
        
        .logo-text {
          font-size: 28px;
        }
      }
    }
    
    .features {
      .feature-item {
        margin-bottom: 24px;
        
        h3 {
          font-size: 16px;
        }
        
        p {
          font-size: 13px;
        }
      }
    }
  }
  
  .login-form-container {
    flex: 0 0 400px;
  }
}

@media (max-width: @screen-md) {
  .login-content {
    flex-direction: column;
  }
  
  .login-info {
    flex: none;
    padding: 40px 24px;
    text-align: center;
    
    .features {
      display: none; // 在移动端隐藏功能介绍
    }
  }
  
  .login-form-container {
    flex: 1;
    
    .login-form {
      width: 100%;
      max-width: 360px;
      padding: 24px;
    }
  }
}

@media (max-width: @screen-sm) {
  .login-info {
    padding: 24px;
    
    .logo-section {
      margin-bottom: 24px;
      
      .logo {
        .logo-icon {
          font-size: 36px;
        }
        
        .logo-text {
          font-size: 24px;
        }
      }
    }
  }
}
</style>