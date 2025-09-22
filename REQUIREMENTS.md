# 医联体管理系统需求分析文档

## 项目概述

**项目名称**: MedicalUnion（医联体管理系统）  
**技术栈**: Spring Boot 2.7+ + MyBatis + MySQL + REST API  
**目标**: 基于PetClinic架构模式构建一个简化的医联体协同管理系统

## 业务背景

医联体（Medical Union）是由不同级别、不同类别的医疗机构组成的医疗联合体，目标是实现医疗资源的合理配置和有效利用。本系统旨在支持医联体内部的患者管理、医生协作、转诊服务等核心业务流程。

## 功能范围（MVP版本）

### 1. 患者管理 (Patient Management)
- 患者基本信息管理（姓名、身份证、电话、地址等）
- 患者就诊历史记录
- 患者在不同医疗机构的就诊轨迹

### 2. 医疗机构管理 (Hospital/Clinic Management)
- 医院/诊所基本信息管理
- 科室信息管理
- 医疗机构等级和类型分类

### 3. 医生管理 (Doctor Management)
- 医生基本信息管理
- 医生专业科室和专长
- 医生所属医疗机构关联

### 4. 转诊管理 (Referral Management)
- 转诊申请创建和审批
- 转诊状态跟踪
- 转诊结果反馈

### 5. 就诊记录管理 (Visit Management)
- 患者就诊记录
- 诊断信息
- 治疗建议

## 核心实体模型

### Patient（患者）
- 聚合根：包含患者基本信息和就诊历史
- 字段：ID、姓名、身份证号、性别、出生日期、电话、地址、医保卡号

### Hospital（医疗机构）
- 字段：ID、名称、地址、联系电话、医院等级（三甲、二甲等）、类型（综合医院、专科医院、社区卫生中心）

### Department（科室）
- 字段：ID、名称、医院ID、科室类型

### Doctor（医生）
- 字段：ID、姓名、工号、电话、职称、所属科室ID、专长

### Visit（就诊记录）
- 字段：ID、患者ID、医生ID、医院ID、就诊日期、主诉、诊断、治疗建议

### Referral（转诊）
- 字段：ID、患者ID、转出医生ID、转入医生ID、转出医院ID、转入医院ID、转诊原因、状态、创建时间

## 技术架构设计

基于PetClinic的分层架构模式：

```
Controller层 (REST API)
    ↓
Service层 (业务逻辑 + 事务管理)
    ↓
Repository层 (MyBatis Mapper)
    ↓
存储过程层 (敏感操作封装)
    ↓
MySQL数据库
```

### 编码风格和设计原则

1. **存储过程优先**：对于数据的删除、修改等敏感操作，使用存储过程进行封装，Java端只调用接口并解析返回值
2. **结构清晰**：保持代码结构简洁明了，便于review和维护
3. **逻辑灵活**：考虑到甲方需求可能变化，避免过度设计，保持逻辑的可扩展性
4. **返回值标准化**：存储过程返回统一的操作结果格式，便于Java端解析

### 包结构设计
```
com.medicalunion
├── MedicalUnionApplication.java
├── config/                    # 配置类
│   ├── DatabaseConfig.java
│   └── MyBatisConfig.java
├── common/                    # 通用基类和工具
│   ├── BaseEntity.java
│   ├── Result.java
│   └── PageRequest.java
├── patient/                   # 患者域
│   ├── entity/Patient.java
│   ├── mapper/PatientMapper.java
│   ├── service/PatientService.java
│   └── controller/PatientController.java
├── hospital/                  # 医疗机构域
│   ├── entity/Hospital.java
│   ├── entity/Department.java
│   ├── mapper/HospitalMapper.java
│   ├── service/HospitalService.java
│   └── controller/HospitalController.java
├── doctor/                    # 医生域
│   ├── entity/Doctor.java
│   ├── mapper/DoctorMapper.java
│   ├── service/DoctorService.java
│   └── controller/DoctorController.java
├── visit/                     # 就诊域
│   ├── entity/Visit.java
│   ├── mapper/VisitMapper.java
│   ├── service/VisitService.java
│   └── controller/VisitController.java
└── referral/                  # 转诊域
    ├── entity/Referral.java
    ├── mapper/ReferralMapper.java
    ├── service/ReferralService.java
    └── controller/ReferralController.java
```

## 数据库设计

### 表结构概要
- `patients` - 患者表
- `hospitals` - 医院表
- `departments` - 科室表
- `doctors` - 医生表
- `visits` - 就诊记录表
- `referrals` - 转诊表

## API设计规范

采用RESTful API设计：

- `GET /api/patients` - 获取患者列表
- `GET /api/patients/{id}` - 获取患者详情
- `POST /api/patients` - 创建患者
- `PUT /api/patients/{id}` - 更新患者信息
- `DELETE /api/patients/{id}` - 删除患者

类似地为Hospital、Doctor、Visit、Referral提供完整的CRUD接口。

## 非功能性需求

### 1. 性能要求
- API响应时间 < 200ms（普通查询）
- 支持并发用户数：100+

### 2. 安全要求
- 数据传输使用HTTPS
- 敏感信息（身份证号）需要脱敏处理
- 访问日志记录

### 3. 数据一致性
- 使用事务保证数据一致性
- 转诊状态变更需要原子操作

## 开发计划

### 第一阶段：基础架构搭建
1. 创建Spring Boot项目结构
2. 配置MyBatis和MySQL连接
3. 实现基础实体和通用组件

### 第二阶段：核心功能实现
1. 患者管理模块
2. 医院和科室管理模块
3. 医生管理模块

### 第三阶段：业务流程实现
1. 就诊记录管理
2. 转诊流程管理
3. API测试和优化

## 部署和运行

### 环境要求
- JDK 17+
- MySQL 8.0+
- Maven 3.6+

### 数据库配置
- 主机：localhost
- 用户名：root
- 密码：Tcww3498.
- 数据库：medical_union

### 启动方式
```bash
mvn spring-boot:run
```

## 后续扩展方向

1. 引入Spring Security进行权限管理
2. 添加审计日志功能
3. 集成消息队列处理异步任务
4. 添加缓存机制提升性能
5. 支持分布式部署

---

本文档将在开发过程中持续更新和完善。