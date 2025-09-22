<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <div class="error-code">404</div>
      <div class="error-message">
        <h1>页面未找到</h1>
        <p>抱歉，您访问的页面不存在或已被移动</p>
      </div>
      <div class="error-actions">
        <a-button type="primary" @click="goHome">
          <IconHome />
          返回首页
        </a-button>
        <a-button @click="goBack">
          <IconLeft />
          返回上页
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { IconHome, IconLeft } from '@arco-design/web-vue/es/icon';

const router = useRouter();

const goHome = () => {
  router.push('/');
};

const goBack = () => {
  router.back();
};
</script>

<style lang="less" scoped>
.not-found-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: @medical-white;
}

.not-found-content {
  text-align: center;
  max-width: 500px;
  padding: 40px;
}

.error-code {
  font-size: 120px;
  font-weight: 700;
  color: @medical-blue;
  line-height: 1;
  margin-bottom: 20px;
}

.error-message {
  margin-bottom: 40px;
  
  h1 {
    font-size: 32px;
    color: @gray-800;
    margin: 0 0 16px 0;
  }
  
  p {
    font-size: 16px;
    color: @gray-500;
    margin: 0;
    line-height: 1.6;
  }
}

.error-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  
  .arco-btn {
    min-width: 120px;
  }
}

@media (max-width: @screen-sm) {
  .error-code {
    font-size: 80px;
  }
  
  .error-message {
    h1 {
      font-size: 24px;
    }
    
    p {
      font-size: 14px;
    }
  }
  
  .error-actions {
    flex-direction: column;
    align-items: center;
    
    .arco-btn {
      width: 200px;
    }
  }
}
</style>