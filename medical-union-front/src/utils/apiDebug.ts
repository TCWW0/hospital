// API 模式切换工具
// 在浏览器控制台中使用

interface ApiDebugTool {
  // 检查当前 API 模式
  status(): void;
  
  // 切换到 Mock API
  useMock(): void;
  
  // 切换到真实 API
  useReal(): void;
  
  // 清除本地存储的 API 模式设置
  reset(): void;
  
  // 测试当前 API 连通性
  testConnection(): Promise<void>;
}

const createApiDebugTool = (): ApiDebugTool => {
  const tool = {
    status() {
      const useMock = localStorage.getItem('medical_union_use_mock') === 'true';
  const baseURL = import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE_URL;
      const envUseMock = import.meta.env.VITE_USE_MOCK_API === 'true';
      const envUseReal = import.meta.env.VITE_USE_REAL_API === 'true';
      
      console.log('🔍 API 配置状态:');
      console.log('  当前模式:', useMock ? '🎭 Mock API' : '🌐 真实 API');
      console.log('  后端地址:', baseURL || '❌ 未配置');
      console.log('  环境变量:');
      console.log('    VITE_USE_MOCK_API:', envUseMock);
      console.log('    VITE_USE_REAL_API:', envUseReal);
      console.log('  本地设置:', localStorage.getItem('medical_union_use_mock') || '未设置');
      console.log('');
      console.log('💡 使用方法:');
      console.log('  api.useMock() - 切换到 Mock API');
      console.log('  api.useReal() - 切换到真实 API');
      console.log('  api.testConnection() - 测试连通性');
      console.log('  api.reset() - 重置配置');
    },
    
    useMock() {
      localStorage.setItem('medical_union_use_mock', 'true');
      console.log('✅ 已切换到 Mock API 模式');
      console.log('🔄 请刷新页面使设置生效');
      this.status();
    },
    
    useReal() {
      localStorage.setItem('medical_union_use_mock', 'false');
      console.log('✅ 已切换到真实 API 模式');
      console.log('🔄 请刷新页面使设置生效');
      this.status();
    },
    
    reset() {
      localStorage.removeItem('medical_union_use_mock');
      console.log('🔄 已重置 API 配置，将使用环境变量默认设置');
      console.log('🔄 请刷新页面使设置生效');
      this.status();
    },
    
    async testConnection() {
      const baseURL = import.meta.env.VITE_API_BASE_URL;
      if (!baseURL) {
        console.log('❌ 未配置后端 API 地址');
        return;
      }
      
      try {
        console.log('🔄 正在测试后端连通性...');
  console.log('📡 请求地址:', `${baseURL}/actuator/health`);
        
  const response = await fetch(`${baseURL}/actuator/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ 后端连通性测试成功');
          console.log('📊 健康状态:', data);
        } else {
          console.log('⚠️  后端返回错误状态:', response.status, response.statusText);
        }
      } catch (error) {
        console.log('❌ 后端连通性测试失败');
        console.error('错误详情:', error);
        console.log('💡 建议：');
        console.log('  1. 检查后端服务是否启动');
        console.log('  2. 检查后端地址配置是否正确');
        console.log('  3. 检查是否存在 CORS 问题');
        console.log('  4. 可以尝试使用 api.useMock() 切换到 Mock 模式进行开发');
      }
    }
  };
  
  return tool;
};

// 创建全局调试工具
if (typeof window !== 'undefined') {
  (window as any).api = createApiDebugTool();
  
  // 在开发环境自动显示使用提示
  if (import.meta.env.DEV) {
    console.log('🛠️  API 调试工具已加载');
    console.log('💡 在控制台输入 api.status() 查看当前配置');
    console.log('💡 输入 api.useMock() 或 api.useReal() 切换 API 模式');
  }
}

export { createApiDebugTool };
export type { ApiDebugTool };