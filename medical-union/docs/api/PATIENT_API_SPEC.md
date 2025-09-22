# Patient API 规范

本规范描述后端患者相关 API 的输入输出、用例、错误码和前端对接注意事项。所有对患者的敏感增删改操作均通过存储过程在数据库层执行，返回值通过 OUT 参数 resultCode、resultMessage 传回。Java 层将这些 OUT 参数封装为 JSON 返回给前端。

基础约定
- 所有 API 前缀：/api/patients
- 请求与响应均使用 JSON
- 创建/更新/删除操作受事务与审计保证（audits 写入 audit_logs）
- 存储过程返回：resultCode (0 成功，负数失败)，resultMessage（文本说明），create 操作还会返回 newId

示例实体（Patient）
{
  "id": 123,
  "name": "张三",
  "idCard": "110101199001011234",
  "gender": "M",
  "birthDate": "1990-01-01",
  "phone": "13800000000",
  "address": "北京市朝阳区...",
  "medicalCardNo": "MC-0001",
  "emergencyContact": "李四",
  "emergencyPhone": "13900000000",
  "severityLevel": "normal",
  "hospitalId": 1,
  "departmentId": 2,
  "createdAt": "2025-09-22T08:00:00",
  "updatedAt": "2025-09-22T08:10:00"
}

接口列表

1) 创建患者 — POST /api/patients
- 描述：通过存储过程安全创建患者并写入 audit_logs
- 请求体（JSON）字段：
  - name (string, 必填)
  - idCard (string, 必填)
  - gender (string, 可选, 'M'/'F')
  - birthDate (date, 可选, 格式 yyyy-MM-dd)
  - phone (string, 可选)
  - address (string, 可选)
  - medicalCardNo (string, 可选)
  - emergencyContact (string, 可选)
  - emergencyPhone (string, 可选)
  - severityLevel (string, 可选，示例：normal/critical)
  - hospitalId (long, 可选)
  - departmentId (long, 可选)

- 成功响应（HTTP 200）示例：
{
  "resultCode": 0,
  "resultMessage": "OK",
  "data": { "id": 456 }
}

- 失败响应示例：
{
  "resultCode": -1,
  "resultMessage": "身份证号重复"
}

- 前端注意事项：
  - 前端应在提交前做基础校验（必填、日期格式、电话号码格式）
  - 若返回非 0 的 resultCode，应把 resultMessage 显示给用户

2) 更新患者 — PUT /api/patients/{id}
- 描述：通过存储过程更新患者可变字段（目前 service 支持 name/phone/address）
- 请求体：
  - name (string, 可选)
  - phone (string, 可选)
  - address (string, 可选)

- 成功响应（HTTP 200）示例：
{
  "resultCode": 0,
  "resultMessage": "OK"
}

- 失败示例（患者不存在）
{
  "resultCode": -2,
  "resultMessage": "Patient not found"
}

3) 删除患者 — DELETE /api/patients/{id}
- 描述：通过存储过程删除患者；若存在关联就阻止删除（例如 visits）
- 成功响应：
{
  "resultCode": 0,
  "resultMessage": "OK"
}

- 失败示例（有关联访问记录）：
{
  "resultCode": -3,
  "resultMessage": "Cannot delete patient with visits"
}

4) 获取患者详情 — GET /api/patients/{id}
- 响应：HTTP 200
{
  "data": { ...Patient 对象... }
}

5) 列表/分页/搜索
- GET /api/patients?page=1&size=20
- GET /api/patients?name=张

错误码约定（存储过程返回）
- 0: 成功
- -1: 存储过程内部 SQL 异常（或一般错误）
- -2: 资源未找到（例如更新时患者不存在）
- -3: 违反约束（删除时有关联数据）
- -4: 重复数据（创建时 id_card 已存在）
- 其它负值：按具体存储过程定义

前端对接注意点
- 在调用 create/update/delete 时，不要在客户端做最终权限判断，服务器会在存储过程中执行约束检查
- 对于 create 返回的 newId，前端可以用它去跳转或立即查询详情
- 错误信息应给用户友好提示，避免直接展示原始 SQL 错误
- 安全：所有 API 请求要走认证（JWT/session），并在服务端记录 user_id 到 audit_logs（当前示例使用 NULL）

示例请求（curl）

创建：
curl -X POST http://localhost:8080/api/patients -H "Content-Type: application/json" -d '{"name":"张三", "idCard":"110101199001011234","gender":"M","birthDate":"1990-01-01","phone":"13800000000"}'

更新：
curl -X PUT http://localhost:8080/api/patients/456 -H "Content-Type: application/json" -d '{"name":"张三2","phone":"13811111111"}'

删除：
curl -X DELETE http://localhost:8080/api/patients/456


-- 结束 --
