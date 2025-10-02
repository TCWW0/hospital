import { http } from '@/utils/request';

export const systemApi = {
  getHealth: () => http.get('/actuator/health')
};

export type SystemApi = typeof systemApi;
