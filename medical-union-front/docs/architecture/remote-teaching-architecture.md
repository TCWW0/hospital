# 远程教学服务模块架构设计

> 更新日期：2025-10-02

## 模块使命

远程教学服务模块用于支撑医联体内线上线下融合的教学活动，包括教学讨论、查房教学、知识库共享、远程讲座培训、手术直播 / 点播等场景。模块需要实现讲座全流程的可追踪、可验证、可复盘，达成以下目标：

- 面向基层医疗机构提供临床教学及健康教育内容。
- 支撑专家 "传帮带" 的教学互动与档案沉淀。
- 保证参与者身份可信、过程合规、数据可复用。
- 与既有远程医疗、知识库模块互通，形成统一的远程协同体验。

## 角色与职责划分

| 角色 | 描述 | 核心职责 |
| --- | --- | --- |
| **申请人 / 讲座发起人** | 通常是牵头科室或专家团队 | 填写讲座申请、提供大纲及讲师信息、提交资料与需求、在讲座获得批准后协调讲师排期。 |
| **审核人 / 管理员** | 平台运营人员或医联体管理者 | 审查讲座申请、分配资源（直播平台、录播权限等）、发布通知、监控讲座执行、收集验证与反馈、生成报告归档。 |
| **讲师 / 主讲专家** | 被邀请进行授课的专家 | 在直播前完成教学资料准备，按计划授课，配合身份验证，上传课后资料、确认出勤名单。 |
| **参与者（医务人员）** | 需提升技能的基层医生、护理人员等 | 在开课前后完成身份验证、参与听讲、提交观看反馈、下载资料。 |
| **患者 / 大众受众** | 关注健康教育的患者或公众 | 通过患者端入口报名、完成身份认证（简化版），观看讲座、获取健康资料、提交满意度反馈。 |
| **系统服务** | 自动化流程执行者 | 发送通知、触发二次身份验证、统计出勤、生成报告、与知识库/资料库互通。 |

## 关键流程映射

以下对应用户提供的流程图：

1. **申请开展讲座**：申请人填写主题、目标受众、讲师、时间需求及资料清单，提交后进入 `applied` 状态。
2. **审核与排期**：管理员评估资源、审核资料，若通过则进入 `approved`，并创建排期（线上会议号 / 线下场地）。
3. **发布开课通知**：管理员发布通知（含参与方式、验证要求），讲座状态变为 `notice_published`。通知推送给目标用户，同时开放报名。
4. **身份验证**：
   - 开课前：报名参与者按系统指引完成身份证明或员工号验证，验证记录进入 `pre_check`。
   - 讲座进行中：主持人可触发二次验证（例如随机点名）。记录写入 `live_check`。
   - 课后：参与者需完成结课确认或测验，记录写入 `post_check`。
5. **讲授环节**：讲师开始授课，状态进入 `in_session`。系统记录直播信息（时间戳、互动等）。
6. **上传验证信息**：讲座结束后，主持人/管理员上传签到表、录播文件等凭证，状态进入 `evidence_uploaded`。
7. **汇总验证信息**：系统整合所有验证记录，管理员校对后进入 `verification_compiled`。
8. **生成信息报告**：系统根据参与数据、反馈、验证记录生成总结报告，状态 `report_ready` -> `archived`。

## 数据域建模

### 核心实体

- `LectureApplication`：讲座元数据（主题、目标、讲师、时间需求、申请理由、关联科室）。
- `LectureSession`：经审核确认的具体场次（直播时间、接入方式、主持人、直播链接）。
- `LectureNotice`：对外发布的通知内容（正文、附件、发布时间、面向人群、报名方式）。
- `ParticipantProfile`：报名或参与人员的信息（身份类型、所属机构、联系方式）。
- `VerificationRecord`：身份验证及签到记录，按环节区分 `pre_check` / `live_check` / `post_check`。
- `TeachingMaterial`：相关课件、录播、资料下载清单。
- `LectureFeedback`：参与者反馈、问卷结果。
- `LectureReport`：管理员最终生成的观看信息报告，含关键指标（出勤率、满意度、建议）。

### 状态机（`LectureStage`）

```
applied -> under_review -> { rejected | approved }
approved -> notice_published -> enrollment_closed -> in_session -> post_verification -> report_ready -> archived
```

状态可伴随 `statusFlag`（`pending`/`active`/`completed`/`rejected`）用于前端颜色映射。

### 关联关系

- 一个 `LectureApplication` 可以对应一个或多个 `LectureSession`（系列课程场景）。本期基架先支持单场次。
- `ParticipantProfile` 与 `VerificationRecord` 一对多，允许多次验证。
- `LectureReport` 聚合 `LectureSession`、`VerificationRecord`、`LectureFeedback`。

## 前端模块划分

### 新增目录结构

```
src/
  api/
    mock/
      teaching.types.ts
      teaching.repository.ts
      teaching.ts
    services/
      teaching.ts (预留对接真实后端)
  composables/
    useTeachingLecture.ts
  views/
    doctor/
      teaching/
        LectureList.vue
        LectureCreate.vue
        LectureDetail.vue
    admin/
      teaching/
        LectureBoard.vue
        LectureDetail.vue
    patient/
      education/
        EducationCenter.vue
        LectureDetail.vue
  router/
    (新增教学相关子路由)
```

### UI/交互原则

- 强调流程进度：使用与远程医疗类似的 `Progress` 组件（可复用或抽象）。
- LIST 页面提供过滤器：状态、时间、主讲人、目标人群。
- DETAIL 页面组合卡片视图：基本信息、身份验证、资料下载、反馈统计。
- CREATE 页面引导式表单：基础信息 + 资源需求 + 附件上传（演示阶段保留字段）。
- Admin 看板提供流程操作按钮：审核通过/驳回、发布通知、开启直播、汇总验证、生成报告。

## API 契约 (Mock)

| 方法 | 用途 |
| --- | --- |
| `fetchTeachingLectures(filters)` | 获取讲座列表，可按角色（申请人、管理员、参与者）过滤。 |
| `fetchTeachingLectureDetail(id)` | 获取讲座详情（含参与者、验证、资料）。 |
| `createTeachingLecture(payload)` | 发起讲座申请。 |
| `reviewTeachingLecture(id, decision)` | 审核通过/驳回，并写入历史记录。 |
| `publishLectureNotice(id, payload)` | 发布通知，封装通知正文、外部报名链接。 |
| `recordLectureVerification(id, payload)` | 新增身份验证记录。 |
| `markLectureLive(id, payload)` | 标记讲座开始，记录直播信息。 |
| `uploadLectureEvidence(id, payload)` | 上传签到表/录像。 |
| `compileLectureReport(id, payload)` | 生成报告，进入归档。 |

所有接口将沿用 `telemedicine` 模块的 mock repository 模式，并在 `BroadcastChannel` 基础上保持前后台同步。

## 权限与导航

- **医生工作台**：新增 “教学服务” 导航组
  - `讲座申请列表`、`发起讲座`、`讲座详情`
- **管理员后台**：新增 “教学看板”
  - 列表展示全局讲座，提供审核、发布、归档操作入口
- **患者中心**：新增 “健康讲座”
  - 列表展示 `notice_published` 及 `archived` 的公开讲座，支持报名与反馈

角色访问控制依旧通过路由 `meta.roles` 实现。

## 与现有模块的耦合

- **用户体系**：复用 `useCurrentUser` 获取专家 `expertId`/所属机构。
- **通知中心 (未来)**：可通过 runtime config 中的 mock flag 切换。
- **知识库共享**：讲座资料可写入知识库索引，后续可实现互通。
- **统计**：讲座反馈数据纳入 dashboard 服务。

## MVP 实施里程碑

1. **当前迭代（基架）**
   - Mock 数据与类型定义
   - 医生/管理员/患者基础页面 + 路由
   - 流程操作按钮接入 mock API（不做复杂校验）
   - 文档与模块介绍
2. **下一阶段**
   - 权限校验 & 多讲师支持
   - 与远程医疗共享进度组件
   - 统计图表、问卷反馈
   - 真后端契约对齐

## 今日实现速记

- **路由联动**：医生、管理员、患者三端均新增 `teaching` / `education` 子路由，并通过 `meta.roles` 做角色隔离。医生端命名统一为 `DoctorTeachingList/Create/Detail`，避免和页面内部 hardcode 不一致的情况。
- **布局导航**：`DoctorWorkspace`、`AdminPanel`、`PatientCenter` 的侧边菜单补充 “远程教学”“健康教育”入口，图标沿用 `IconBook` 以区分于远程医疗模块。
- **患者视角细化**：新增 `EducationLectureDetail.vue`，支持查看资料、报名提示与直播通知。公开讲座列表过滤 `notice_published`、`report_ready`、`archived` 阶段，默认展示对外公开的内容。
- **Mock 暴露**：`src/api/index.ts` 重新导出教学模块 mock，方便后续统一替换为真实服务实现。

> 以上调整为基架层，尚未覆盖报名成功反馈、资料下载权限与问卷流转，预计在统计/反馈里程碑处理。

---

> 若需进一步拆解某流程或字段定义，请告知，我们可以继续深化需求归档。
