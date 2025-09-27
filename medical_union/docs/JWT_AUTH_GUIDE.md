# JWT认证系统使用指南

## 概述
本项目已成功集成JWT认证系统，提供完整的用户注册、登录和认证功能。

## API接口

### 1. 用户注册
- **POST** `/api/v1/auth/register`
- **Request Body:**
```json
{
    "username": "张医生",
    "password": "securePassword123",
    "role": "DOCTOR",
    "phone": "13800138000"
}
```
- **Response:**
```json
{
    "code": 0,
    "message": "OK",
    "data": {
        "userId": 1
    }
}
```

### 2. 用户登录
- **POST** `/api/v1/auth/login`
- **Request Body:**
```json
{
    "phone": "13800138000",
    "password": "securePassword123",
    "userType": "DOCTOR"
}
```
- **Response:**
```json
{
    "code": 0,
    "message": "OK",
    "data": {
        "userId": 1,
        "username": "张医生",
        "role": "DOCTOR",
        "profileJson": null,
        "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwidXNlcm5hbWUiOiLlvKDljLvnlJ8iLCJyb2xlIjoiRE9DVE9SIiwiaWF0IjoxNjk4ODQwMDAwLCJleHAiOjE2OTg5MjY0MDB9.xxx"
    }
}
```

### 3. 获取用户信息（需要JWT认证）
- **GET** `/api/v1/auth/user/info`
- **Headers:**
```
Authorization: Bearer <token>
```
- **Response:**
```json
{
    "code": 0,
    "message": "OK",
    "data": {
        "userId": 1,
        "username": "张医生",
        "role": "DOCTOR",
        "profileJson": null
    }
}
```

## JWT认证机制

### 1. Token生成
- 用户成功登录后，系统会生成JWT token
- Token包含用户ID、用户名、角色等信息
- Token有效期为24小时（86400000毫秒）

### 2. Token验证
- 除了注册和登录接口外，所有`/api/v1/`路径下的接口都需要JWT认证
- 客户端需要在请求头中携带token：`Authorization: Bearer <token>`
- 系统会自动验证token的有效性和完整性

### 3. 拦截器配置
- `JwtAuthInterceptor`：负责验证JWT token
- `WebConfig`：配置拦截器规则
- 排除的接口：
  - `/api/v1/auth/register`
  - `/api/v1/auth/login`

## 技术特性

### 1. 安全性
- 使用BCrypt进行密码哈希
- JWT token使用HMAC-SHA256算法签名
- 密钥配置在application.yml中（生产环境应使用环境变量）

### 2. 错误处理
- 完整的错误码体系
- 统一的异常处理机制
- 详细的错误信息返回

### 3. 代码质量
- 使用Lombok减少样板代码
- 清晰的分层架构
- 完整的类型安全

## 待完成任务

1. **存储过程集成**
   - 等待`sp_user_login`存储过程的完成
   - 等待`sp_user_get_info`存储过程的完成

2. **测试验证**
   - 完整的注册登录流程测试
   - JWT认证功能测试
   - 错误场景测试

## 下一步计划

1. 用户完成剩余存储过程的实现
2. 进行端到端的功能测试
3. 添加更多的业务接口（如用户资料更新、密码修改等）
4. 考虑添加刷新token机制

## 配置说明

### application.yml
```yaml
# JWT配置
jwt:
  secret: medicalUnionSecretKeyForJWTSigningMustBeLongEnough2024
  expiration: 86400000  # 24小时，单位毫秒
```

**注意：** 生产环境中应该：
1. 使用更长更复杂的密钥
2. 将密钥配置在环境变量中
3. 定期更换密钥
4. 考虑使用RSA非对称加密