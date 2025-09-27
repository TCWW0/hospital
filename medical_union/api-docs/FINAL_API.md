Medical Union — 完整 API 文档（基于前端实现与 mock）

说明
- 该文档由 `medical-union-front` 前端代码和其 mock 实现生成，作为后端实现的契约。
- 所有接口均以统一前缀 `/api/v1` 为根（例如 `https://api.example.com/api/v1/patients`）。
- 前端请求器期望后端返回 `envelope` 格式：

  {
    "code": <number>,
    "message": "<string>",
    "data": <object | array | null>
  }

  其中：code=200 表示成功，非 200 表示业务错误（同时使用 HTTP 状态码以便诊断）。
- 认证方式：Bearer JWT（Header: Authorization: Bearer <token>）。某些 mock/开发场景可允许跳过认证。

目录
- 1. 认证（Auth）
- 2. 患者（Patients）
- 3. 转诊（Referrals）
- 4. 预约（Appointments）
- 5. 远程会诊 / 远程问诊（Telemedicine）
- 6. 医生（Doctors）
- 7. 排班（Schedules）
- 8. 支付（Payments）
- 9. 医院（Hospitals）
- 10. 统计（Statistics）
- 11. 附件上传（Attachments）
- 12. 系统健康（Health）
- 附录：错误码 / 实现提示 / 与数据库对齐建议

---

## 1. 认证（Auth）

### POST /api/v1/auth/login
- 描述：用户登录，返回 JWT token 与用户信息
- 认证：不需要
- 请求体（application/json）：
  {
    "phone": "string",
    "password": "string",
    "userType": "PATIENT|DOCTOR|ADMIN" (可选)
  }
- 响应（200）：
  {
    "code": 200,
    "message": "OK",
    "data": {
      "token": "<jwt-token>",
      "user": { "id": 1, "username": "xxx", "userType": "PATIENT", "relatedId": 123 }
    }
  }
- 错误：400（参数错误）、401（认证失败）
- 实现提示：返回的 token 供后续请求放入 `Authorization` header；建议返回 user.relatedId 对应患者/医生表主键以便客户端导航。

### POST /api/v1/auth/logout
- 描述：登出（可选 - 前端直接删除本地 token）
- 认证：需要（如果实现为服务端黑名单则需要）
- 请求体：无
- 响应（200）：{ code:200, message:"OK", data: null }

---

## 2. 患者（Patients）

### GET /api/v1/patients
- 描述：分页/筛选患者列表
- 认证：需要
- Query 参数：
  - q: string （可选，名称/手机号/ID 的模糊查询）
  - page: integer（默认 1）
  - pageSize: integer（默认 20）
  - status: all|ongoing|completed（可选）
  - triage: high|medium|low（可选）
  - department: string（可选）
- 响应（200）示例：
  {
    "code":200,
    "message":"OK",
    "data":{
      "total": 123,
      "page": 1,
      "pageSize": 20,
      "items": [
        { "id":"p1", "name":"张三", "age":45, "gender":"M", "phone":"138...", "lastVisit":"2025-09-18T10:00:00Z", "triage":"high", "status":"ongoing" }
      ]
    }
  }
- 实现提示：返回的 items 可为 DTO（简短字段）。若使用数据库，按 `page`/`pageSize` 返回，并提供索引（姓名、phone）的模糊查询支持。

### POST /api/v1/patients
- 描述：创建患者
- 认证：需要（或仅允许 admin/doctor）
- 请求体：PatientCreate
  {
    "name": "string",
    "idCard": "string",
    "gender": "string",
    "birthDate": "YYYY-MM-DD",
    "phone": "string",
    "address": "string",
    "triage": "high|medium|low",
    ...
  }
- 响应：201 Created，envelope 中包含创建后的 patient 对象
- 验证：检查必填字段（name）与格式（idCard/phone）

### GET /api/v1/patients/{id}
- 描述：获取单个患者详情
- 认证：需要
- Path 参数：id（string）
- 响应（200）：{ code:200, message:'OK', data: Patient }
- 错误：404（未找到）

### PUT /api/v1/patients/{id}
- 描述：更新患者
- 请求体：Partial Patient（允许部分字段）
- 响应：200，返回更新后的患者对象

### DELETE /api/v1/patients/{id}
- 描述：删除患者（慎用）
- 响应：204 No Content（或 200 + envelope）

### GET /api/v1/patients/{id}/visits
- 描述：获取患者就诊/就诊记录列表
- 响应：200，返回 Visit[]

---

## 3. 转诊（Referrals）

### GET /api/v1/referrals
- 描述：分页/筛选转诊记录
- Query 参数：page, pageSize, q, status (pending|accepted|rejected|all)
- 响应示例（200）:
  {
    "code":200,
    "message":"ok",
    "data":{
      "items":[ { "id":"r1", "patientId":"p1", "patientName":"张三", "fromHospital":"A", "toHospital":"B", "direction":"outbound", "status":"pending", "createdAt":"2025-09-10" } ],
      "total": 123
    }
  }
- 前端行为说明：前端会优先将 pending 的转诊放到前面显示（服务端也可以按 status 排序）

### GET /api/v1/referrals/{id}
- 描述：获取单条转诊详情

### POST /api/v1/referrals
- 描述：前端创建转诊记录
- 请求体：ReferralCreate
  {
    "patientId": "string",
    "fromHospitalId": "string",
    "toHospitalId": "string",
    "reason": "string",
    "urgencyLevel": "LOW|NORMAL|HIGH|URGENT"
  }
- 响应：201 + 新创建的转诊对象

### POST /api/v1/referrals/{id}/status
- 描述：处理转诊（接收/拒绝）
- 请求体：{ status: 'accepted'|'rejected', note?: string }
- 响应：200，返回更新后的转诊对象（含 handledBy, handledAt）
- 实现建议：在更新 status 时记录处理人及时间，返回最新对象，前端会据此刷新显示

---

## 4. 预约（Appointments）

### GET /api/v1/appointments
- 描述：获取当前用户相关预约列表（医生视角或患者视角）
- 响应：{ code,message,data: AppointmentOrder[] }
- AppointmentOrder 关键字段示例：
  {
    "orderId":"ap_sample1",
    "patientId":"p1",
    "hospitalId":"h1",
    "doctorId":"doc1",
    "date":"2025-09-23",
    "time":"09:00-10:00",
    "slotType":"normal|expert|special",
    "payment": { "method":"wechat", "status":"paid" },
    "status":"pending|paid|confirmed|cancelled|completed"
  }

### POST /api/v1/appointments
- 描述：创建预约
- 请求体（示例）:
  {
    "patientId":"p1",
    "hospitalId":"h1",
    "doctorId":"doc1",
    "departmentId":"d-nei",
    "date":"YYYY-MM-DD",
    "time":"09:00-10:00",
    "slotType":"normal"
  }
- 响应：201 + appointment 对象，通常后端返回 voucher 提示或 payment 状态

### POST /api/v1/appointments/{orderId}/cancel
- 描述：取消预约
- 请求体：{ reason?: string }
- 响应：{ success: true, refunded?: boolean }
- 实现注意：若涉及支付，需触发退款逻辑或保留退款标记

---

## 5. 远程会诊 / 远程问诊（Telemedicine）

### POST /api/v1/telemedicine
- 描述：提交远程问诊申请
- 请求体：TelemedicineCreate
  {
    "patientId": "p1",
    "description": "病情描述",
    "attachments": ["attachmentId1", "attachmentId2"],
    "preferredMethod": "phone|video",
    "preferredTime": "可选时间描述"
  }
- 响应：201 + created application 对象
- Mock 说明：前端使用 `createTelemedicineApplication` mock，服务端应保存申请记录并返回 id、createdAt 与 status: pending

### GET /api/v1/telemedicine?patientId={patientId}
- 描述：根据患者查询远程问诊记录
- 响应：TelemedicineApp[]

### GET /api/v1/telemedicine/{id}
- 描述：查询单个申请详情

### PUT /api/v1/telemedicine/{id}
- 描述：更新（如安排、分配医生、改变状态）
- 请求体示例：{ status: 'scheduled'|'rejected'|'completed', note?:string, assignedDoctor?: 'doc1' }
- 响应：更新后的对象

---

## 6. 医生（Doctors）

### GET /api/v1/doctors
- 描述：医生列表（支持按 hospitalId, departmentId, q 搜索）
- 响应：{ code,message,data: { items: DoctorSummary[], total: number } }
- DoctorSummary 关键字段：id, name, title, specialties[], rating, hospitalId, departmentId, avatar, intro

### GET /api/v1/doctors/{id}
- 描述：获取医生详情

---

## 7. 排班（Schedules）

### GET /api/v1/schedules/{doctorId}?startDate=YYYY-MM-DD&days=N
- 描述：获取医生未来 N 天的可预约时段
- 响应（示例）：{ code,message,data: { doctorId: 'doc1', schedules:[ { date:'2025-09-23', slots:[{time:'09:00-10:00', type:'normal', available:3}, ...] } ] } }

### POST /api/v1/schedules/{doctorId}/reserve
- 描述：预约某一时段（减剩余数或创建预约）
- 请求体：{ date: 'YYYY-MM-DD', time: 'HH:MM-HH:MM' }
- 响应：{ success: boolean, message?: string }
- 实现注意：并发风险高，后端应使用事务 + 乐观/悲观锁或唯一约束以防超卖；记录预约失败的明确原因（库存已被抢占时返回 409）

---

## 8. 支付（Payments）

### POST /api/v1/payments/initiate
- 描述：发起支付（预约支付或其他）
- 请求体示例：{ orderId: 'ap_xxxx', method: 'wechat'|'alipay'|'ehealth' }
- 响应示例：{ paymentId: 'pay_xxx', status: 'success' | 'pending' | 'fail' }
- 实现提示：在生产环境，后端需对接支付网关并保护回调接口（验签），并记录支付流水

---

## 9. 医院（Hospitals）

### GET /api/v1/hospitals
- 描述：医院列表（支持 q, region, level, departmentId 分页）
- 响应：{ items: HospitalSummary[], total }

### GET /api/v1/hospitals/{id}
- 描述：医院详情

---

## 10. 统计（Statistics）

### GET /api/v1/statistics/doctor/dashboard/{doctorId}
- 描述：医生工作台统计
- 响应：DoctorDashboard envelope（包含 todayStatistics, monthlyStatistics, recentReferrals 等）

### GET /api/v1/statistics/patient/dashboard/{patientId}
- 描述：患者中心统计

### GET /api/v1/statistics/hospital/overview
- 描述：医院概览

### GET /api/v1/statistics/referrals/trends?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
- 描述：转诊趋势数据

---

## 11. 附件上传（Attachments）

> 前端提供 `uploadFile` 工具，使用 multipart/form-data 上传单文件。

### POST /api/v1/attachments
- 描述：上传文件并返回附件 id/url
- 请求：multipart/form-data, field `file`
- 响应：{ code:200, message:'OK', data: { id: 'att_xxx', url: 'https://...', filename:'x.pdf', contentType:'application/pdf', size:12345 } }
- 存储建议：上传到企业对象存储（S3/MinIO/NFS）并把元数据写表 `attachments`（id, owner_type, owner_id, filename, url, content_type, size, created_at）

---

## 12. 系统健康（Health）

### GET /api/v1/actuator/health
- 描述：转发/返回后端健康检查信息（Spring Boot actuator 风格），前端用于展示系统状态
- 响应：任意 JSON（建议包含 status: UP/DOWN 等）

---

附录 A — 常见错误码与约定
- HTTP 与 envelope 的结合规则建议：
  - 成功：HTTP 200/201/204 + envelope.code = 200（data 可为 null）
  - 认证失败：HTTP 401 + envelope.code = 401
  - 权限不足：HTTP 403 + envelope.code = 403
  - 资源未找到：HTTP 404 + envelope.code = 404
  - 参数错误：HTTP 400 + envelope.code = 400
  - 业务冲突：HTTP 409 + envelope.code = 409
  - 服务器错误：HTTP 500 + envelope.code = 500

附录 B — 实现提示与优先级（建议后端实现顺序）
1. Auth (login/logout) + 用户表（user）与 JWT（基础）
2. Patients（基础 CRUD）+ attachments（文件上传）
3. Referrals（列表/处理）
4. Telemedicine（申请/查询/分配）
5. Appointments + Schedules（并发控制/事务）
6. Payments（支付集成）
7. Doctors/Hospitals/Statistics（分析与报表）

附录 C — 与现有 SQL DDL 对齐说明
- 仓库中存在 `medical_union.sql`（MySQL DDL），建议把 OpenAPI 中的 id 类型与 DDL 对齐（例如 `appointments.id` 使用 char(36) UUID，`doctors.id` 为 int 自增等）。在设计 API DTO 时明确哪些字段为 string(UUID) 或 integer，以减少前后端类型不匹配。

附录 D — 供另一个 agent 可读的简短契约（machine-friendly）
- 基础 envelope：{ code:int, message:string, data: any }
- 所有路径以 `/api/v1` 前缀，认证使用 `Authorization: Bearer <JWT>`，上传使用 multipart/form-data。


文件位置：`docs/api/FINAL_API.md`（已写入仓库）

如果你希望：
- 我可以把本文件导出为 OpenAPI 3.0 的更详细 YAML（包含示例请求/响应），并用 openapi-generator 产生 Spring Boot server stub；
- 或者我可以基于 `medical_union.sql` 把 OpenAPI 的 schema 精确调整为数据库字段类型（例如 UUID vs int）。

请选择下一步：生成 server stub（自动化）或调整 schema 与 DB 对齐，或我直接开始生成 Spring Boot 控制器示例代码。