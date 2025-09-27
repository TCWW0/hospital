# 用户模块 API（前端对接草案）

本文件为前端视角产出的用户/患者模块 API 设计草案，供后端实现与联调使用。统一遵循与认证模块一致的前缀与返回规范。

- 统一前缀：`/api/v1`
- 认证方式：HTTP Header `Authorization: Bearer <token>`（登录后获取）
- 响应包裹：
  - 成功：`{ code: 200, message: string, data: any }`（或 `{ code: 0, ... }` 也视为成功）
  - 失败：`{ code: <非200/0>, message: string, data?: any }`
- 常见错误码：
  - `401` 未认证/Token 失效（前端会自动重定向至 `/login`）
  - `403` 无权限
  - `404` 资源不存在
  - `422` 参数校验失败
  - `500` 服务器内部错误
- 分页约定：查询类接口使用 `page`（从 1 开始）、`size`，返回 `total`、`list` 数组。

---

## 1. 通用用户信息

### 1.1 获取当前登录用户信息
- GET `/api/v1/user/me`
- Header: `Authorization: Bearer <token>`
- Resp（示例）：
```json
{
  "code": 200,
  "message": "OK",
  "data": {
    "userId": 10001,
    "username": "patient001",
    "name": "张三",
    "userType": "PATIENT",
    "phone": "13800000000",
    "avatarUrl": "https://.../avatar.png"
  }
}
```

### 1.2 更新当前用户基础信息（昵称/头像等）
- PATCH `/api/v1/user/me`
- Body：
```json
{
  "name": "张三",
  "avatarUrl": "https://.../avatar.png"
}
```
- Resp：`{ code, message }`

### 1.3 修改密码
- POST `/api/v1/user/change-password`
- Body：
```json
{ "oldPassword": "***", "newPassword": "***" }
```
- Resp：`{ code, message }`

---

## 2. 患者中心（Patient Center）
患者相关接口统一前缀建议：`/api/v1/patient`

### 2.1 获取患者档案
- GET `/api/v1/patient/profile`
- Resp（示例）：
```json
{
  "code": 200,
  "message": "OK",
  "data": {
    "patientId": 20001,
    "name": "张三",
    "gender": "MALE",
    "birthDate": "1990-01-01",
    "idCard": "110101199001010011",
    "phone": "13800000000",
    "address": "北京市朝阳区...",
    "medicalCardNo": "MC12345678"
  }
}
```

### 2.2 更新患者档案
- PUT `/api/v1/patient/profile`
- Body：与 2.1 的 `data` 字段一致（可部分字段）
- Resp：`{ code, message }`

### 2.3 就诊记录列表
- GET `/api/v1/patient/visits?page=1&size=10&startDate=2025-01-01&endDate=2025-12-31`
- Resp：
```json
{
  "code": 200,
  "message": "OK",
  "data": {
    "page": 1,
    "size": 10,
    "total": 35,
    "list": [
      {
        "visitId": 310001,
        "date": "2025-09-01",
        "hospitalId": 501,
        "hospitalName": "市中心医院",
        "department": "心内科",
        "doctorId": 9001,
        "doctorName": "李医生",
        "diagnosis": "高血压",
        "status": "FINISHED"
      }
    ]
  }
}
```

### 2.4 就诊记录详情
- GET `/api/v1/patient/visits/{visitId}`
- Resp（示例，精简）：
```json
{
  "code": 200,
  "message": "OK",
  "data": {
    "visitId": 310001,
    "date": "2025-09-01",
    "hospital": { "id": 501, "name": "市中心医院" },
    "department": "心内科",
    "doctor": { "id": 9001, "name": "李医生" },
    "chiefComplaint": "头晕、乏力",
    "diagnosis": "高血压",
    "prescriptions": [
      { "name": "药品A", "spec": "10mg*30", "dosage": "每日一次" }
    ],
    "attachments": [
      { "url": "https://.../report1.pdf", "type": "LAB_REPORT" }
    ]
  }
}
```

### 2.5 转诊记录列表
- GET `/api/v1/patient/referrals?page=1&size=10&status=PENDING`
- Resp：`{ code, message, data: { page, size, total, list: [...] } }`

### 2.6 发起转诊（如患者可自助申请则保留，否则后端/医生端）
- POST `/api/v1/patient/referrals`
- Body：
```json
{
  "toHospitalId": 502,
  "reason": "进一步检查",
  "attachments": ["https://.../img1.png"]
}
```
- Resp：`{ code, message, data: { referralId } }`

---

## 3. 医院与医生检索（患者侧）

### 3.1 医院列表
- GET `/api/v1/hospitals?page=1&size=10&level=3A&keyword=中心`
- Resp（示例）：
```json
{
  "code": 200,
  "message": "OK",
  "data": {
    "page": 1,
    "size": 10,
    "total": 120,
    "list": [
      { "id": 501, "name": "市中心医院", "level": "3A", "address": "...", "departments": ["内科","外科"] }
    ]
  }
}
```

### 3.2 医院详情
- GET `/api/v1/hospitals/{id}`
- Resp：`{ code, message, data: { id, name, level, address, departments, contact, intro } }`

### 3.3 医生列表检索
- GET `/api/v1/doctors?page=1&size=10&hospitalId=501&department=心内科&keyword=李`
- Resp：`{ code, message, data: { page, size, total, list: [{ id, name, title, hospitalName, department, rating, goodAt }] } }`

### 3.4 医生详情
- GET `/api/v1/doctors/{id}`
- Resp：`{ code, message, data: { id, name, title, hospital, department, intro, goodAt, rating, schedules: [...] } }`

### 3.5 医生排班
- GET `/api/v1/doctors/{id}/schedules?start=2025-09-01&end=2025-09-07`
- Resp：
```json
{
  "code": 200,
  "message": "OK",
  "data": [
    { "scheduleId": 70001, "date": "2025-09-01", "timeSlots": ["AM","PM"], "remain": 8, "fee": 20 }
  ]
}
```

---

## 4. 预约挂号（患者侧）

### 4.1 创建预约
- POST `/api/v1/appointments`
- Body：
```json
{
  "doctorId": 9001,
  "scheduleId": 70001,
  "timeSlot": "AM"
}
```
- Resp：`{ code, message, data: { appointmentId } }`

### 4.2 我的预约列表
- GET `/api/v1/appointments?page=1&size=10&status=BOOKED`
- Resp：`{ code, message, data: { page, size, total, list: [{ id, date, hospitalName, department, doctorName, timeSlot, status }] } }`

### 4.3 预约详情
- GET `/api/v1/appointments/{id}`
- Resp：`{ code, message, data: { id, date, voucherUrl?, qrcode?, status, ... } }`

### 4.4 取消预约
- POST `/api/v1/appointments/{id}/cancel`
- Resp：`{ code, message }`

---

## 5. 远程医疗（患者侧）

### 5.1 申请远程医疗
- POST `/api/v1/telemedicine/apply`
- Body：
```json
{
  "doctorId": 9001,
  "description": "近期头晕，想进行远程会诊",
  "attachments": ["https://.../img1.png"]
}
```
- Resp：`{ code, message, data: { requestId } }`

### 5.2 我的远程医疗申请列表
- GET `/api/v1/telemedicine/requests?page=1&size=10&status=PENDING`
- Resp：`{ code, message, data: { page, size, total, list: [...] } }`

---

## 6. 统一规范与说明

- 认证：除登录/公开检索（如医院列表/医生列表可开放）外，其余接口需携带 `Authorization`。
- 返回码：后端尽量返回 `code=200`（或 `0`）表示业务成功；401/403/404/422/500 为 HTTP 层错误。
- 时间与时区：日期推荐 `YYYY-MM-DD`，时间戳使用 ISO8601（带时区）或统一为东八区。
- 列表最大页大小：建议 `size<=100`；如需导出请单独提供导出接口。
- 字段命名：统一使用 `camelCase`；ID 统一为数字型（如需字符串 ID 请文档标注）。

---

## 7. 后续扩展（可选）
- 通知中心：`GET /api/v1/notifications`、标记已读等。
- 实名与绑定：`POST /api/v1/patient/bind-idcard`、`POST /api/v1/patient/bind-medical-card`。
- 文件上传：`POST /api/v1/files`（返回可访问 URL），用于病历/影像等附件。

---

## 8. 示例错误返回
```json
{
  "code": 422,
  "message": "手机号格式不正确",
  "data": {
    "field": "phone"
  }
}
```

以上为前端对接的用户/患者侧 API 草案，若后端有既定数据模型，可基于本草案进行字段映射/调整，保持路径前缀与响应包装一致即可。