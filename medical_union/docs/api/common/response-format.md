# 统一响应格式规范

## 概述

Medical Union 系统采用统一的API响应格式，确保所有模块的接口保持一致性，便于前端开发和系统集成。

---

## 标准响应格式

### 基本结构

所有API响应都遵循以下JSON格式：

```json
{
    "success": boolean,     // 操作是否成功
    "code": integer,        // 响应状态码
    "message": string,      // 响应消息
    "data": object|null     // 响应数据
}
```

### 字段说明

| 字段名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| success | boolean | ✅ | 操作结果标识，true表示成功，false表示失败 |
| code | integer | ✅ | 响应状态码，0表示成功，其他值表示不同类型的错误 |
| message | string | ✅ | 人类可读的响应消息，用于显示给用户或调试 |
| data | object/null | ✅ | 具体的响应数据，成功时包含业务数据，失败时通常为null |

---

## 成功响应

### 操作成功

**格式示例**：
```json
{
    "success": true,
    "code": 0,
    "message": "操作成功",
    "data": {
        // 具体的业务数据
    }
}
```

### 不同业务场景的成功响应

#### 创建资源（如用户注册）

```json
{
    "success": true,
    "code": 0,
    "message": "用户注册成功",
    "data": {
        "userId": 123,
        "message": "注册成功"
    }
}
```

#### 查询资源（如获取用户信息）

```json
{
    "success": true,
    "code": 0,
    "message": "获取用户信息成功",
    "data": {
        "userId": 123,
        "username": "zhang_san",
        "role": "PATIENT",
        "profileJson": null
    }
}
```

#### 列表查询（如分页数据）

```json
{
    "success": true,
    "code": 0,
    "message": "查询成功",
    "data": {
        "items": [
            // 列表项数据
        ],
        "pagination": {
            "page": 1,
            "size": 10,
            "total": 100,
            "totalPages": 10
        }
    }
}
```

#### 更新资源

```json
{
    "success": true,
    "code": 0,
    "message": "更新成功",
    "data": {
        "updatedFields": ["username", "phone"],
        "updatedAt": "2025-09-24T14:30:00"
    }
}
```

#### 删除资源

```json
{
    "success": true,
    "code": 0,
    "message": "删除成功",
    "data": {
        "deletedId": 123,
        "deletedAt": "2025-09-24T14:30:00"
    }
}
```

---

## 错误响应

### 基本错误格式

```json
{
    "success": false,
    "code": 错误代码,
    "message": "错误描述",
    "data": null
}
```

### 客户端错误（4xx）

#### 参数验证错误 (400)

```json
{
    "success": false,
    "code": 400,
    "message": "请求参数验证失败",
    "data": {
        "errors": [
            {
                "field": "username",
                "message": "用户名长度必须在3-50字符之间"
            },
            {
                "field": "password",
                "message": "密码长度不能少于6位"
            }
        ]
    }
}
```

#### 未授权访问 (401)

```json
{
    "success": false,
    "code": 401,
    "message": "未授权访问，请先登录",
    "data": null
}
```

#### 权限不足 (403)

```json
{
    "success": false,
    "code": 403,
    "message": "权限不足，无法访问此资源",
    "data": {
        "requiredRole": "ADMIN",
        "currentRole": "PATIENT"
    }
}
```

#### 资源不存在 (404)

```json
{
    "success": false,
    "code": 404,
    "message": "请求的资源不存在",
    "data": {
        "resourceType": "User",
        "resourceId": 999
    }
}
```

#### 资源冲突 (409)

```json
{
    "success": false,
    "code": 409,
    "message": "资源冲突：用户名已存在",
    "data": {
        "conflictField": "username",
        "conflictValue": "zhang_san"
    }
}
```

### 服务器错误（5xx）

#### 内部服务器错误 (500)

```json
{
    "success": false,
    "code": 500,
    "message": "服务器内部错误，请稍后重试",
    "data": {
        "errorId": "ERR_20250924_143000_001",
        "timestamp": "2025-09-24T14:30:00"
    }
}
```

#### 服务不可用 (503)

```json
{
    "success": false,
    "code": 503,
    "message": "服务暂时不可用，请稍后重试",
    "data": {
        "retryAfter": 30,
        "maintenanceWindow": "2025-09-24T15:00:00 - 2025-09-24T16:00:00"
    }
}
```

---

## 业务错误码

### 错误码分类

错误码采用4位数字格式，按模块和类型进行分类：

| 范围 | 模块 | 描述 |
|------|------|------|
| 0 | 通用 | 成功 |
| 100-199 | 通用 | 系统级错误 |
| 1000-1999 | 认证模块 | 用户认证相关错误 |
| 2000-2999 | 患者模块 | 患者业务相关错误 |
| 3000-3999 | 医生模块 | 医生业务相关错误 |
| 4000-4999 | 预约模块 | 预约业务相关错误 |
| 5000-5999 | 支付模块 | 支付业务相关错误 |

### 认证模块错误码 (1000-1999)

| 错误码 | 描述 | HTTP状态码 | 处理建议 |
|--------|------|------------|----------|
| 1001 | 用户名已存在 | 409 | 使用其他用户名 |
| 1002 | 密码错误 | 401 | 检查密码是否正确 |
| 1003 | 用户不存在 | 404 | 检查用户信息或先注册 |
| 1004 | 手机号已被注册 | 409 | 使用其他手机号或找回账户 |
| 1005 | 用户类型不匹配 | 403 | 检查登录类型是否正确 |
| 1006 | 账户已被锁定 | 423 | 联系管理员解锁 |
| 1007 | 密码已过期 | 403 | 更新密码 |

---

## HTTP状态码映射

### 标准HTTP状态码使用

| HTTP状态码 | 使用场景 | 响应code字段 |
|------------|----------|--------------|
| 200 OK | 查询、更新、删除成功 | 0 |
| 201 Created | 创建资源成功 | 0 |
| 400 Bad Request | 请求参数错误 | 400 |
| 401 Unauthorized | 未认证 | 401 |
| 403 Forbidden | 无权限 | 403 |
| 404 Not Found | 资源不存在 | 404 |
| 409 Conflict | 资源冲突 | 409, 1001, 1004等 |
| 500 Internal Server Error | 服务器错误 | 500 |

### 状态码选择原则

1. **优先使用标准HTTP状态码**：反映请求的基本处理结果
2. **通过code字段细化错误类型**：提供具体的业务错误信息
3. **保持一致性**：相同类型的错误使用相同的状态码和错误码

---

## 分页响应格式

### 标准分页格式

```json
{
    "success": true,
    "code": 0,
    "message": "查询成功",
    "data": {
        "items": [
            // 数据项列表
        ],
        "pagination": {
            "page": 1,          // 当前页码（从1开始）
            "size": 10,         // 每页大小
            "total": 156,       // 总记录数
            "totalPages": 16,   // 总页数
            "hasNext": true,    // 是否有下一页
            "hasPrev": false    // 是否有上一页
        }
    }
}
```

### 空结果响应

```json
{
    "success": true,
    "code": 0,
    "message": "查询成功",
    "data": {
        "items": [],
        "pagination": {
            "page": 1,
            "size": 10,
            "total": 0,
            "totalPages": 0,
            "hasNext": false,
            "hasPrev": false
        }
    }
}
```

---

## 时间格式规范

### 标准时间格式

所有时间字段统一使用ISO 8601格式：

```
YYYY-MM-DDTHH:mm:ss
```

**示例**：
- `2025-09-24T14:30:00` （本地时间）
- `2025-09-24T14:30:00Z` （UTC时间）
- `2025-09-24T14:30:00+08:00` （带时区）

### 时间字段命名

| 字段名 | 含义 | 示例 |
|--------|------|------|
| createdAt | 创建时间 | "2025-09-24T14:30:00" |
| updatedAt | 更新时间 | "2025-09-24T14:30:00" |
| deletedAt | 删除时间 | "2025-09-24T14:30:00" |
| expiresAt | 过期时间 | "2025-09-25T14:30:00" |

---

## 实现指南

### Java Spring Boot实现

#### ApiResponse类定义

```java
public class ApiResponse {
    private boolean success;
    private int code;
    private String message;
    private Object data;
    
    // 成功响应静态方法
    public static ApiResponse success(String message, Object data) {
        return new ApiResponse(true, 0, message, data);
    }
    
    public static ApiResponse success(String message) {
        return success(message, null);
    }
    
    // 错误响应静态方法
    public static ApiResponse error(int code, String message) {
        return new ApiResponse(false, code, message, null);
    }
    
    public static ApiResponse error(int code, String message, Object data) {
        return new ApiResponse(false, code, message, data);
    }
}
```

#### 全局异常处理器

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(BizException.class)
    public ResponseEntity<ApiResponse> handleBizException(BizException e) {
        return ResponseEntity.status(e.getHttpStatus())
                .body(ApiResponse.error(e.getCode(), e.getMessage()));
    }
    
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ApiResponse> handleValidation(ValidationException e) {
        return ResponseEntity.badRequest()
                .body(ApiResponse.error(400, "参数验证失败", e.getErrors()));
    }
}
```

### 前端使用示例

#### TypeScript接口定义

```typescript
interface ApiResponse<T = any> {
    success: boolean;
    code: number;
    message: string;
    data: T | null;
}

// 使用示例
async function login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    });
    
    const result: ApiResponse<LoginResponse> = await response.json();
    
    if (!result.success) {
        throw new Error(result.message);
    }
    
    return result.data!;
}
```

---

## 最佳实践

### 开发规范

1. **消息本地化**：message字段支持国际化，根据请求头`Accept-Language`返回对应语言
2. **错误追踪**：重要错误在data中包含errorId，便于问题追踪
3. **版本兼容**：新增字段放在data中，避免破坏现有API结构
4. **性能考虑**：大数据量响应考虑分页，避免单次返回过多数据

### 测试建议

1. **自动化测试**：验证所有API响应格式符合规范
2. **错误场景覆盖**：确保各种错误情况都返回正确的响应格式
3. **性能测试**：验证响应时间和数据量的合理性

---

## 更新日志

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| v1.0.0 | 2025-09-24 | 初始版本，定义基础响应格式规范 |

---

📝 **注意**: 本规范适用于所有Medical Union系统的API接口，请严格遵循执行。