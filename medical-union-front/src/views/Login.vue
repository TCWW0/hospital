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
          
          <a-form
            ref="formRef"
            :model="loginForm"
            :rules="rules"
            layout="vertical"
            size="large"
            @submit="handleSubmit"
          >
            <a-form-item field="phone" label="手机号">
              <a-input
                v-model="loginForm.phone"
                placeholder="请输入手机号"
                allow-clear
                :prefix="() => h(IconMobile)"
              />
            </a-form-item>
            
            <a-form-item field="password" label="密码">
              <a-input-password
                v-model="loginForm.password"
                placeholder="请输入密码"
                allow-clear
                :prefix="() => h(IconLock)"
              />
            </a-form-item>
            
            <a-form-item field="userType" label="用户类型">
              <a-select
                v-model="loginForm.userType"
                placeholder="请选择用户类型"
                :prefix="() => h(IconUserGroup)"
              >
                <a-option value="DOCTOR">医生</a-option>
                <a-option value="PATIENT">患者</a-option>
                <a-option value="ADMIN">管理员</a-option>
              </a-select>
            </a-form-item>
            
            <div class="form-options">
              <a-checkbox v-model="rememberPassword">记住密码</a-checkbox>
              <a-link href="#" class="forgot-password">忘记密码？</a-link>
            </div>
            
            <a-form-item>
              <a-button
                type="primary"
                html-type="submit"
                long
                :loading="loading"
                class="login-button"
              >
                {{ loading ? '登录中...' : '登录' }}
              </a-button>
            </a-form-item>
          </a-form>
          
          <div class="form-footer">
            <p>还没有账号？<a-link href="#" @click="handleRegister">立即注册</a-link></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, h } from 'vue';
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
import { mockLogin, shouldUseMock } from '@/utils/mockApi';
import type { LoginRequest } from '@/types';

const router = useRouter();
const formRef = ref();
const loading = ref(false);
const rememberPassword = ref(false);

// 表单数据
const loginForm = reactive<LoginRequest>({
  phone: '',
  password: '',
  userType: 'PATIENT'
});

// 表单验证规则
const rules = {
  phone: [
    { required: true, message: '请输入手机号' },
    { 
      match: /^1[3-9]\d{9}$/, 
      message: '请输入正确的手机号格式' 
    }
  ],
  password: [
    { required: true, message: '请输入密码' },
    { minLength: 6, message: '密码至少6个字符' }
  ],
  userType: [
    { required: true, message: '请选择用户类型' }
  ]
};

// 处理登录
const handleSubmit = async ({ errors }: { errors: any }) => {
  if (errors) return;
  
  loading.value = true;
  
  try {
    let response;
    
    // 根据配置选择使用 Mock API 还是真实 API
    if (shouldUseMock()) {
      console.log('🔧 使用 Mock API 进行登录测试');
      response = await mockLogin(loginForm);
    } else {
      response = await authApi.login(loginForm);
    }
    
    // 处理登录响应
    if (response.code === 200) {
      // 存储用户信息和 token
      localStorage.setItem('medical_union_token', response.data.token);
      localStorage.setItem('medical_union_user', JSON.stringify(response.data.user));
      
      // 记住密码功能
      if (rememberPassword.value) {
        localStorage.setItem('medical_union_remember', JSON.stringify({
          phone: loginForm.phone,
          userType: loginForm.userType
        }));
      } else {
        localStorage.removeItem('medical_union_remember');
      }
      
      Message.success('登录成功！');
      
      // 根据用户类型跳转到对应页面
      const userType = response.data.user.userType;
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