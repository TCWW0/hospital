# 认证模块 - 请求响应示例

## 概述

本文档提供认证模块所有API接口的详细请求响应示例，包括正常流程和异常情况的处理。

---

## 用户注册接口示例

### 成功注册

**请求示例**
```http
POST /api/v1/auth/register HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
    "username": "zhang_san_001",
    "password": "mypassword123",
    "role": "PATIENT",
    "phone": "13912345001"
}
```

**响应示例**
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
    "success": true,
    "code": 0,
    "message": "用户注册成功",
    "data": {
        "userId": 5,
        "message": "注册成功"
    }
}
```

### 用户名已存在

**请求示例**
```http
POST /api/v1/auth/register HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
    "username": "zhang_san_001",
    "password": "mypassword123", 
    "role": "PATIENT",
    "phone": "13912345002"
}
```

**响应示例**
```http
HTTP/1.1 409 Conflict
Content-Type: application/json

{
    "success": false,
    "code": 1001,
    "message": "用户名已存在",
    "data": null
}
```

### 手机号已存在

**请求示例**
```http
POST /api/v1/auth/register HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
    "username": "li_si_001",
    "password": "mypassword123",
    "role": "PATIENT", 
    "phone": "13912345001"
}
```

**响应示例**
```http
HTTP/1.1 409 Conflict
Content-Type: application/json

{
    "success": false,
    "code": 1004,
    "message": "手机号已被注册",
    "data": null
}
```

### 参数验证失败

**请求示例**
```http
POST /api/v1/auth/register HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
    "username": "ab",
    "password": "123",
    "role": "INVALID_ROLE",
    "phone": "139123"
}
```

**响应示例**
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
    "success": false,
    "code": 400,
    "message": "请求参数验证失败",
    "data": {
        "errors": [
            "用户名长度必须在3-50字符之间",
            "密码长度不能少于6位",
            "用户角色无效",
            "手机号格式不正确"
        ]
    }
}
```

---

## 用户登录接口示例

### 成功登录

**请求示例**
```http
POST /api/v1/auth/login HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
    "phone": "13912345001",
    "password": "mypassword123",
    "userType": "PATIENT"
}
```

**响应示例**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
    "success": true,
    "code": 0,
    "message": "登录成功",
    "data": {
        "userId": 5,
        "username": "zhang_san_001",
        "role": "PATIENT",
        "profileJson": null,
        "token": "eyJhbGciOiJIUzM4NCJ9.eyJyb2xlIjoiUEFUSUVOVCIsInVzZXJJZCI6NSwidXNlcm5hbWUiOiJ6aGFuZ19zYW5fMDAxIiwic3ViIjoiemhhbmdfc2FuXzAwMSIsImlhdCI6MTc1ODY5NDk0NiwiZXhwIjoxNzU4NzgxMzQ2fQ.YkBmG7r8s9V3R5JL8A2KxC6pD9mE5fN2sT4wX7vY1qB3nO8pQ9uR0kM6hG5jF2aZ"
    }
}
```

### 密码错误

**请求示例**
```http
POST /api/v1/auth/login HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
    "phone": "13912345001",
    "password": "wrongpassword",
    "userType": "PATIENT"
}
```

**响应示例**
```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
    "success": false,
    "code": 1002,
    "message": "密码错误",
    "data": null
}
```

### 用户不存在

**请求示例**
```http
POST /api/v1/auth/login HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
    "phone": "13999999999",
    "password": "mypassword123",
    "userType": "PATIENT"
}
```

**响应示例**
```http
HTTP/1.1 404 Not Found
Content-Type: application/json

{
    "success": false,
    "code": 1003,
    "message": "用户不存在",
    "data": null
}
```

### 用户类型不匹配

**请求示例**
```http
POST /api/v1/auth/login HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
    "phone": "13912345001",
    "password": "mypassword123",
    "userType": "DOCTOR"
}
```

**响应示例**
```http
HTTP/1.1 403 Forbidden
Content-Type: application/json

{
    "success": false,
    "code": 1005,
    "message": "用户类型不匹配",
    "data": null
}
```

---

## 获取用户信息接口示例

### 成功获取用户信息

**请求示例**
```http
GET /api/v1/auth/user/info HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzM4NCJ9.eyJyb2xlIjoiUEFUSUVOVCIsInVzZXJJZCI6NSwidXNlcm5hbWUiOiJ6aGFuZ19zYW5fMDAxIiwic3ViIjoiemhhbmdfc2FuXzAwMSIsImlhdCI6MTc1ODY5NDk0NiwiZXhwIjoxNzU4NzgxMzQ2fQ.YkBmG7r8s9V3R5JL8A2KxC6pD9mE5fN2sT4wX7vY1qB3nO8pQ9uR0kM6hG5jF2aZ
```

**响应示例**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
    "success": true,
    "code": 0,
    "message": "获取用户信息成功",
    "data": {
        "userId": 5,
        "username": "zhang_san_001",
        "role": "PATIENT",
        "profileJson": "{\"theme\":\"light\",\"language\":\"zh-CN\"}"
    }
}
```

### Token缺失

**请求示例**
```http
GET /api/v1/auth/user/info HTTP/1.1
Host: localhost:8080
```

**响应示例**
```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
    "success": false,
    "code": 401,
    "message": "缺少访问令牌",
    "data": null
}
```

### Token无效

**请求示例**
```http
GET /api/v1/auth/user/info HTTP/1.1
Host: localhost:8080
Authorization: Bearer invalid.token.here
```

**响应示例**
```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
    "success": false,
    "code": 401,
    "message": "访问令牌无效",
    "data": null
}
```

### Token过期

**请求示例**
```http
GET /api/v1/auth/user/info HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzM4NCJ9.expired.token
```

**响应示例**
```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
    "success": false,
    "code": 401,
    "message": "访问令牌已过期",
    "data": null
}
```

---

## 完整测试流程示例

以下是一个完整的测试流程，展示了从注册到获取用户信息的全过程：

### 步骤1：用户注册

```bash
curl -X POST "http://localhost:8080/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_user_demo",
    "password": "demo123456",
    "role": "PATIENT",
    "phone": "13800138888"
  }'
```

**预期响应**：
```json
{
    "success": true,
    "code": 0,
    "message": "用户注册成功",
    "data": {
        "userId": 6,
        "message": "注册成功"
    }
}
```

### 步骤2：用户登录

```bash
curl -X POST "http://localhost:8080/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "13800138888",
    "password": "demo123456",
    "userType": "PATIENT"
  }'
```

**预期响应**：
```json
{
    "success": true,
    "code": 0,
    "message": "登录成功",
    "data": {
        "userId": 6,
        "username": "test_user_demo",
        "role": "PATIENT",
        "profileJson": null,
        "token": "eyJhbGciOiJIUzM4NCJ9..."
    }
}
```

### 步骤3：获取用户信息

```bash
curl -X GET "http://localhost:8080/api/v1/auth/user/info" \
  -H "Authorization: Bearer eyJhbGciOiJIUzM4NCJ9..."
```

**预期响应**：
```json
{
    "success": true,
    "code": 0,
    "message": "获取用户信息成功",
    "data": {
        "userId": 6,
        "username": "test_user_demo",
        "role": "PATIENT",
        "profileJson": null
    }
}
```

---

## Postman 测试集合

### 环境变量设置

在Postman中设置以下环境变量：

```json
{
    "baseUrl": "http://localhost:8080",
    "jwt_token": "",
    "userId": ""
}
```

### 测试用例Pre-script和Tests

#### 注册接口Tests脚本

```javascript
// 验证响应状态
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

// 验证响应格式
pm.test("Response has correct format", function () {
    const responseJson = pm.response.json();
    pm.expect(responseJson).to.have.property('success', true);
    pm.expect(responseJson).to.have.property('code', 0);
    pm.expect(responseJson.data).to.have.property('userId');
});

// 保存用户ID
if (pm.response.code === 201) {
    const responseJson = pm.response.json();
    pm.environment.set("userId", responseJson.data.userId);
}
```

#### 登录接口Tests脚本

```javascript
// 验证响应状态
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

// 验证JWT token
pm.test("Response contains JWT token", function () {
    const responseJson = pm.response.json();
    pm.expect(responseJson.data).to.have.property('token');
    pm.expect(responseJson.data.token).to.be.a('string');
    pm.expect(responseJson.data.token).to.not.be.empty;
});

// 保存JWT token
if (pm.response.code === 200) {
    const responseJson = pm.response.json();
    pm.environment.set("jwt_token", responseJson.data.token);
}
```

#### 用户信息接口Tests脚本

```javascript
// 验证响应状态
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

// 验证用户信息
pm.test("Response contains user info", function () {
    const responseJson = pm.response.json();
    pm.expect(responseJson.data).to.have.property('userId');
    pm.expect(responseJson.data).to.have.property('username');
    pm.expect(responseJson.data).to.have.property('role');
});

// 验证用户ID一致性
pm.test("User ID matches", function () {
    const responseJson = pm.response.json();
    const savedUserId = pm.environment.get("userId");
    pm.expect(responseJson.data.userId.toString()).to.equal(savedUserId);
});
```

---

## 错误处理示例

### 服务器内部错误

**响应示例**
```http
HTTP/1.1 500 Internal Server Error
Content-Type: application/json

{
    "success": false,
    "code": 500,
    "message": "服务器内部错误，请稍后重试",
    "data": null
}
```

### 请求格式错误

**响应示例**
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
    "success": false,
    "code": 400,
    "message": "请求格式错误：JSON解析失败",
    "data": null
}
```

---

## 性能测试建议

### 并发注册测试

使用工具如JMeter或Artillery进行并发注册测试：

```yaml
# artillery测试配置
config:
  target: 'http://localhost:8080'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "用户注册测试"
    requests:
      - post:
          url: "/api/v1/auth/register"
          json:
            username: "user_{{ $randomString() }}"
            password: "password123"
            role: "PATIENT"
            phone: "139{{ $randomInt(10000000, 99999999) }}"
```

---

## 更新日志

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| v1.0.0 | 2025-09-24 | 初始版本，包含所有认证接口的请求响应示例 |

---

📝 **使用建议**: 建议开发团队将这些示例集成到自动化测试中，确保API的稳定性和可靠性。