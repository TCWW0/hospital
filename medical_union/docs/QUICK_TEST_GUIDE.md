# 认证模块快速测试指南

## 🚀 快速开始

### 1. 启动应用
确保Spring Boot应用已启动并运行在 `http://localhost:8080`

### 2. Postman导入
1. 打开Postman
2. 点击 `Import` 
3. 选择 `Medical_Union_Auth_API_Tests.postman_collection.json` 文件
4. 创建Environment并设置变量：
   - `base_url`: `http://localhost:8080`
   - `jwt_token`: (暂时留空)

## 📝 推荐测试顺序

### 测试序列A：完整注册登录流程
1. **用户注册测试** ➡️ 创建新用户
2. **用户登录测试** ➡️ 登录并获取token
3. **获取用户信息测试** ➡️ 验证token和用户信息

### 测试序列B：使用现有数据
使用数据库中已存在的用户进行测试：

**方案1 - 使用testuser（推荐）**:
```json
{
    "phone": "13800138000",
    "password": "password123",
    "userType": "PATIENT"
}
```

**方案2 - 用户名登录**:
```json
{
    "phone": "testuser",
    "password": "password123", 
    "userType": "PATIENT"
}
```

## 🔧 手动测试命令

### PowerShell测试命令

**1. 注册新用户**:
```powershell
$body = @{
    username = "新用户$(Get-Random)"
    password = "password123"
    role = "PATIENT"
    phone = "139$(Get-Random -Minimum 10000000 -Maximum 99999999)"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/register" -Method POST -ContentType "application/json" -Body $body
```

**2. 用户登录**:
```powershell
$loginBody = @{
    phone = "13800138000"
    password = "password123"
    userType = "PATIENT"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
$token = $response.data.token
Write-Host "Token: $token"
```

**3. 获取用户信息**:
```powershell
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/user/info" -Method GET -Headers $headers
```

## ❗ 常见问题解决

### Q1: 500内部服务器错误
- **原因**: 通常是数据库连接问题或存储过程错误
- **解决**: 检查MySQL服务是否启动，数据库连接配置是否正确

### Q2: 401未授权错误  
- **原因**: JWT token无效或已过期
- **解决**: 重新登录获取新token

### Q3: 用户名或密码错误
- **原因**: 密码不匹配或用户不存在
- **解决**: 
  - 使用正确的测试数据
  - 确认用户存在于数据库中
  - 使用BCrypt加密的密码进行验证

### Q4: 手机号格式错误
- **原因**: 手机号不是11位或格式不正确
- **解决**: 使用正确格式：13xxxxxxxxx

## 📊 预期测试结果

### 成功场景
- **注册成功**: HTTP 201, code=0, 返回userId
- **登录成功**: HTTP 200, code=0, 返回token和用户信息
- **获取信息成功**: HTTP 200, code=0, 返回用户详细信息

### 失败场景  
- **重复注册**: HTTP 400, code=1001
- **登录失败**: HTTP 400, code=1002
- **无权访问**: HTTP 400, code=1006

## 🎯 验证要点

### JWT Token验证
- Token格式正确（三段式，用.分隔）
- 包含用户信息（userId, username, role）
- 24小时有效期

### 数据完整性验证
- 用户信息返回完整
- 敏感信息已正确脱敏
- 角色权限正确匹配

### 安全性验证
- 密码BCrypt加密存储
- 无token访问被正确拦截
- 错误信息不泄露敏感数据

---

## 🚦 测试状态检查

在进行测试前，请确认：

- [ ] MySQL服务运行正常
- [ ] Spring Boot应用启动成功（端口8080）
- [ ] 数据库包含测试数据
- [ ] Postman环境配置正确

**准备就绪后，开始测试吧！** 🎉