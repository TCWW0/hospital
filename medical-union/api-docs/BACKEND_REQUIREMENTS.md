# 后端需求文档（针对 Spring Boot + MyBatis 实现）

本文档为后端实现提供详细需求、非功能需求、数据库设计建议与实现注意点。可作为实现任务分配与估算依据。

## 技术栈（推荐）
- Java 版本：11 或 17（团队一致性为准）
- Spring Boot：3.x
- MyBatis-Plus 或 原生 MyBatis
- 数据库：PostgreSQL 或 MySQL（建议 MySQL，当前项目中的数据库连接即为Mysql配置）
- 连接池：HikariCP（Spring Boot 默认）
- 日志：Logback，结合 ELK/Graylog 可选
- 安全：Spring Security + JWT（Bearer）
- 测试：Junit 5 + Mockito
- 文档/契约：OpenAPI 生成（springdoc-openapi）或使用 OpenAPI generator

## 功能需求（高层）
1. 患者管理
   - 列表（分页/过滤/排序/搜索）
   - 新建/更新/删除
   - 获取单个患者详情
   - 获取患者就诊记录
2. 就诊记录（Visits）
   - 列表（按 patientId）
   - 新建就诊记录/查看历史
3. 转诊功能（参考已有转诊 OpenAPI）
4. 用户鉴权（医生/管理员）
   - 登录（JWT 签发）
   - 权限控制：管理员 vs 医生视图

## 非功能需求
- 可用性：服务可用率 >= 99.5%（根据部署环境设置）
- 性能：分页查询响应 < 300ms（小数据量），复杂查询可异步处理或索引优化
- 扩展性：API 版本化（/api/v1）
- 安全：所有敏感操作需鉴权，接口速率限制可选
- 可维护性：严格的 logging 与监控（Prometheus / Grafana）

## 数据库建模建议（最小化实现）
- 表：patients, visits, users, roles, user_role, referrals

示例 SQL（MySQL 语法，供参考）：

```sql
CREATE TABLE patients (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  age INT,
  gender CHAR(1),
  phone VARCHAR(32),
  last_visit TIMESTAMP NULL,
  department VARCHAR(64),
  triage ENUM('high','medium','low') DEFAULT 'low',
  status ENUM('ongoing','completed') DEFAULT 'ongoing',
  unread_messages INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE visits (
  id VARCHAR(64) PRIMARY KEY,
  patient_id VARCHAR(64) NOT NULL,
  visit_date TIMESTAMP,
  reason TEXT,
  doctor VARCHAR(128),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);
```

索引建议：
- patients(name), patients(phone), patients(last_visit), patients(department)
- visits(patient_id), visits(visit_date)

## API 设计注意点
- 使用统一的返回 envelope：{ code:int, message:string, data:object }。或者明确文档说明不使用 envelope 并让前端适配。
- 分页返回需要包含 total（总条数）以支持前端分页组件。
- 搜索（q）可在 name/phone/其他字段上做全文/模糊匹配。
- 对于敏感字段（如身份证号）需要在返回时做脱敏处理。

## 数据迁移与初始化
- 提供 SQL 脚本用于初始化表结构与基础数据（部门、角色）
- 在项目中使用 Flyway 或 Liquibase 管理数据库变更

## 部署建议
- 环境分层：dev/staging/prod
- 反向代理：Nginx 做 TLS 终端、路径路由（/api/v1 -> 服务），并处理静态资源
- 配置中心：可选（Spring Cloud Config）
- 日志/监控：Prometheus + Grafana + ELK

## 开发任务建议（Sprint 划分）
- Sprint 1：基础模型 + CRUD（patients, visits） + 基本前端对接（mock->API切换）
- Sprint 2：鉴权/角色/转诊流程 + 测试
- Sprint 3：性能优化、契约测试与 CI 集成

***

如果你确认使用 MyBatis-Plus，我可以生成示例的实体类、Mapper XML 模板与对应的 SQL DDL。要我继续生成这些代码模版吗？