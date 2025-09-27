# Phase 1 已实现接口文档

> 本文档描述当前后端已完成并可供前端联调的认证与用户基础信息相关接口。所有接口返回统一结构：
>
> ```json
> {
>   "success": true/false,
>   "code": 0,
>   "message": "OK",
>   "data": { ... }
> }
> ```
>
> - `success`: boolean，是否业务成功（非 HTTP 层面）。
> - `code`: 业务码，0 表示成功，其它见错误码一览。
> - `message`: 便于前端展示的文字（服务端可做国际化）。
> - `data`: 成功时有效，失败时可为 null。
>
> HTTP 状态码：
> - 200：请求被正常受理（即使业务失败也可能是 200，通过 `success` 判断）。
> - 4xx：参数明显非法或鉴权失败时可能抛出（后期视需要再细分）。
> - 5xx：意料之外的服务器错误。
>
> 所有需要登录态的接口需在 Header 中携带：
> `Authorization: Bearer <jwt-token>`
>
> JWT 解析得到 userId / role 等；当前阶段无需刷新 token 机制。

---
## 错误码一览（节选）
| code | 枚举 | 说明 |
|------|------|------|
| 0 | SUCCESS | 成功 |
| 1001 | USERNAME_ALREADY_EXISTS | 用户名已存在 |
| 1002 | INVALID_CREDENTIALS / INVALID_PASSWORD | 登录失败 / 密码错误 |
| 1003 | USER_NOT_FOUND | 用户不存在 |
| 1004 | WEAK_PASSWORD | 密码太弱（预留，当前可能未严格校验） |
| 1005 | INVALID_INPUT | 非法输入 |
| 1006 | UNAUTHORIZED | 未授权（缺少或非法 token） |
| 2001 | DB_ERROR | 数据库错误或未知错误码映射 |

> 说明：后端 `ErrorCode.fromCode(int)` 未识别的业务错误码会回退为 `DB_ERROR`。

---
## 1. 注册
### Endpoint
POST `/api/v1/auth/register`

### 请求参数（JSON）
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 用户名（唯一） |
| password | string | 是 | 明文密码，后端会执行 BCrypt 加密 |
| role | string | 是 | 用户角色（如 `patient` / `doctor`），具体可与产品约定 |
| phone | string | 否 | 手机号，可在注册阶段提供 |

### 响应（成功）
```json
{
  "success": true,
  "code": 0,
  "message": "OK",
  "data": {
    "userId": 123,
    "username": "alice",
    "role": "patient"
  }
}
```

### 失败示例（用户名已存在）
```json
{
  "success": false,
  "code": 1001,
  "message": "Username already exists",
  "data": null
}
```

---
## 2. 登录
### Endpoint
POST `/api/v1/auth/login`

### 请求参数（JSON）
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| loginName | string | 是 | 用户名或手机号（后端自动识别） |
| password | string | 是 | 明文密码 |
| userType | string | 否 | 预留：可用于区分 patient/doctor，当前逻辑中仍会解析角色 |

### 响应（成功）
```json
{
  "success": true,
  "code": 0,
  "message": "OK",
  "data": {
    "token": "<JWT_TOKEN>",
    "userId": 123,
    "username": "alice",
    "role": "patient"
  }
}
```

> token 需放入后续受保护接口 Header：`Authorization: Bearer <token>`。

### 失败示例（密码不正确）
```json
{
  "success": false,
  "code": 1002,
  "message": "Invalid password",
  "data": null
}
```

---
## 3. 获取当前用户信息
### Endpoint
GET `/api/v1/user/me`

### Headers
`Authorization: Bearer <JWT_TOKEN>`

### 响应（成功）
```json
{
  "success": true,
  "code": 0,
  "message": "OK",
  "data": {
    "userId": 123,
    "username": "alice",
    "role": "patient",
    "idNumber": "110101199001012345",
    "phone": "13800000000",
    "profileJson": "{\"name\":\"张三\",\"avatarUrl\":\"https://.../a.png\"}"
  }
}
```
`profileJson` 是原始 JSON 字符串，前端可自行解析。后续如果需要拆字段，可在 Phase 2 调整为结构化返回。

### 失败示例（未授权）
```json
{
  "success": false,
  "code": 1006,
  "message": "Unauthorized",
  "data": null
}
```

---
## 4. 更新当前用户资料
### Endpoint
PATCH `/api/v1/user/me`

### Headers
`Authorization: Bearer <JWT_TOKEN>`

### 请求参数（JSON）
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 否 | 姓名（为空表示不更新） |
| idNumber | string | 否 | 证件号（例如身份证号；为空表示不更新） |
| phone | string | 否 | 联系电话（为空表示不更新） |

> 后端调用存储过程 `sp_user_update_profile` 更新姓名（可映射到 username 或 real_name）、`id_number` 与 `phone`。当前实现不再写入/合并 profile JSON；后续可在 Phase 2 清理冗余 JSON 字段。

### 响应（成功）
```json
{
  "success": true,
  "code": 0,
  "message": "OK",
  "data": null
}
```

### 失败示例（用户不存在）
```json
{
  "success": false,
  "code": 1003,
  "message": "User not found",
  "data": null
}
```

---
## 5. 修改密码
### Endpoint
POST `/api/v1/user/change-password`

### Headers
`Authorization: Bearer <JWT_TOKEN>`

### 请求参数（JSON）
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| oldPassword | string | 是 | 旧密码（明文） |
| newPassword | string | 是 | 新密码（明文），后端 BCrypt 加密后写库 |

### 处理流程概要
1. 后端根据 token 解析 userId 查询用户。
2. 使用 `BCryptPasswordEncoder.matches(oldPassword, passwordHash)` 校验旧密码。
3. 通过 `sp_user_change_password` 写入新 hash。

### 响应（成功）
```json
{
  "success": true,
  "code": 0,
  "message": "OK",
  "data": null
}
```

### 失败示例（旧密码不正确）
```json
{
  "success": false,
  "code": 1002,
  "message": "Invalid password",
  "data": null
}
```

---
## 6. 统一响应结构说明
字段 | 类型 | 说明
-----|------|-----
success | boolean | 业务是否成功
code | int | 业务码
message | string | 人类可读信息
data | object | 具体数据（成功时）

---
## 7. 鉴权 / Token
- 登录成功生成 JWT，放入返回的 `data.token`。
- 前端存储（建议：内存 + 刷新失效策略，避免长期存 LocalStorage；当前阶段可临时 LocalStorage）。
- 每个需要鉴权的请求带上 Header：
```
Authorization: Bearer <token>
```
- 后端若解析失败或过期，返回 `code=1006`。

> 当前阶段未实现 refresh token，token 失效后需用户重新登录。

---
## 8. 示例调试顺序
1. 注册：`POST /api/v1/auth/register`
2. 登录：`POST /api/v1/auth/login` -> 取 token
3. 获取用户信息：`GET /api/v1/user/me` (带 token)
4. 更新资料：`PATCH /api/v1/user/me` (带 token)
5. 修改密码：`POST /api/v1/user/change-password` (带 token)
6. 用新密码重新登录验证

---
## 9. Postman / 前端联调提示
- 建议创建 Postman 环境变量：`{{baseUrl}}` 与 `{{authToken}}`。
- 登录后手动将返回 token 赋值给 `authToken`，后续请求设置 Header：`Authorization: Bearer {{authToken}}`。
- 也可在前端 Axios 拦截器里自动注入。

---
## 10. 兼容性与后续注意事项
1. `id_number` 与 `phone` 列：请确认数据库实际列名并确保已存在；若尚未添加，请在你完成存储过程改造时一并处理列结构。
2. `profile` / `profileJson`：目前 `GET /me` 返回旧 JSON；Phase 2 可逐步拆分并移除冗余。
3. 错误码扩展：若存储过程未来新增业务错误码，请同步在后端 `ErrorCode` 中添加枚举，以避免回退为 `DB_ERROR`。
4. 密码策略：当前未强制校验复杂度，可在 Phase 2 使用正则或 zxcvbn 评分增强。

---
## 11. 样例 Curl
```bash
# 注册
curl -X POST "http://localhost:8080/api/v1/auth/register" -H "Content-Type: application/json" -d '{"username":"alice","password":"Pass@123","role":"patient"}'

# 登录
curl -X POST "http://localhost:8080/api/v1/auth/login" -H "Content-Type: application/json" -d '{"loginName":"alice","password":"Pass@123"}'

# 获取个人信息
curl -H "Authorization: Bearer <TOKEN>" http://localhost:8080/api/v1/user/me

# 更新资料（部分字段更新即可）
curl -X PATCH "http://localhost:8080/api/v1/user/me" -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"name":"张三","idNumber":"110101199001012345","phone":"13800000000"}'

# 修改密码
curl -X POST "http://localhost:8080/api/v1/user/change-password" -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"oldPassword":"Pass@123","newPassword":"Pass@456"}'
```

---
## 12. 变更日志（当前文档）
- v1 (初稿)：覆盖 register / login / me / updateProfile / changePassword 及统一错误码。

