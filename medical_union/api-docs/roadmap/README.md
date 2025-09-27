# 用户/患者模块分阶段路线图（Roadmap）

说明：本路线图基于 `api-docs/USER_API.md` 的前端草案与当前数据库结构（见 `api-docs/medical_union.sql`）。目标是将需求拆分为可迭代的小阶段，每个阶段均附带：范围、接口清单、数据库依赖/变更、存储过程建议、验收标准与风险提示，便于后续按阶段开发与联调。

目录
- [Phase 1 — 用户基础（/user/me, 修改资料、改密）](./phase-01-user-basics.md)
- [Phase 2 — 患者档案（/patient/profile）](./phase-02-patient-profile.md)
- [Phase 3 — 医院与医生检索](./phase-03-discovery.md)
- [Phase 4 — 医生排班](./phase-04-schedules.md)
- [Phase 5 — 预约挂号](./phase-05-appointments.md)
- [Phase 6 — 远程医疗](./phase-06-telemedicine.md)

通用约定
- 前缀：`/api/v1`
- 认证：除登录/公开检索外，均要求 `Authorization: Bearer <token>`
- 响应包装：`{ code: 200, message: string, data: any }`（失败返回非 200/0）
- 时间：日期推荐 `YYYY-MM-DD`，时间戳使用 ISO8601 或东八区统一

实施建议
- 优先完成 Phase 1/2（用户基础、患者档案），其次是 Phase 3/4（检索与排班），最后推进 Phase 5/6（预约、远程医疗）。
- 每个阶段尽量复用已有表与存储过程，确需新增时保持风格一致（UTF8MB4、timestamp、外键/索引）。
