import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: {
      title: '登录 - 医联体管理系统',
      requiresAuth: false
    }
  },
  {
    path: '/doctor',
    name: 'DoctorWorkspace',
    component: () => import('@/views/DoctorWorkspace.vue'),
    meta: {
      title: '医生工作台 - 医联体管理系统',
      requiresAuth: true,
      roles: ['DOCTOR']
    },
    children: [
      {
        path: '',
        name: 'DoctorDashboard',
        component: () => import('@/views/doctor/Dashboard.vue'),
        meta: {
          title: '工作台首页',
          requiresAuth: true,
          roles: ['DOCTOR']
        }
      },
      {
        path: 'patients',
        name: 'PatientManagement',
        component: () => import('@/views/doctor/DoctorPatients.vue'),
        meta: {
          title: '患者管理',
          requiresAuth: true,
          roles: ['DOCTOR']
        }
      },
      {
        path: 'referrals',
        name: 'ReferralManagement',
        component: () => import('@/views/doctor/ReferralManagement.vue'),
        meta: {
          title: '转诊管理',
          requiresAuth: true,
          roles: ['DOCTOR']
        }
      },
      {
        path: 'telemedicine',
        name: 'DoctorTelemedicine',
        component: () => import('@/views/doctor/TelemedicineList.vue'),
        meta: { title: '远程医疗申请', requiresAuth: true, roles: ['DOCTOR'] }
      },
      {
        path: 'statistics',
        name: 'DoctorStatistics',
        component: () => import('@/views/doctor/Statistics.vue'),
        meta: {
          title: '数据统计',
          requiresAuth: true,
          roles: ['DOCTOR']
        }
      }
    ]
  },
  {
    path: '/patient',
    name: 'PatientCenter',
    component: () => import('@/views/PatientCenter.vue'),
    meta: {
      title: '患者个人中心 - 医联体管理系统',
      requiresAuth: true,
      roles: ['PATIENT']
    },
    children: [
      {
        path: '',
        name: 'PatientDashboard',
        component: () => import('@/views/patient/Dashboard.vue'),
        meta: {
          title: '个人中心',
          requiresAuth: true,
          roles: ['PATIENT']
        }
      },
      {
        path: 'profile',
        name: 'PatientProfile',
        component: () => import('@/views/patient/Profile.vue'),
        meta: {
          title: '个人信息',
          requiresAuth: true,
          roles: ['PATIENT']
        }
      },
      {
        path: 'visits',
        name: 'PatientVisits',
        component: () => import('@/views/patient/Visits.vue'),
        meta: {
          title: '就诊记录',
          requiresAuth: true,
          roles: ['PATIENT']
        }
      },
      {
        path: 'referrals',
        name: 'PatientReferrals',
        component: () => import('@/views/patient/Referrals.vue'),
        meta: {
          title: '转诊记录',
          requiresAuth: true,
          roles: ['PATIENT']
        }
      }
      ,
      {
        path: 'hospitals',
        name: 'HospitalList',
        component: () => import('@/views/patient/HospitalList.vue'),
        meta: { title: '医院列表', requiresAuth: true, roles: ['PATIENT'] }
      },
      {
        path: 'hospital',
        name: 'HospitalOverview',
        component: () => import('@/views/patient/HospitalDetail.vue'),
        meta: { title: '医院', requiresAuth: true, roles: ['PATIENT'] }
      },
      {
        path: 'hospital/:id',
        name: 'HospitalDetail',
        component: () => import('@/views/patient/HospitalDetail.vue'),
        meta: { title: '医院详情', requiresAuth: true, roles: ['PATIENT'] }
      },
      {
        path: 'hospital/:id/department/:deptId',
        name: 'HospitalDepartmentIntro',
        component: () => import('@/views/patient/HospitalDepartmentIntro.vue'),
        meta: { title: '科室介绍', requiresAuth: true, roles: ['PATIENT'] }
      },
      {
        path: 'doctors',
        name: 'DoctorList',
        component: () => import('@/views/patient/DoctorList.vue'),
        meta: { title: '医生查询', requiresAuth: true, roles: ['PATIENT'] }
      },
      {
        path: 'doctor/:id',
        name: 'DoctorDetail',
        component: () => import('@/views/patient/DoctorDetail.vue'),
        meta: { title: '医生详情', requiresAuth: true, roles: ['PATIENT'] }
      },
      {
        path: 'doctor/:id/schedule',
        name: 'DoctorSchedule',
        component: () => import('@/views/patient/DoctorSchedule.vue'),
        meta: { title: '医生排班', requiresAuth: true, roles: ['PATIENT'] }
      },
      {
        path: 'appointment/confirm',
        name: 'AppointmentConfirm',
        component: () => import('@/views/patient/AppointmentConfirm.vue'),
        meta: { title: '挂号确认', requiresAuth: true, roles: ['PATIENT'] }
      },
      {
        path: 'appointment/voucher/:id',
        name: 'AppointmentVoucher',
        component: () => import('@/views/patient/AppointmentVoucher.vue'),
        meta: { title: '挂号凭证', requiresAuth: true, roles: ['PATIENT'] }
      },
      {
        path: 'appointments',
        name: 'MyAppointments',
        component: () => import('@/views/patient/MyAppointments.vue'),
        meta: { title: '我的预约', requiresAuth: true, roles: ['PATIENT'] }
      },
      {
        path: 'visit/:id',
        name: 'VisitDetail',
        component: () => import('@/views/patient/VisitDetail.vue'),
        meta: { title: '就诊详情', requiresAuth: true, roles: ['PATIENT'] }
      },
      {
        path: 'telemedicine/apply',
        name: 'TelemedicineApply',
        component: () => import('@/views/patient/TelemedicineApply.vue'),
        meta: { title: '申请远程医疗', requiresAuth: true, roles: ['PATIENT'] }
      }
    ]
  },
  {
    path: '/admin',
    name: 'AdminPanel',
    component: () => import('@/views/AdminPanel.vue'),
    meta: {
      title: '管理员后台 - 医联体管理系统',
      requiresAuth: true,
      roles: ['ADMIN']
    },
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/Dashboard.vue'),
        meta: {
          title: '系统概览',
          requiresAuth: true,
          roles: ['ADMIN']
        }
      },
      {
        path: 'users',
        name: 'UserManagement',
        component: () => import('@/views/admin/UserManagement.vue'),
        meta: {
          title: '用户管理',
          requiresAuth: true,
          roles: ['ADMIN']
        }
      },
      {
        path: 'hospitals',
        name: 'HospitalManagement',
        component: () => import('@/views/admin/HospitalManagement.vue'),
        meta: {
          title: '医院管理',
          requiresAuth: true,
          roles: ['ADMIN']
        }
      },
      {
        path: 'statistics',
        name: 'AdminStatistics',
        component: () => import('@/views/admin/Statistics.vue'),
        meta: {
          title: '数据统计',
          requiresAuth: true,
          roles: ['ADMIN']
        }
      }
    ]
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/404.vue'),
    meta: {
      title: '页面不存在 - 医联体管理系统',
      requiresAuth: false
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  }
});

// 路由守卫
router.beforeEach((to, _from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title as string;
  }

  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('medical_union_token');
    const userInfo = localStorage.getItem('medical_union_user');
    
    if (!token || !userInfo) {
      // 未登录，跳转到登录页
      next('/login');
      return;
    }

    try {
      const user = JSON.parse(userInfo);
      
      // 检查角色权限
      if (to.meta.roles && Array.isArray(to.meta.roles)) {
        if (!to.meta.roles.includes(user.userType)) {
          // 权限不足，根据用户角色跳转到对应页面
          switch (user.userType) {
            case 'DOCTOR':
              next('/doctor');
              break;
            case 'PATIENT':
              next('/patient');
              break;
            case 'ADMIN':
              next('/admin');
              break;
            default:
              next('/login');
          }
          return;
        }
      }
      
      next();
    } catch (error) {
      // 用户信息解析失败，清除数据并跳转到登录页
      localStorage.removeItem('medical_union_token');
      localStorage.removeItem('medical_union_user');
      next('/login');
    }
  } else {
    // 不需要认证的页面直接通过
    next();
  }
});

export default router;