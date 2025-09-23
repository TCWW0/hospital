# 项目结构摘要

本文件基于前端源码与 mock API 快速梳理项目结构，帮助后端数据库设计对齐前端需求。

目录（与页面/功能对应）

- src/views/
  - patient/
    - PatientCenter.vue - 患者主布局（侧边栏、顶部导航、内容插槽）
    - Dashboard.vue - 患者首页 summary
    - Profile.vue - 个人信息管理
    - MyAppointments.vue - 我的预约（订单列表、搜索、筛选）
    - TelemedicineApply.vue - 远程医疗申请（提交、附件、预览）
    - DoctorList.vue / DoctorDetail.vue / DoctorSchedule.vue - 医生查询与排班、预约入口
    - HospitalList.vue / HospitalDetail.vue - 医院与科室展示
    - Referrals.vue - 转诊记录
  - doctor/
    - TelemedicineList.vue - 医生端查看远程医疗申请
    - ReferralManagement.vue / ReferralDetail.vue - 转诊管理
  - admin/
    - Dashboard / UserManagement / HospitalManagement - 管理端页面

- src/api/mock/
  - patients.ts - 前端 mock 的患者简化数据（id, name, phone, relation）
  - doctors.ts - 医生信息 mock（id, name, title, specialties, hospitalId, departmentId, avatar, intro）
  - appointments.ts - 预约订单 mock（orderId, patientId, hospitalId, doctorId, date, time, slotType, payment, status, voucher）
  - telemedicine.ts - 远程医疗申请 mock（patientId, description, preferredMethod, attachments, status）
  - schedules.ts - 排班/时隙 mock（供预约页面使用）
  - hospitals.ts - 医院/科室基础数据

页面与后端契约要点（从前端读取）

- 预约流程需要：患者（可为家庭成员）、医生、医院/科室、具体时隙（date + time 区间）、投诉/病情摘要、支付信息、凭证（voucher）。
- 远程医疗申请需要：申请人（当前登录用户）、就诊人（patient）、病情摘要、附件（文件列表/元数据）、首选问诊方式、状态流转（待处理/已安排/已完成/拒绝）、分配医生与排期信息（可选）。
- 排班页面需要按医生+日期查询可预约时隙（含类型 normal/expert/special、剩余名额）。
- 医生信息用于搜索、展示与预约（支持按医院/科室/专业搜索）。

建议后端提供的基础 API：
- /api/patients (GET/POST/PUT)
- /api/patients/{id}
- /api/doctors (GET)
- /api/doctors/{id}
- /api/hospitals, /api/departments
- /api/schedules?doctorId=&date=
- /api/appointments (CRUD)
- /api/telemedicine (CRUD + doctor assignment)
- /api/payments (create/notify/query)

```md
更多设计细节请参见 db-design 文件夹中的数据库草案（Telemedicine and Appointments DDL）。
```
