import { createApp } from 'vue';
import ArcoVue from '@arco-design/web-vue';
import ArcoVueIcon from '@arco-design/web-vue/es/icon';
import '@arco-design/web-vue/dist/arco.css';
import './styles/global.less';

import App from './App.vue';
import router from './router';

// 在开发环境加载 API 调试工具
if (import.meta.env.DEV) {
  import('./utils/apiDebug');
}

const app = createApp(App);

app.use(ArcoVue);
app.use(ArcoVueIcon);
app.use(router);

app.mount('#app');
