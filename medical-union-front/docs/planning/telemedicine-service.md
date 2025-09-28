# 远程医疗服务流程规划

> 目标：在现有 `medical-union-front` 前端框架上，于 1 周内交付远程医疗申请、审核安排、专家诊断与报告反馈的互动原型，实现跨角色流程的演示。

## 1. 业务背景与定位
- 远程医疗需贯通基层申报、管理员调度、专家会诊与报告反馈，提升优质医疗资源下沉效率。
- 当前阶段以 Mock 数据驱动前端展示，重点呈现流程节点、资料上传、状态流转和多角色协同。
- 需紧贴流程图“申请端 → 管理端 → 专家端 → 申请端反馈”的闭环，确保每步有对应页面交互。

## 2. 角色与核心任务
| 角色 | 主要诉求 | 页面模块 | 说明 |
| --- | --- | --- | --- |
| 申请端（基层医生/患者） | 提交申请、上传病历、查看安排、评价诊断 | `TelemedicineApply`, `TelemedicineMyCases`, `TelemedicineFeedback` | 患者端已有 `TelemedicineApply.vue`，可扩展复用 |
| 管理端（运营/调度员） | 审核申请、安排专家、协调时间方式、跟踪状态 | `TelemedicineAdminBoard`, `TelemedicineScheduleDrawer` | 可在 `/doctor` 下以“管理员视图”切换展示 |
| 专家端（上级医院医生） | 查看安排、接入会诊、填写诊断报告 | `TelemedicineExpertWorkbench`, `TelemedicineReportForm` | 新建路由或在 `/doctor` 侧加入“专家模式” |
| 申请端回访 | 查看诊断结果、提交满意度 | `TelemedicineFeedback.vue` | 可与 `TelemedicineMyCases` 结合呈现 |

## 3. 流程拆解
1. **申请端**：填写申请单 → 上传病历资料 → 选择偏好会诊方式 → 提交后状态为 `pending`。
2. **管理端**：在待办列表审核 → 若通过，安排专家、时间、会诊方式（生成会议链接/说明） → 状态更新为 `scheduled`。
3. **专家端**：接收安排提醒 → 会诊前确认资料 → 会诊后填写诊断报告并上传附件 → 状态改为 `completed`。
4. **申请端反馈**：申请人查看报告，填写评价/复盘问题 → 流程结束，状态记为 `closed`。

## 4. 页面与交互规划
### 4.1 申请端（患者/基层医生）
1. **`TelemedicineApply.vue`（现有页面增强）**
   - 增加申请进度提示：`待审核 → 已安排 → 会诊中 → 已完成`。
   - 支持多附件管理、病历标签选择（与双向转诊共享组件）。
   - 点击提交后调用 `createTelemedicineApplication`。
2. **`TelemedicineMyCases.vue`**
   - 列表展示我的申请：状态、专家、安排方式、会议链接。
   - 点开详情抽屉显示完整资料与时间轴。
   - 当状态为 `completed` 时提供进入反馈表单的按钮。
3. **`TelemedicineFeedback.vue`**
   - 评分控件（1-5 星）、文字评价、是否解决问题复选。
   - 提交后调用 `submitTelemedicineFeedback` 并更新案例的 `feedback` 字段。

### 4.2 管理端（审核/调度）
1. **`TelemedicineAdminBoard.vue`**
   - 顶部统计卡片：待审核、已安排、今日会诊、逾期。
   - 列表筛选：状态、申请医院、疾病标签。
   - 操作按钮：查看申请 → 审核通过/退回 → 打开安排抽屉。
2. **`TelemedicineScheduleDrawer.vue`**
   - 表单字段：指定专家、日期、时间段、方式（视频/电话/图文）、会议链接输入/生成按钮。
   - 提交后调用 `scheduleTelemedicineCase`，状态变 `scheduled`。
3. **`TelemedicineCaseTimeline.vue`**（共享组件）
   - 显示申请、审核、安排、会诊、报告、反馈等节点，供管理端/申请端使用。

### 4.3 专家端
1. **`TelemedicineExpertWorkbench.vue`**
   - 列表：待会诊案例、已完成案例。
   - 快速查看病历附件、申请说明、安排信息。
   - 操作：进入诊断（打开报告表单）、标记进行中。
2. **`TelemedicineReportForm.vue`**
   - 编辑诊断结论、处置建议、复诊安排。
   - 上传会诊记录附件、处方 PDF（Mock 文件名）。
   - 提交后调用 `completeTelemedicineCase`，状态 `completed`，记录 `report` 字段。

### 4.4 共享/辅助组件
- `TelemedicineStatusBadge.vue`：统一状态标签与颜色。
- `MedicalAttachmentList.vue`：共用附件上传/预览（与双向转诊模块共用）。
- `ExpertSelector.vue`：下拉或搜索专家（来自 Mock `experts` 数据）。

## 5. Mock 数据设计
### 5.1 数据结构（扩展 `src/api/mock/telemedicine.ts`）
```ts
export interface TelemedicineCase {
  id: string;
  applicantId: string;
  applicantName: string;
  patientId: string;
  patientName: string;
  description: string;
  attachments: string[];
  preferredMethod: 'video' | 'phone' | 'text';
  preferredSlot?: string;
  status: 'pending' | 'rejected' | 'scheduled' | 'in-progress' | 'completed' | 'closed';
  assignedDoctor?: string;
  assignedDoctorName?: string;
  schedule?: {
    date: string;
    startTime: string;
    endTime: string;
    method: 'video' | 'phone' | 'text';
    meetingLink?: string;
    preparedBy: string; // admin id
  };
  report?: {
    diagnosis: string;
    suggestion: string;
    attachmentNames: string[];
    submittedAt: string;
  };
  feedback?: {
    rating: number;
    comment?: string;
    submittedAt: string;
  };
  auditTrail: Array<{ step: string; by: string; at: string; note?: string }>;
  createdAt: string;
  updatedAt: string;
}
```

### 5.2 Mock API 函数
| 函数 | 功能 |
| --- | --- |
| `createTelemedicineApplication(payload)` | 新增远程会诊申请 |
| `fetchTelemedicineCases(filter)` | 按角色/状态获取案例列表 |
| `reviewTelemedicineCase(id, action, note)` | 审核通过或退回 |
| `scheduleTelemedicineCase(id, schedule)` | 管理端安排专家与时间 |
| `startTelemedicineCase(id)` | 专家进入会诊，状态设为 `in-progress` |
| `completeTelemedicineCase(id, report)` | 专家提交诊断报告 |
| `submitTelemedicineFeedback(id, feedback)` | 申请端评价 |
| `getTelemedicineCaseById(id)` | 详情获取，用于时间轴与抽屉 |

> 可以复用现有 `telemedicine.ts` 作为基础，添加字段和函数，并在 localStorage 中序列化存储。

## 6. 开发节奏建议（1 周）
- **Day 1**：完善 Mock 结构，补充案例字段与 `experts` 数据源；搭建路由骨架（申请端/管理端/专家端）。
- **Day 2**：增强 `TelemedicineApply` 并实现 `TelemedicineMyCases` 列表。
- **Day 3**：开发管理端工作台，联调审核与安排流程。
- **Day 4**：完成专家端工单列表与报告表单，打通 `scheduled → completed`。
- **Day 5**：实现申请端反馈与时间轴组件；完善状态标签。
- **Day 6**：补齐附件上传、会议链接生成占位、错误处理和提示。
- **Day 7**：全流程自测、准备演示案例与脚本。

## 7. 演示脚本建议
1. 申请端提交会诊申请（附病历资料），查看到“待审核”。
2. 管理端审核通过并安排专家、时间，会诊状态变为“已安排”，显示会议链接。
3. 专家端查看安排 → 填写诊断报告并提交，案例状态变“已完成”。
4. 申请端查看报告并提交满意度评价，流程结束，状态为“已关闭”。

## 8. 风险与注意事项
- **角色切换**：短期通过视图切换或 Mock 用户登录信息实现；正式版需引入权限控制。
- **会议链接生成**：演示阶段可提供伪链接或随机字符串，后续可与真实视频系统对接。
- **附件体量**：仅展示文件名列表及下载按钮；待后端支持后再处理上传存储。
- **状态一致性**：每次状态变更需写入 `auditTrail`，供时间轴与审计使用。
- **专家排班冲突**：演示可忽略或简单提示；若需高级排班逻辑，后续迭代补充。

---
该文档为远程医疗模块的页面设计、Mock 数据方案和开发节奏提供基础。如需增加收费、支付或第三方平台接入，可在后续迭代中拓展。