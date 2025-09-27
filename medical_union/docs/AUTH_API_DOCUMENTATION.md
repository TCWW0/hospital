# 医疗联盟系统 - 认证模块 API 接口文档

## 系统概述

### 认证模块功能职责
医疗联盟系统的认证模块（Auth Module）负责以下核心功能：

1. **用户身份管理**
   - 用户注册（患者、医生、管理员）
   - 用户身份验证和登录
   - 用户信息查询和管理

2. **安全认证机制**
   - BCrypt密码加密存储
   - JWT token生成和验证
   - 基于角色的访问控制

3. **会话管理**
   - 用户登录状态维护
   - Token有效期管理
   - 自动登录验证拦截

## 技术架构

### 技术栈
- **后端框架**: Spring Boot 3.1.4
- **数据持久化**: MyBatis + MySQL 8.0
- **密码加密**: Spring Security BCrypt
- **身份认证**: JWT (JSON Web Token)
- **API规范**: RESTful API

### 数据库设计
- **主表**: `user` - 统一用户表
- **医生表**: `doctors` - 医生专用信息表
- **存储过程**: 
  - `sp_user_register` - 用户注册
  - `sp_user_login` - 用户登录验证
  - `sp_user_get_info` - 获取用户详细信息

### 安全特性
1. **密码安全**: 使用BCrypt进行单向加密，不可逆
2. **Token机制**: JWT包含用户ID、用户名、角色信息
3. **访问控制**: 拦截器自动验证除登录/注册外的所有API
4. **数据脱敏**: 用户信息返回时自动脱敏敏感数据

## API 接口规范

### 基础信息
- **服务器地址**: `http://localhost:8080`
- **API前缀**: `/api/v1/auth`
- **数据格式**: JSON
- **字符编码**: UTF-8

### 统一响应格式
```json
{
    "code": 0,           // 错误码：0-成功，非0-错误
    "message": "OK",     // 响应消息
    "data": {}          // 响应数据
}
```

### 错误码说明
| 错误码 | 说明 |
|-------|------|
| 0 | 成功 |
| 1001 | 用户名已存在 |
| 1002 | 用户名或密码错误 |
| 1003 | 用户不存在 |
| 1004 | 密码强度不足 |
| 1005 | 输入参数无效 |
| 1006 | 未授权访问 |
| 2001 | 数据库错误 |

## API 接口详情

### 1. 用户注册

**接口地址**: `POST /api/v1/auth/register`

**功能描述**: 注册新用户（支持患者、医生、管理员角色）

**请求参数**:
```json
{
    "username": "张三",              // 用户名，3-100字符
    "password": "SecurePass123!",    // 密码，建议8位以上包含字母数字
    "role": "PATIENT",               // 角色：PATIENT/DOCTOR/ADMIN
    "phone": "13800138000"           // 手机号，11位数字
}
```

**响应示例**:
```json
{
    "code": 0,
    "message": "OK",
    "data": {
        "userId": 123
    }
}
```

**Postman测试**:
```http
POST http://localhost:8080/api/v1/auth/register
Content-Type: application/json

{
    "username": "测试用户001",
    "password": "password123",
    "role": "PATIENT", 
    "phone": "13900139001"
}
```

### 2. 用户登录

**接口地址**: `POST /api/v1/auth/login`

**功能描述**: 用户登录验证，支持用户名或手机号登录

**请求参数**:
```json
{
    "phone": "13800138000",          // 登录名（手机号或用户名）
    "password": "SecurePass123!",    // 登录密码
    "userType": "PATIENT"            // 用户类型验证（可选）
}
```

**响应示例**:
```json
{
    "code": 0,
    "message": "OK",
    "data": {
        "userId": 123,
        "username": "张三",
        "role": "PATIENT",
        "profileJson": null,
        "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMiLCJ1c2VybmFtZSI6IuW8oOS4iSIsInJvbGUiOiJQQVRJRU5UIiwiaWF0IjoxNjk4ODQwMDAwLCJleHAiOjE2OTg5MjY0MDB9.xxx"
    }
}
```

**Postman测试**:
```http
POST http://localhost:8080/api/v1/auth/login
Content-Type: application/json

{
    "phone": "13812345678",
    "password": "hash_password_123",
    "userType": "PATIENT"
}
```

### 3. 获取用户信息

**接口地址**: `GET /api/v1/auth/user/info`

**功能描述**: 获取当前登录用户的详细信息（需要JWT认证）

**请求头**:
```http
Authorization: Bearer <JWT_TOKEN>
```

**响应示例**:
```json
{
    "code": 0,
    "message": "OK",
    "data": {
        "userId": 123,
        "username": "张三",
        "role": "PATIENT",
        "profileJson": null
    }
}
```

**Postman测试**:
```http
GET http://localhost:8080/api/v1/auth/user/info
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMi...
```

## Postman 测试集合配置

### 环境变量设置
1. 创建Environment: `Medical Union - Local`
2. 配置变量:
   ```
   base_url: http://localhost:8080
   jwt_token: (登录后设置)
   ```

### 测试流程建议
1. **第一步**: 用户注册
   - 注册新用户
   - 验证返回的userId

2. **第二步**: 用户登录  
   - 使用注册的用户信息登录
   - 保存返回的token到环境变量

3. **第三步**: 获取用户信息
   - 使用保存的token访问用户信息接口
   - 验证返回的用户数据

### 现有测试数据
数据库中已存在以下测试用户：

**普通用户**:
- 用户名: `alice`
- 密码: `hash_password_123` (原始明文未知)
- 手机: `13812345678`
- 角色: `PATIENT`

**医生用户**:
- 医生代码: `DOC001` 
- 密码: `hash_password_456` (原始明文未知)
- 手机: `13911112222`
- 姓名: `Dr_Test`

**新注册用户**:
- 用户名: `testuser`
- 手机: `13800138000`
- 角色: `PATIENT`
- 密码: `password123` (可用于登录测试)

## 前后端对接要点

### 1. Token 管理
- 登录成功后，前端需要保存JWT token
- 后续API请求都需要在Header中携带token
- Token格式: `Authorization: Bearer <token>`

### 2. 错误处理
- 统一错误响应格式
- 根据错误码进行不同的业务处理
- 401错误需要引导用户重新登录

### 3. 用户角色区分
- 系统支持三种角色：PATIENT、DOCTOR、ADMIN
- 不同角色可能有不同的页面权限
- 后续业务API会根据角色进行访问控制

### 4. 数据验证
- 手机号格式: 11位数字，1开头
- 用户名长度: 3-100字符
- 密码强度建议: 8位以上，包含字母数字

## 后续开发计划

### 待实现功能
1. 刷新Token机制
2. 用户资料修改接口
3. 密码重置功能
4. 多端登录控制
5. 登录日志记录

### API扩展方向
1. 医生专用认证流程
2. 第三方登录集成
3. 双因子认证
4. 单点登录(SSO)支持

---

**注意事项**：
1. 本文档基于当前开发版本，生产环境需要额外的安全配置
2. JWT密钥在生产环境中应该使用环境变量配置
3. 数据库连接信息不应硬编码在配置文件中
4. 建议在生产环境中启用HTTPS协议