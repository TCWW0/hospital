# 模块化单体（Modular Monolith）架构方案

目标
- 在保持单体部署与简单性的同时，引入清晰的模块边界，提升可维护性、并行开发效率与演进空间。
- 为未来演进到微服务保留空间，但不强行拆分过早优化。

建议的 Maven 多模块结构
- root（聚合）
  - module: common
    - 放置通用基础设施：通用 DTO、异常封装、结果包装、工具类（如 JwtUtil）、安全配置、Jackson 配置等。
  - module: auth
    - 认证/鉴权：登录、注册、Token、权限校验等（当前代码基础）。
  - module: user
    - 用户基础资料、改密、profile；User 表相关逻辑与 SP。
  - module: patient
    - 患者档案、就诊记录等。
  - module: doctor
    - 医生信息、资质、简介、头像、标签等。
  - module: schedule
    - 医生排班与可约余量管理。
  - module: appointment
    - 预约挂号：创建、列表、详情、取消；并发与状态机。
  - module: telemedicine
    - 远程医疗申请、审批、会话对接（未来可引入 IM/RTC 网关）。
  - module: infra
    - 数据访问与存储过程 Mapper、MyBatis 公共配置、Flyway/Liquibase 脚本等（可与 common 合并或独立）。

边界与依赖关系
- common: 无业务依赖，其他模块均可依赖
- auth: 依赖 common；暴露鉴权与用户身份解析能力
- user: 依赖 common、infra
- patient/doctor/schedule/appointment/telemedicine: 依赖 common、infra（必要时依赖 user）
- infra: 依赖 common；封装 MyBatis、数据源、事务、统一 ID 生成、SQL 迁移工具

分层建议（各模块内部）
- controller（web 层） → service（业务） → repository/mapper（数据） → SP/SQL
- 禁止跨越 service 访问其他模块 repository，跨模块交互通过 service 接口或 Domain Service

技术约束与规范
- 统一异常：BizException + ErrorCode
- 统一响应：ApiResponse
- 统一日志：使用 SLF4J；禁止打印敏感信息
- 配置隔离：每模块可有 `application-<module>.yml` 片段，聚合到最终应用
- DB 迁移：集中使用 Flyway/Liquibase 管理 SQL、SP 版本

渐进迁移步骤
1) 在当前仓库引入 Maven 聚合：将现有代码归入 `auth` 与 `common/infra`（先抽取 ApiResponse、BizException、JwtUtil 等到 common）。
2) 拆出 `user` 模块：迁移 `/api/v1/user` 相关 controller/service/mapper 与 SP 调用。
3) 依次拆出 `patient`、`doctor`、`schedule`、`appointment`、`telemedicine`。
4) 引入 Flyway：把 `api-docs/medical_union.sql` 切分为版本化迁移脚本（V1__init.sql, V2__doctors.sql, ...）。
5) 引入契约测试：跨模块的 service 接口增加契约测试，避免回归。

权衡
- 优点：边界清晰、影响面可控、便于并行开发；后续可按模块服务化。
- 成本：模块拆分初期需要整理依赖与公共代码；CI/CD 需要适配多模块构建。

度量与验收
- PR 变更影响面显著缩小；
- 模块间依赖图稳定；
- 每个模块拥有最小可运行/测试集；
- 构建时间与部署路径可控。
