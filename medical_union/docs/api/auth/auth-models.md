# 认证模块 - 数据模型定义

## 概述

本文档定义了认证模块中使用的所有数据模型，包括请求对象、响应对象和实体对象。

---

## 请求对象 (Request Models)

### RegisterRequest - 注册请求

用户注册时提交的数据模型。

```java
public class RegisterRequest {
    private String username;    // 用户名
    private String password;    // 密码
    private String role;        // 用户角色
    private String phone;       // 手机号码
}
```

**字段说明**

| 字段名 | 类型 | 必填 | 长度限制 | 描述 | 验证规则 |
|--------|------|------|----------|------|----------|
| username | String | ✅ | 3-50字符 | 用户名，系统内唯一 | 字母、数字、下划线 |
| password | String | ✅ | 6-100字符 | 用户密码 | 至少包含字母和数字 |
| role | String | ✅ | 枚举值 | 用户角色类型 | PATIENT/DOCTOR/ADMIN |
| phone | String | ✅ | 11位 | 手机号码，系统内唯一 | 中国大陆手机号格式 |

**JSON示例**
```json
{
    "username": "zhang_san",
    "password": "password123",
    "role": "PATIENT",
    "phone": "13912345678"
}
```

---

### LoginRequest - 登录请求

用户登录时提交的数据模型。

```java
public class LoginRequest {
    private String phone;       // 手机号码
    private String password;    // 密码
    private String userType;    // 用户类型
}
```

**字段说明**

| 字段名 | 类型 | 必填 | 描述 | 验证规则 |
|--------|------|------|------|----------|
| phone | String | ✅ | 登录手机号 | 11位数字 |
| password | String | ✅ | 登录密码 | 原始密码 |
| userType | String | ✅ | 用户类型 | PATIENT/DOCTOR/ADMIN |

**JSON示例**
```json
{
    "phone": "13912345678",
    "password": "password123",
    "userType": "PATIENT"
}
```

---

## 响应对象 (Response Models)

### ApiResponse - 统一响应格式

所有API接口统一使用的响应格式。

```java
public class ApiResponse {
    private boolean success;    // 请求是否成功
    private int code;          // 响应代码
    private String message;    // 响应消息
    private Object data;       // 响应数据
}
```

**字段说明**

| 字段名 | 类型 | 描述 | 示例值 |
|--------|------|------|--------|
| success | boolean | 操作是否成功 | true/false |
| code | int | 响应状态码 | 0(成功)/其他(错误码) |
| message | String | 响应消息 | "用户注册成功" |
| data | Object | 响应数据对象 | 具体的业务数据 |

---

### RegisterResponse - 注册响应

用户注册成功后返回的数据。

```java
public class RegisterResponse {
    private Integer userId;     // 用户ID
    private String message;     // 响应消息
}
```

**字段说明**

| 字段名 | 类型 | 描述 | 示例值 |
|--------|------|------|--------|
| userId | Integer | 新注册用户的ID | 4 |
| message | String | 注册结果消息 | "注册成功" |

**完整响应示例**
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

---

### LoginResponse - 登录响应

用户登录成功后返回的数据。

```java
public class LoginResponse {
    private Integer userId;     // 用户ID
    private String username;    // 用户名
    private String role;        // 用户角色
    private String profileJson; // 用户配置JSON
    private String token;       // JWT访问令牌
}
```

**字段说明**

| 字段名 | 类型 | 描述 | 示例值 |
|--------|------|------|--------|
| userId | Integer | 用户唯一标识 | 4 |
| username | String | 用户名 | "zhang_san" |
| role | String | 用户角色 | "PATIENT" |
| profileJson | String | 用户配置信息 | null 或 JSON字符串 |
| token | String | JWT访问令牌 | "eyJhbGciOiJIUzM4NCJ9..." |

**完整响应示例**
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

---

### UserInfoResponse - 用户信息响应

获取用户信息时返回的数据。

```java
public class UserInfoResponse {
    private Integer userId;     // 用户ID
    private String username;    // 用户名
    private String role;        // 用户角色
    private String profileJson; // 用户配置JSON
}
```

**字段说明**

| 字段名 | 类型 | 描述 | 示例值 |
|--------|------|------|--------|
| userId | Integer | 用户唯一标识 | 4 |
| username | String | 用户名 | "zhang_san" |
| role | String | 用户角色 | "PATIENT" |
| profileJson | String | 用户配置信息 | null 或 JSON字符串 |

**完整响应示例**
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

---

## 实体对象 (Entity Models)

### User - 用户实体

数据库用户表对应的实体对象。

```java
@Data
public class User {
    private Integer userId;         // 用户ID (主键)
    private String username;        // 用户名
    private String passwordHash;    // 密码哈希值
    private String role;           // 用户角色
    private String phone;          // 手机号码
    private String email;          // 邮箱地址
    private String profileJson;    // 用户配置JSON
    private LocalDateTime createdAt; // 创建时间
    private LocalDateTime updatedAt; // 更新时间
}
```

**字段说明**

| 字段名 | 数据库字段 | 类型 | 可空 | 描述 |
|--------|------------|------|------|------|
| userId | user_id | INTEGER | ❌ | 用户唯一标识，自增主键 |
| username | username | VARCHAR(50) | ❌ | 用户名，唯一索引 |
| passwordHash | password_hash | VARCHAR(255) | ❌ | BCrypt加密的密码哈希 |
| role | role | ENUM | ❌ | 用户角色：PATIENT/DOCTOR/ADMIN |
| phone | phone | VARCHAR(20) | ✅ | 手机号码，唯一索引 |
| email | email | VARCHAR(100) | ✅ | 电子邮箱 |
| profileJson | profile_json | TEXT | ✅ | 用户配置信息JSON |
| createdAt | created_at | DATETIME | ❌ | 记录创建时间 |
| updatedAt | updated_at | DATETIME | ❌ | 记录更新时间 |

---

## 枚举定义

### UserRole - 用户角色

```java
public enum UserRole {
    PATIENT("患者"),
    DOCTOR("医生"), 
    ADMIN("管理员");
    
    private final String description;
}
```

**角色说明**

| 枚举值 | 中文名称 | 权限范围 | 描述 |
|--------|----------|----------|------|
| PATIENT | 患者 | 基础权限 | 查看个人信息、预约挂号等 |
| DOCTOR | 医生 | 医生权限 | 查看患者信息、开具处方等 |
| ADMIN | 管理员 | 管理权限 | 系统管理、用户管理等 |

---

## 验证规则

### 通用验证

- **非空验证**: 所有必填字段不能为null或空字符串
- **长度验证**: 字符串字段需符合长度限制
- **格式验证**: 特殊格式字段需符合正则表达式

### 业务验证

- **用户名唯一性**: 注册时检查用户名是否已存在
- **手机号唯一性**: 注册时检查手机号是否已被使用
- **密码强度**: 密码至少6位，建议包含字母和数字
- **角色有效性**: 角色必须为预定义的枚举值

---

## 数据库关系

### 索引设计

```sql
-- 主键索引
PRIMARY KEY (user_id)

-- 唯一索引
UNIQUE KEY uk_username (username)
UNIQUE KEY uk_phone (phone)

-- 普通索引
KEY idx_role (role)
KEY idx_created_at (created_at)
```

### 外键关系

当前认证模块为基础模块，其他业务模块的用户相关表都会引用 `users.user_id` 作为外键。

---

## 更新日志

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| v1.0.0 | 2025-09-24 | 初始版本，定义基础认证模型 |

---

## 注意事项

1. **密码安全**: password字段在传输过程中为明文，存储时使用BCrypt加密
2. **Token安全**: JWT token包含敏感信息，需妥善保管
3. **JSON格式**: profileJson字段存储用户个性化配置，格式需验证
4. **时间格式**: 所有时间字段使用ISO 8601格式 (yyyy-MM-ddTHH:mm:ss)

---

📝 **开发建议**: 在前端开发时，建议创建对应的TypeScript接口定义，确保类型安全。