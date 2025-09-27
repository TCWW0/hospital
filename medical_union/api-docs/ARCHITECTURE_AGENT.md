# PetClinic -> 医院信息系统（面向 Agent 的详细架构文档）

说明：此文档以机器可读且对开发者友好的方式组织，便于下游 agent（或工程师）据此生成或迁移代码。文档包括模块职责、接口/端点清单、数据模型摘要、事务边界、MyBatis 映射建议、迁移与实现路线、以及最终的结构化清单。

## 1 目标
- 使用当前 Spring PetClinic 的架构与领域建模思想，作为构建个人医院信息管理系统（传统 MVC）的参考。
- 提供清晰的模块职责与协作定义，便于把实现从 Spring Data JPA 迁移到 Spring Boot + MyBatis。

## 2 高层架构概览（模块化）
模块划分如下：

- web（Controller 层）
  - 负责 HTTP 请求的接入、表单绑定、输入校验、视图选择与重定向逻辑。
  - 技术：Spring MVC + Thymeleaf

- api（可选 REST API 层）
  - 为前端 SPA 或第三方系统提供 JSON 接口。
  - 技术：Spring MVC @RestController

- service（业务逻辑层）
  - 负责业务用例实现、事务边界、流程编排、跨仓库协调。
  - 提供面向业务的接口，例如：PatientService、AppointmentService、ReferralService。

- repository/mapper（持久层）
  - 负责数据持久化操作，原项目使用 Spring Data JPA/Repository，目标项目采用 MyBatis Mapper。
  - 推荐将所有 SQL 映射集中管理并用 XML 或注解方式定义 Mapper。

- domain/model（领域模型）
  - 实体类、DTO、表单对象与值对象。实体上保留验证注解（Jakarta Validation）。

- config（配置）
  - 国际化、缓存、数据源、事务管理、MyBatis 配置、拦截器与全局异常处理等。

- infra（基础设施）
  - 集成第三方系统、消息中间件、审计、缓存、监控等实现。

- web-resources（templates/static）
  - Thymeleaf 模板、静态资源、表单片段与布局。

## 3 模块职责与示例接口
下面给出主要模块、职责和示例方法签名（便于生成接口或 Mapper）：

- Patient 模块（基于 Owner 映射）
  - Controller: PatientController
    - GET /patients/new -> showCreationForm()
    - POST /patients/new -> processCreationForm(PatientForm)
    - GET /patients -> listPatients(page, filter)
    - GET /patients/{id} -> showPatient(id)
  - Service: PatientService
    - PatientDTO createPatient(PatientDTO dto)
    - PatientDTO updatePatient(Integer id, PatientDTO dto)
    - Page<PatientDTO> findPatients(String lastName, Pageable pageable)
  - Mapper/Repository: PatientMapper (MyBatis)
    - insertPatient(patient)
    - updatePatient(patient)
    - selectPatientById(id)
    - selectPatientsByLastName(prefix, offset, limit)

- Appointment 模块（基于 Visit 映射）
  - Controller: AppointmentController
    - GET /patients/{patientId}/appointments/new
    - POST /patients/{patientId}/appointments/new
  - Service: AppointmentService
    - AppointmentDTO createAppointment(Integer patientId, AppointmentForm)
  - Mapper: AppointmentMapper
    - insertAppointment(appointment)
    - selectAppointmentsByPatientId(patientId)

- Provider 模块（基于 Vet 映射）
  - Controller: ProviderController
    - GET /providers -> listProviders()
    - GET /providers/{id}
  - Service: ProviderService
    - listProviders(pageable)
  - Mapper: ProviderMapper
    - selectAllProviders(offset, limit)

- Common/Shared
  - Reuse domain validation、ExceptionHandler、AuditAspect、DTO mapping（MapStruct 推荐）

## 4 数据模型映射（从 JPA 到 MyBatis 的注意点）
- JPA 实体中使用的级联（CascadeType.ALL）在 MyBatis 中需显式 SQL 与事务管理。
  - 推荐把聚合保存逻辑放入 Service 层：Service 开启事务，先保存根实体，再保存子实体，确保一致性。

- 关联加载策略：JPA 的 EAGER/LAZY 由 ORM 管理，MyBatis 需要在 SQL 或 Mapper 中明确关联查询（JOIN）或分步查询。
  - 对于常用列表（如医生列表），可用单表查询并在需要时做关联查询。

- 自动生成主键与外键：依赖数据库（自增/序列）并在 Mapper 中使用 `useGeneratedKeys` 或 SELECT LAST_INSERT_ID()。

## 5 事务边界建议
- 强制在 Service 层管理事务（标注 @Transactional）而不是 Controller 或 Mapper 层。
- 对跨表操作（例如保存 Patient 同时保存多条 MedicalRecord）在同一个事务内完成。
- 对于长事务或跨分布式系统的操作，使用事件驱动（本地事务+消息）或 Saga 模式。

## 6 MyBatis 实现的具体建议
- Mapper 层代码风格：
  - 使用 XML 映射 + SQL 片段（便于维护与调优）。
  - 使用 resultMap 描述复杂关联（one/many），或在 Service 层拆分查询以避免 N+1。
  - 使用分页插件（例如 PageHelper）或在 SQL 中使用 limit/offset（针对 MySQL）与相应数据库方言。
- 自动映射配置：驼峰命名转换（mapUnderscoreToCamelCase=true）。
- 插件：性能监控（logInterceptor）、SQL 防注入（abp）以及分页插件。

## 7 接口契约与端点清单（示例，便于 agent 自动生成）
- /patients
  - GET /patients?page=&size=&lastName=
  - POST /patients
- /patients/{patientId}
  - GET
  - PUT /patients/{patientId}
- /patients/{patientId}/appointments
  - GET
  - POST
- /providers
  - GET /providers?page=&size=

（详尽端点请参照 `ARCHITECTURE.md` 的 Controller 列表并进行扩展）

## 8 迁移步骤（从 PetClinic JPA 到 Spring Boot + MyBatis）
1. 设计并生成领域模型（保留现有实体字段与验证注解）。
2. 为每个实体创建对应的 Mapper XML + Mapper 接口（select/insert/update/delete）。
3. 引入 MyBatis Starter、数据源、事务管理（Spring Boot + MyBatis starter）。
4. 将 Controller 的 Repository 调用替换为 Service 调用，Service 内使用 Mapper 调用。
5. 编写事务单元测试，确保 CRUD 与级联逻辑正确。
6. 性能测试与 SQL 优化（必要时添加索引或重写查询）。

## 9 结构化清单（用于代码生成/agent 消费）
见 `architecture_manifest.json`（位于项目根）——包含模块、实体、端点、Mapper 名称、事务边界等结构化信息。

## 10 风险 & 注意项（供 agent 评估）
- EAGER 关联需转换为按需查询或 DTO，避免大对象图加载。
- 验证逻辑需从实体层逐步迁移到 DTO/表单对象以防止过度耦合 UI 与 DB 模型。
- 事务边界错误会导致部分保存失败的脏数据，须在 Service 层做完整测试。

---

请确认是否需要我继续：
- 生成 `architecture_manifest.json`（结构化清单），或
- 生成一个 Patient 模块的完整 MyBatis 示例（Entity + Mapper XML + Mapper 接口 + Service + Controller + 简单 Thymeleaf 模板）。

