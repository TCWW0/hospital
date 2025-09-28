# 健康讲座活动闭环规划

> 目标：结合现有 `medical-union-front` 项目的组件体系，在 1 周内交付一套可演示的健康讲座活动管理页面，模拟讲座申请、通知发布、身份验证、资料上传与报告汇总的完整闭环。

## 1. 业务背景与定位
- 健康讲座是医联体面向社区居民的健康教育举措，需要从申请、审核、执行到总结的全流程在线化。
- 当前阶段聚焦前端原型演示，通过 Mock 数据驱动多角色交互和流程状态变更，无需接通后端。
- 通过身份验证、验证资料上传与报告生成，体现监管与效果评估机制。

## 2. 角色与核心场景
| 角色 | 诉求 | 主要页面 | 说明 |
| --- | --- | --- | --- |
| 讲座申请人（基层机构/医生） | 发起活动申请、补充资料、关注审批进度 | `LectureApply`, `LectureMyEvents` | 归属 `/doctor` 工作台，可根据登录用户类型过滤 |
| 审核/运营人员（可暂并入医生或单独标签） | 审核申请、发布通知、跟踪执行情况 | `LectureBackoffice` | 初期无专门管理员角色，可通过切换视图 Mock |
| 参会居民/患者 | 查看通知、身份验证签到、上传验证材料 | `LectureAttendeePortal` | 可在 `/patient` 侧暴露独立路由 |
| 数据分析/报告查看者 | 查看讲座执行数据与资料汇总 | `LectureReportView` | 演示中由审核人员或医生查看即可 |

## 3. 流程拆解
1. **申请阶段**：申请人填写讲座主题、目标人群、时间地点、讲师与资料 → 提交后进入待审核状态。
2. **审核发布**：审核人员查看申请详情 → 审核通过后发布讲座并生成通知（含二维码/报名链接 Mock）。
3. **参加与验证**：参会者接收通知 → 现场进行签到（身份验证）与退场签退 → 上传验证信息（照片、问卷、截图）。
4. **资料汇总**：系统/审核人员审核上传资料，统计签到数据，形成总结报告输出。

## 4. 页面与交互规划
### 4.1 申请人视图
1. **`LectureApply.vue`**
   - Step Form：基本信息 → 讲师信息 → 宣传资料 → 审核确认。
   - 支持上传附件（海报、课件）并标签化。
   - 提交后调用 `createLecture()` 写入 Mock。
2. **`LectureMyEvents.vue`**
   - 标签页区分“待审核/已发布/已完成”。
   - 展示进度条、审核意见、通知链接。
   - 可在发布后补充现场负责人、签到设置等信息。

### 4.2 审核/运营视图
1. **`LectureBackoffice.vue`**（数据面板 + 列表 + 抽屉）
   - 待办列表：按状态筛选申请，查看详情，审核通过/退回。
   - 发布操作：填写通知文案、选择推送渠道（Mock）、生成活动码。
   - 执行中监控：实时查看签到人数、上传资料数量（基于 Mock 定时刷新或手动刷新）。
2. **`LectureExecutionMonitor.vue`**（可作为抽屉或嵌入组件）
   - 时间线展示：发布 → 签到开始 → 讲座进行 → 签退 → 资料齐全。
   - 支持勾选“资料已审阅”，推动流程进入总结阶段。

### 4.3 参会者门户
1. **`LectureAttendeePortal.vue`**
   - 输入活动码进入 → 展示讲座信息。
   - 提供签到与签退两个按钮，需进行身份验证（手机号/居民卡号）。
   - 上传验证资料（图片名称列表即可），状态同步至 Mock。
2. **`LectureCertificate.vue`**（可选）
   - 根据验证记录生成参与证明（PDF/图片 Mock）。

### 4.4 报告与复盘
1. **`LectureReportView.vue`**
   - 数据卡片：报名 vs 签到人数、签到通过率、资料提交率。
   - 列表：参会者明细、上传资料预览、审核状态。
   - 导出按钮：生成 JSON/CSV Mock 文件，或触发浏览器下载。
2. **共享组件**
   - `LectureStatusBadge.vue`：统一状态文案及颜色。
   - `LectureTimeline.vue`：复用执行过程时间轴。
   - `VerificationUploadList.vue`：上传与预览组件，供运营与参会者共享。

## 5. Mock 数据设计
### 5.1 数据结构 (`src/api/mock/lectures.ts`)
```ts
export interface LectureEvent {
  id: string;
  title: string;
  topicTags: string[];
  targetAudience: string;
  schedule: {
    start: string;
    end: string;
    location: string;
    format: 'online' | 'offline' | 'hybrid';
  };
  lecturer: {
    name: string;
    title?: string;
    hospital?: string;
  };
  attachments: string[];
  status: 'draft' | 'pending' | 'published' | 'ongoing' | 'completed' | 'closed';
  publishInfo?: {
    noticeLink: string;
    qrCode?: string; // base64 mock
    publishedAt: string;
  };
  verificationRules: {
    requireCheckin: boolean;
    requireCheckout: boolean;
    fields: Array<'idCard' | 'phone' | 'reservationCode'>;
  };
  metrics: {
    registered: number;
    checkins: number;
    checkouts: number;
    uploads: number;
  };
  submissions: LectureSubmission[];
  auditTrail: Array<{ action: string; by: string; at: string; note?: string }>;
}

export interface LectureSubmission {
  participantId: string;
  participantName: string;
  checkinAt?: string;
  checkoutAt?: string;
  uploads: string[];
  verifiedByStaff?: boolean;
  notes?: string;
}
```

### 5.2 Mock API 函数
| 函数 | 功能 |
| --- | --- |
| `createLecture(payload)` | 新增讲座申请 |
| `fetchLectures(filter)` | 根据角色/状态获取列表 |
| `updateLectureStatus(id, status, extra)` | 审核、发布、关闭 |
| `recordCheckin(id, participant)` | 参会者签到 |
| `recordCheckout(id, participant)` | 参会者签退 |
| `uploadVerification(id, participantId, files)` | 上传资料列表 |
| `generateLectureReport(id)` | 汇总数据（返回 JSON 对象） |

> 建议将 `LectureEvent` 保存在数组中，并同步写入 `localStorage` 以保持刷新稳定性。

## 6. 开发节奏建议（1 周）
- **Day 1**：搭建基础路由（申请人视图/后台视图/参会门户），初始化 Mock 接口与数据结构。
- **Day 2**：完成 `LectureApply` 表单与 `createLecture` 联调；实现申请列表。
- **Day 3**：实现后台审核页面，联调状态流转（pending→published）。
- **Day 4**：开发参会门户签到/签退与资料上传逻辑，确保数据回写。
- **Day 5**：实现执行监控时间轴与基础数据统计，完善 Mock 自动累积指标。
- **Day 6**：完成报告页面、导出 Mock；补充 UI 细节与错误提示。
- **Day 7**：自测全流程、准备演示脚本与样例数据。

## 7. 演示脚本（建议）
1. 申请人登录 → 创建新讲座 → 查看待审核列表。
2. 切换到审核视图 → 审核通过并发布 → 展示通知链接。
3. 使用参会门户输入活动码 → 完成签到并上传材料 → 返回后台刷新，看到验证数据更新。
4. 在报告页面查看签到率、资料列表 → 导出报告。

## 8. 风险与注意事项
- **角色模拟**：短期内通过视图切换或 mock 用户角色实现，避免复杂权限逻辑。
- **身份验证**：前端仅做格式校验，抽象出可扩展字段，为后续接入二次验证留接口。
- **附件占位**：演示阶段只需展示文件名与缩略图占位；若需预览，可用静态图片替换。
- **数据一致性**：签到、签退与上传需绑定同一 `participantId`，Mock 层应确保查找/合并逻辑正确。

---
此文档将指导健康讲座模块的页面搭建、Mock 数据实现及演示准备，如需新增管理员角色或复杂通知机制，可在未来迭代中补充。