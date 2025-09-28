# 双向转诊模块开发路线图（开发记忆）

> 说明：本路线图基于 2025-09-27 的需求拆解，用于指导双向转诊原型的快速实现与演示准备。请在开发过程中根据实际反馈更新此文档。

## 一、数据与 Mock 层
1. **扩展数据结构**
   - 字段：`direction`, `transferType`, `tags`, `attachments`, `status`, `treatmentPlan`, `inpatientReport`, `followUp`, `auditTrail` 等。
   - 状态流转：`pending → accepted → outpatient-completed/inpatient-completed → followed-up`，支持 `rejected` 分支。
2. **Mock API**
   - `createReferral(payload)`：社区医生提交转诊单。
   - `fetchReferrals(filter)`：支持按角色、状态、方向、分页查询。
   - `fetchReferralById(id)`：返回详情及关联患者信息。
   - `updateReferralStatus(id, status, note)`：接诊医院接收/拒绝。
   - `attachTreatmentReport(id, report)`：上传门诊/住院反馈。
   - `recordFollowUp(id, followUp)`：社区医生随访。
   - （可选）`exportReferral(id)`：生成演示使用的反馈/转诊单文本。
3. **持久化策略**
   - 将 Mock 数组序列化到 `localStorage`，确保刷新后数据仍可演示。

## 二、社区责任医生视角
| 页面/组件 | 功能摘要 | 数据接口 |
| --- | --- | --- |
| `CommunityReferralForm.vue` | 多步骤表单：患者选择 → 转诊类型 → 病历标签/附件 → 注意事项。提交后提示患者注意事项。 | `fetchPatients`, `createReferral` |
| `CommunityReferralOutbox.vue` | 列表查看我发起的转诊单，支持筛选/排序，进入详情抽屉。 | `fetchReferrals` (direction=upward) |
| `FollowUpDrawer.vue` | 填写随访时间、结果、备注，更新状态为 `followed-up`。 | `recordFollowUp` |
| `ReferralTimeline.vue`（共享） | 在抽屉中展示流程时间轴、反馈、随访记录。 | `auditTrail` 数据 |

## 三、接诊医院医生视角
| 组件 | 功能 | 接口 |
| --- | --- | --- |
| `ReferralManagement.vue`（现有） | 列表增强：显示转诊类型、标签，仅展示 `direction='inbound'`。 | `fetchReferrals` |
| 审批抽屉扩展 | Tab 分栏：申请信息、处理记录。接收/拒绝操作保留。 | `updateReferralStatus` |
| `TreatmentFeedbackDrawer.vue` | 根据 `transferType` 显示门诊或住院反馈表，提交后更新状态并写入 `auditTrail`。 | `attachTreatmentReport` |

## 四、患者端视角
| 页面 | 功能 | 接口 |
| --- | --- | --- |
| `PatientReferrals.vue` | 时间轴展示关键节点（提交、接收、诊疗、随访）、注意事项、治疗方案。支持下载反馈单（Mock）。 | `fetchReferrals` (patientId), `fetchReferralById`, `exportReferral` |
| （可选）`PatientFeedbackDrawer.vue` | 患者补充自我感受，可作为随访参考。 | `recordFollowUp` 或新增接口 |

## 五、共享组件与工具
- `ReferralStatusTag.vue`：统一状态样式。
- `ReferralAttachments.vue`：上传/预览附件（前端模拟）。
- `useReferralStore.ts`（可选）：封装列表缓存与批量刷新逻辑。

## 六、迭代节奏建议
| 日程 | 关键任务 |
| --- | --- |
| Day 1 | Mock 数据结构升级 + `createReferral` 等接口。搭建患者端时间轴基础。 |
| Day 2 | 完成社区医生表单与发件箱联调。 |
| Day 3 | 扩展接诊医生列表、审批抽屉。 |
| Day 4 | 实现门诊/住院反馈表单，打通状态流转。 |
| Day 5 | 完成患者端时间轴与下载按钮。 |
| Day 6 | 随访抽屉、附件上传、localStorage 持久化。 |
| Day 7 | 自测全流程，准备演示数据与脚本。 |

## 七、演示脚本参考
1. 社区医生创建住院转诊单并告知患者注意事项。
2. 接诊医院医生接收申请，填写住院反馈。
3. 患者查看时间轴与治疗建议，下载反馈单。
4. 社区医生完成随访，状态变为“已回访”。

> 若有新想法或调整，请在此文档底部追加“更新记录”章节，并标注日期与责任人。