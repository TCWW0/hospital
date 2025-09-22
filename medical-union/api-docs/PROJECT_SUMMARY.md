# 项目阶段性总结（Medical Union 前端）

## 项目背景

Medical Union 是一个面向医院/诊所的医疗管理前端应用，当前工作聚焦于医生端（Doctor Workspace）与管理后台（Admin）。前端使用 Vue 3 + TypeScript + Vite，并使用 Arco Design 作为 UI 组件库。

## 当前实现（高层）

- 技术栈：Vue 3（Composition API）+ TypeScript + Vite + Arco Design
- 前端结构：
  - `src/components`：PatientCard、ReferralCard、MiniTrendChart、DashboardSummary 等组件
  - `src/views/doctor`：Doctor 页面集合（Dashboard、DoctorPatients、PatientManagement、ReferralManagement 等）
  - `src/api`：API wrapper、OpenAPI 草案与 mock 工具
  - `src/utils/request.ts`：基于 axios 的请求封装（支持 envelope 兼容）
- Mock：已添加 `mock/db.json` 与 `mock/routes.json`，并在 `package.json` 中添加 `mock` 与 `mock:quick` 脚本（json-server / npx json-server）
- API 文档：已草拟 OpenAPI（`src/api/openapi-patients.yaml`）以及开发者友好说明（`src/api/PATIENTS_API.md`），并将文档集中于 `medical-union/api-docs/` 目录。

## 已完成的关键项

- Dashboard MVP（最近患者列表、KPI 概览、微型趋势图）
- PatientCard 组件（compact/large 变体、avatar 未读点、点击打开行为）
- MiniTrendChart（hover tooltip）
- OpenAPI 草案（patients）与 REFERRAL API 文档草案
- Mock JSON 数据（`mock/db.json`）与 json-server 脚本
- `src/utils/request.ts` 已兼容 json-server 的非-envelope 返回

## 待办（高优先级）

1. 前端接入 Mock API 并全面测试页面交互（Dashboard、患者管理、转诊）
2. 完成 Patients OpenAPI 的细化并与后端确认字段与错误码
3. 后端存根/实现（Spring Boot + MyBatis）
4. 契约测试（Prism 或 Dredd），并加入 CI

## 演示/验收条件

- 能在本地通过 `npm run mock` + `npm run dev` 运行并访问医生端页面，页面展示来自 mock 的数据。
- Dashboard 能正确显示最近 4 位患者，患者详情页面能打开并显示 visits 列表。
- 关键流程（患者搜索、查看详情、转诊列表）无 JS 错误，Network 返回 200 且数据结构与 OpenAPI 保持一致。

## 推荐的交付节奏

- Phase 1（快速演示）：完成 Mock 验证并收集需求反馈（1 周）
- Phase 2（后端存根）：基于 OpenAPI 生成后端存根并对接前端（1-2 周）
- Phase 3（端到端）：完成后端实现、契约测试与 CI（2-4 周，取决于后端需求与数据量）

## 联系点

- 前端入口：`medical-union-front/src/main.ts`
- Mock 数据：`medical-union-front/mock/db.json`
- OpenAPI 源：`medical-union-front/src/api/openapi-patients.yaml` / `medical-union/api-docs/openapi-patients.yaml`

***

请告诉我是否需要把此文件转换为 PDF 或导出给后端团队，并且是否需要我马上开始生成后端的 Spring Boot 存根（我可以基于 OpenAPI 自动生成 Controller/DTO/Mapper 草案）。