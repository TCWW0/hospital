# 医联体系统设计说明（第一版）

> 目标：将之前的功能分析整理成可执行的设计文档，作为前端/后端开发的第一版蓝图。

## 一、前提假设与需要注意的现实情况

- 系统为医联体内部协作平台，涵盖患者管理、医生协作、转诊与就诊记录等核心功能。
- 部分患者在实际就诊时未注册系统账号，但其就诊数据需要电子化并录入医院系统。系统必须支持“先录入、后认领/绑定”的流程：即录入临时就诊/患者记录，用户在后续注册后通过匹配身份证/手机号/就诊号来认领历史记录并合并。
- 医疗场景有分级与优先级（重症/急诊优先），需要在患者管理与工作列表中引入优先级（triage）字段，并作为列表排序、提醒与待办的一部分。
- 本文档以 MVP（最小可行产品）为起点，逐步扩展到更复杂的沟通、统计与第三方系统集成。

## 二、总体目标（MVP）

- 医生端：管理其负责的患者、查看患者详情、发起/处理转诊、基本消息/留言最小实现、个人信息编辑。
- 患者端：通过手机号注册/登录、查看个人健康档案（就诊记录、主治医师、医嘱）、发起留言/简单咨询、查看预约与检查结果（可选）。
- 管理端（Admin）：系统元数据统计（总患者数、在诊患者、医生数量、转诊统计、待处理项数等）。

## 三、关键业务流程与页面（功能清单）

### 3.1 医生端（核心页面）

1. 工作台（Dashboard）
   - 待处理转诊、待回访患者、今日门诊、统计小卡片（近7天新增患者、转诊量等）。
2. 患者管理（列表）
   - 过滤/搜索（按姓名、手机号、病历号、优先级、科室、最后就诊时间）。
   - 列表项显示：姓名、年龄、性别、主治医生、最后就诊时间、优先级标签（高/中/低）、未读留言角标。
3. 患者详情
   - 基本信息（可编辑：电话、地址、紧急联系人；不可直接编辑工号/系统字段需权限）。
   - 就诊历史（按时间线展示 Visit 记录）。
   - 检查/检验结果、处方记录（列表或嵌入式展开）。
   - 转诊历史（包含转出/转入记录与处理状态）。
   - 留言/咨询（最小实现：文字留言，医生能标为已读/回复）。
4. 转诊管理
   - 发起转诊表单（目标医院/科室、病情摘要、附件上传）。
   - 转诊队列（待审批/已处理）。
5. 个人信息编辑
   - 非敏感字段可编辑（电话、个人简介、门诊时间等）。

### 3.2 患者端（核心页面）

1. 注册/登录
   - 手机+验证码、手机号+密码（短信服务可后期接入）。
   - 注册流程支持“已有就诊记录认领”：用户注册时可提供身份证或史号（hospitalVisitId）来尝试匹配医院既有记录提示合并。
2. 个人中心
   - 基本档案、主治医生、当前医嘱、历史就诊记录、留言/咨询记录。
3. 留言/咨询
   - 最小实现：向主治医生留言并显示回复历史。
4. 预约/检查（可选）
   - 显示预约信息与结果查询入口（MVP后续扩展）。

### 3.3 管理端（Admin / Super Admin）

1. 全局统计面板
   - 系统整体 KPI：在诊患者数、总患者数、医生总数、今日新增患者/转诊/留言、待处理转诊数等。
2. 元数据管理
   - 医院/科室/医生/用户角色管理。
3. 审计与日志（可选/后期）
   - 关键操作审计（删除、权限变更、敏感信息访问）。

## 四、数据模型要点与设计建议

（仅列核心字段，具体实现结合后端数据库设计文档）

- Patient
  - id, name, idNumber (脱敏存储/只在必要时展示), phone, address, birthDate, gender, status (registered | unregistered | claimed), hospital_record_ids[], createdAt
  - triage_priority (high|medium|low)、labels（过敏/慢病）
  - note: status 用于表示是否已在系统注册并绑定；unregistered 表示仅在医院端临时录入的就诊信息

- User
  - id, username, phone, passwordHash, roles[], linkedPatientId (可选)

- Doctor
  - id, name, doctorCode, phone, title, departmentId, specialties[], available (bool)

- Visit
  - id, patientId (nullable if unregistered临时记录关联hospitalVisitId), hospitalVisitId, doctorId, hospitalId, visitDate, diagnosis, notes, attachments

- Referral
  - id, visitId, fromDoctorId, toDoctorId / toHospitalId, reason, status, createdAt, updatedAt

- Message (留言)
  - id, fromUserId (patient or doctor), toUserId, relatedPatientId, content, attachments, status (unread/read/replied), createdAt

### 关于“先录入后注册/认领”设计建议（关键）

1. 在医院接收端录入就诊信息时，如果患者未注册，创建 `Patient` 记录并将 `status = unregistered`，同时生成 hospitalVisitId / hospitalRecordNumber 作为医院内部唯一标识。
2. 该记录应允许最少字段（姓名、联系电话、就诊号、录入医生/部门、就诊时间、主要诊断摘要）。
3. 当患者后来在系统注册时：
   - 提供身份证号/手机号/就诊号进行匹配，系统查找 `status = unregistered` 记录并提示用户“发现历史就诊记录，是否认领并合并”。
   - 采用谨慎合并策略：保留医院记录为主、副本合并，合并操作应记录审计日志；若匹配信息冲突（例如不同身份证），转入人工审核流程。
4. 为避免恶意认领或数据错配，注册认领时采用二次验证（短信验证码、人工审核或通过医院端确认）。

## 五、优先级/分级（Triage）设计

- 每条就诊/患者记录建议带 `triage_priority` 字段（枚举：urgent/high/medium/low），用于医生端
  - 列表按 priority desc 排序显示
  - 可在工作台显示“高优先级待办”卡片
- 实现方式：
  - 初期由录入医生/护士手工设置优先级
  - 后期可基于规则自动评估（例如：关键词匹配重症症状、生命体征数据触发高优先级）

## 六、API 设计（示例）

- 用户与认证
  - POST /api/auth/login
  - POST /api/auth/register
  - POST /api/auth/verify-phone (短信验证码)
- 患者
  - GET /api/patients?managedBy={doctorId}&priority=high
  - GET /api/patients/{id}
  - POST /api/patients (用于院方录入，包括未注册患者 -> status=unregistered)
  - PUT /api/patients/{id}
  - POST /api/patients/{id}/claim (注册后认领历史记录)
- 就诊与转诊
  - GET /api/visits?patientId=
  - POST /api/visits
  - POST /api/referrals
  - GET /api/referrals?status=pending
- 留言/消息
  - GET /api/messages?userId=
  - POST /api/messages

## 七、权限与安全建议

- 角色：SUPER_ADMIN / HOSPITAL_ADMIN / DOCTOR / NURSE / PATIENT
- 最小权限原则：医生只能访问其管理或授权查看的患者数据
- 敏感信息（身份证号）应加密或脱敏（存储加密、展示部分遮掩）
- 使用 HTTPS + JWT 或基于会话的认证（生产建议结合 OAuth2 / OpenID Connect）
- 审计日志记录重要操作（删除/合并/敏感字段修改）

## 八、可扩展/后续功能（ roadmap ）

- 阶段 1（MVP）
  - 基本患者管理、医生工作台、转诊流程、最小留言系统、注册/登录、认领历史记录
- 阶段 2
  - 自动优先级（规则引擎）、消息推送（短信/站内/邮件）、预约系统
  - 更细粒度的权限与审计
- 阶段 3
  - 第三方系统接入（HIS、LIS、PACS）、移动 App、AI 辅助诊断/智能分诊

## 九、边界条件与常见场景（注意点）

- 重复录入：医院多个科室可能对同一患者重复录入，请在录入流程提供“查找匹配”建议，减少重复记录。
- 合并冲突：对于不同医院间的患者信息差异，合并操作需保留来源标签并记录合并审计。
- 数据保留策略：历史数据应长期保留，删除操作需审批与审计。
- 高并发：统计类接口可以异步或缓存（Redis）以减轻数据库压力。

## 十、页面与交互建议（UI/UX）

- 侧边栏与顶部固定（已实现），工作区要确保核心操作（侧栏菜单、搜索、待办）始终可访问。
- 患者列表行应清晰展示关键字段：姓名、主治、优先级、上次就诊时间、未读留言数。
- 认领历史记录的 UX：注册后弹窗提示“发现 X 条医院历史记录，是否认领/合并”，并显示关键摘要帮助判断。

## 十一、验收标准（简要）

- 医生能够在工作台看到其管理患者列表并打开患者详情
- 医生能够发起并查看转诊流程，转诊状态可被更新
- 患者可以完成注册并认领其历史未注册的就诊记录
- 系统统计面板展示关键 KPI（患者数、医生数、待处理转诊等）

## 十二、下一步（建议实施步骤）

1. 后端：确认数据表结构与`status=unregistered`、`hospitalVisitId`字段；实现患者录入 & 认领 API。
2. 前端：实现患者列表/详情基本页面、注册认领弹窗交互、转诊表单基本页面。
3. 测试：创建测试数据（含未注册患者案例），验证注册认领与合并流程。
4. 安全：加入敏感信息脱敏 & 审计日志基础实现。

---

如果您同意这个设计草案，我可以将它保存为仓库中的 Markdown 文件（我将文件名默认设为 `DESIGN_MEDICAL_UNION.md` 并放在仓库根目录），并接着帮您把第一个页面（例如医生的“患者列表”）的前端实现步骤拆解成可执行的任务清单与 UI 数据契约。
