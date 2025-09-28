# 双向转诊服务模块规划

> 目标：在 1 周内基于现有 `medical-union-front` 项目交付一套可演示的双向转诊原型页面，覆盖门诊与住院两条双向转诊路径，并完整串联社区医生、接诊医院医生与患者三个角色的操作闭环。

## 1. 业务背景与定位
- 建立医联体内的上下转诊闭环，遵循分级诊疗要求。
- 在前端原型中实现转诊单填写、审核接收、诊疗反馈与社区回访等关键节点的交互。
- 通过本地 Mock 数据模拟病历标签、转诊状态流转与资料共享，支撑演示。

## 2. 关键角色与使用场景
| 角色 | 核心诉求 | 主要页面 | 备注 |
| --- | --- | --- | --- |
| 社区责任医生（上转发起方） | 筛选患者、创建上转单、查看回执、完成随访 | `CommunityReferralForm`, `CommunityReferralOutbox`, `FollowUpTasks` | 归类在 `/doctor` 工作台下，以「社区医生」视角呈现 |
| 接诊医院医生（下级接收方） | 审核转诊、安排门诊/住院、填写反馈、回传资料 | 复用现有 `ReferralManagement` 并新增 `ReferralFeedbackDrawer`、`InpatientWorkflow` | 同属 `/doctor` 工作台，可通过用户类型切换列表视图 |
| 患者及家属 | 查看转诊进度、收到注意事项、确认诊疗结果 | `PatientReferrals` 扩展 | 已有页面，补充状态轴和注意事项提示 |

## 3. 核心流程（按时间线）
1. **社区医生回访与筛查**：选择符合转诊标准的患者 → 在表单中选择门诊/住院路径 → 上传标签化病历资料。
2. **提交并告知患者**：生成转诊单（含注意事项）→ 患者收到通知（可在患者端查看）。
3. **接诊医院审核**：医院医生在待办列表中查看详情 → 接收/退回 → 分支决策。
   - **门诊路径**：安排门诊 → 完成诊疗 → 填写门诊下转单（含诊断结果、治疗方案、随访建议）。
   - **住院路径**：安排住院 → 住院过程可补充病程记录 → 出院时填写住院下转单并回传。
4. **社区医生回访**：收到下转单后创建随访任务 → 记录患者恢复情况 → 归档。

## 4. 页面与交互拆分
### 4.1 社区医生端（/doctor/community）
1. **`CommunityReferralForm.vue`**
   - Step Form（患者选择 → 转诊类型 → 病历标签 & 附件 → 注意事项确认）。
   - 提交后写入 Mock `referrals`，状态置为 `pending`。
2. **`CommunityReferralOutbox.vue`**
   - 列表展示已提交的转诊单（状态、目标医院、更新时间）。
   - 支持筛选门诊/住院、按状态排序、重新下载转诊单。
   - 当医院反馈到达时显示提醒徽标。
3. **`FollowUpTasksDrawer.vue`**
   - 从 Outbox 中打开，填写随访记录、回访时间、评估表。
   - 提交后将转诊状态置为 `followed-up`。

### 4.2 接诊医院医生端（/doctor/referrals）
在现有 `ReferralManagement.vue` 基础上扩展：
- 列表项新增标签（门诊/住院）、病历标签、创建人等。
- 审批抽屉拆分为两个 tab：
  1. **`ReferralIntakeTab`**：展示上转信息 + 接收/退回操作。
  2. **`TreatmentFeedbackTab`**：接收后打开，门诊/住院路径切换不同字段。
- 追加状态：`pending` → `accepted` → `outpatient-completed` / `inpatient-completed` → `returned`（已回访）。
- 支持上传诊疗材料（模拟文件名列表）。

### 4.3 患者端（/patient/referrals）
- 使用时间轴组件渲染关键节点（提交、接收、诊疗完成、回访）。
- 显示注意事项列表、预约提醒、反馈表链接（Mock 链接即可）。
- 支持下载门诊/住院反馈单（使用本地生成的 JSON/Markdown）。

### 4.4 共享组件
- **`ReferralStatusTag.vue`**：统一状态颜色与文案。
- **`ReferralTimeline.vue`**：在医生端与患者端复用。
- **`ReferralAttachments.vue`**：处理文件列表的上传、预览、删除（仅前端）。

## 5. Mock 数据设计
### 5.1 数据结构（拟定在 `src/api/mock/referrals.ts` 中）
```ts
export interface ReferralCase {
  id: string;
  patientId: string;
  patientName: string;
  direction: 'upward' | 'downward';
  transferType: 'outpatient' | 'inpatient';
  fromHospital: string;
  toHospital: string;
  tags: string[];             // 病历标签
  attachments: string[];      // 文件名
  note?: string;              // 社区医生注意事项
  status: 'pending' | 'accepted' | 'outpatient-completed' | 'inpatient-completed' | 'followed-up' | 'rejected';
  createdAt: string;
  handledAt?: string;
  handledBy?: string;
  treatmentPlan?: string;     // 医院反馈（门诊）
  inpatientReport?: {         // 医院反馈（住院）
    admissionDate: string;
    dischargeDate?: string;
    summary?: string;
    advice?: string;
  };
  followUp?: {
    doctorId: string;
    visitedAt: string;
    remarks: string;
  };
}
```

### 5.2 Mock API 函数
| 方法 | 用途 |
| --- | --- |
| `createReferral(payload)` | 社区医生提交转诊单 |
| `fetchReferrals(filter)` | 列表查询（支持角色、状态、类型、分页） |
| `fetchReferralById(id)` | 详情获取（含患者信息） |
| `updateReferralStatus(id, status, payload)` | 医院接收、完结或拒绝 |
| `attachTreatmentReport(id, report)` | 上传门诊/住院反馈 |
| `recordFollowUp(id, followUpData)` | 社区医生回访 |

> 初期可以全部驻留在内存数组，并在 `localStorage` 做持久化缓存，确保刷新后数据不丢失。

## 6. 迭代节奏（1 周）
- **Day 1-2**：搭建路由骨架与空页面组件；完成 Mock API 的基础增删查改。
- **Day 3**：实现社区医生端表单 & Outbox 列表；联调提交 → 列表更新。
- **Day 4**：扩展 `ReferralManagement` 的审核流程与门诊反馈表单。
- **Day 5**：实现住院反馈表单与患者端时间轴视图；完善状态颜色。
- **Day 6**：补充随访抽屉、Mock 文件上传、交互细节；编写演示脚本。
- **Day 7**：整体验收、整理演示数据、录屏或准备演示环境。

## 7. 演示场景脚本（概要）
1. 社区医生登录 → 创建住院转诊单 → 提示患者注意事项。
2. 切换到接诊医生账号 → 审核并接收 → 填写住院治疗报告。
3. 切换到患者端 → 查看时间轴、下载反馈单。
4. 回到社区医生 → 完成随访填写 → 状态变为“已回访”。

## 8. 依赖与风险
- **组件复用**：需抽象状态标签、时间轴，避免重复实现。
- **角色切换**：短期内通过本地 `localStorage` 模拟用户类型，确保演示流畅。
- **Mock 数据一致性**：注意序列化/反序列化时间字段，保障时间轴顺序正确。
- **后续扩展**：若甲方确认需要管理员审核，可在后续迭代中在 `DoctorWorkspace` 下新增“管理员审批” tab，无须重构现有页面。

---
如需调整命名或展示顺序，请在后续文档迭代中同步更新。