# 认证模块 API 文档

## 概述

认证模块提供用户注册、登录、身份验证等核心功能，使用JWT（JSON Web Token）进行身份认证。

## 基础信息

- **Base URL**: `/api/v1/auth`
- **认证方式**: JWT Bearer Token
- **Token有效期**: 24小时
- **支持的用户类型**: PATIENT（患者）、DOCTOR（医生）、ADMIN（管理员）

---

## API 接口列表

### 1. 用户注册

注册新用户账户。

**接口信息**
- **URL**: `POST /api/v1/auth/register`
- **认证**: 无需认证
- **Content-Type**: `application/json`

**请求参数**

| 参数名 | 类型 | 必填 | 描述 | 示例值 |
|--------|------|------|------|--------|
| username | string | ✅ | 用户名，3-50字符 | "zhang_san" |
| password | string | ✅ | 密码，6-100字符 | "password123" |
| role | string | ✅ | 用户角色 | "PATIENT" |
| phone | string | ✅ | 手机号码，11位数字 | "13912345678" |

**用户角色说明**
- `PATIENT`: 患者
- `DOCTOR`: 医生  
- `ADMIN`: 系统管理员

**请求示例**
```json
{
    "username": "zhang_san",
    "password": "password123",
    "role": "PATIENT",
    "phone": "13912345678"
}
```

**响应示例**
```json
{
    "success": true,
    "code": 0,
    "message": "用户注册成功",
    "data": {
        "userId": 4,
        "message": "注册成功"
    }
}
```

**错误响应**
```json
{
    "success": false,
    "code": 1001,
    "message": "用户名已存在",
    "data": null
}
```

---

### 2. 用户登录

用户登录获取访问令牌。支持手机号码登录。

**接口信息**
- **URL**: `POST /api/v1/auth/login`
- **认证**: 无需认证
- **Content-Type**: `application/json`

**请求参数**

| 参数名 | 类型 | 必填 | 描述 | 示例值 |
|--------|------|------|------|--------|
| phone | string | ✅ | 手机号码 | "13912345678" |
| password | string | ✅ | 密码 | "password123" |
| userType | string | ✅ | 用户类型 | "PATIENT" |

**请求示例**
```json
{
    "phone": "13912345678",
    "password": "password123",
    "userType": "PATIENT"
}
```

**响应示例**
```json
{
    "success": true,
    "code": 0,
    "message": "登录成功",
    "data": {
        "userId": 4,
        "username": "zhang_san",
        "role": "PATIENT",
        "profileJson": null,
        "token": "eyJhbGciOiJIUzM4NCJ9.eyJyb2xlIjoiUEFUSUVOVCIsInVzZXJJZCI6NCwidXNlcm5hbWUiOiJ6aGFuZ19zYW4iLCJzdWIiOiJ6aGFuZ19zYW4iLCJpYXQiOjE3NTg2OTQ4NDYsImV4cCI6MTc1ODc4MTI0Nn0.ZoCTnUPSJsM7Gfrqkdfwe94dKQNtRD51IL0iFDYuo44UjEAQtoB3cCoDkzH6gu_Q"
    }
}
```

**错误响应**
```json
{
    "success": false,
    "code": 1002,
    "message": "用户名或密码错误",
    "data": null
}
```

---

### 3. 获取用户信息

获取当前登录用户的详细信息。

**接口信息**
- **URL**: `GET /api/v1/auth/user/info`
- **认证**: ✅ 需要JWT Token
- **Content-Type**: `application/json`

**请求头**
```
Authorization: Bearer eyJhbGciOiJIUzM4NCJ9...
```

**请求参数**
无需请求参数，用户信息从JWT Token中解析。

**响应示例**
```json
{
    "success": true,
    "code": 0,
    "message": "获取用户信息成功",
    "data": {
        "userId": 4,
        "username": "zhang_san",
        "role": "PATIENT",
        "profileJson": null
    }
}
```

**错误响应**
```json
{
    "success": false,
    "code": 401,
    "message": "未授权访问",
    "data": null
}
```

---

## JWT Token 说明

### Token 格式
```
Authorization: Bearer {JWT_TOKEN}
```

### Token 内容
JWT Token包含以下信息：
- `userId`: 用户ID
- `username`: 用户名
- `role`: 用户角色
- `iat`: 发行时间
- `exp`: 过期时间（24小时后）

### Token 验证
- 所有需要认证的接口都会验证JWT Token
- Token过期或无效时返回401错误
- Token在响应头中自动续期

---

## 状态码说明

| Code | 描述 | 处理建议 |
|------|------|----------|
| 0 | 成功 | 继续处理业务逻辑 |
| 400 | 请求参数错误 | 检查请求参数格式 |
| 401 | 未授权 | 重新登录获取token |
| 500 | 服务器内部错误 | 联系技术支持 |
| 1001 | 用户名已存在 | 使用其他用户名 |
| 1002 | 用户名或密码错误 | 检查登录信息 |
| 1003 | 用户不存在 | 确认用户信息 |

---

## 安全考虑

1. **密码安全**: 使用BCrypt加密存储
2. **Token安全**: JWT使用HS384算法签名
3. **传输安全**: 建议生产环境使用HTTPS
4. **参数验证**: 服务器端进行严格的参数校验

---

## 测试说明

### Postman 集合
建议使用Postman进行API测试，按以下顺序：
1. 用户注册
2. 用户登录（保存返回的token）
3. 获取用户信息（使用token）

### 测试数据
```json
{
    "testUser": {
        "username": "test_user_001",
        "password": "test123456",
        "role": "PATIENT", 
        "phone": "13800138001"
    }
}
```

---

## 更新日志

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| v1.0.0 | 2025-09-24 | 初始版本，包含注册、登录、用户信息接口 |

---

## 联系信息

如有API使用问题，请联系开发团队：
- 📧 Email: dev@medicalunion.com
- 📱 电话: 400-xxx-xxxx
- 🌐 技术文档: http://docs.medicalunion.com