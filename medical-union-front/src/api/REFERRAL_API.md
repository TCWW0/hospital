# 转诊管理 API 设计（接口契约）

此文档为前后端对接契约草案，基于前端当前实现（见 `src/api/mock/referrals.ts`）。接口使用 REST 风格；所有时间字段推荐使用 ISO 8601 或 YYYY-MM-DD。

通用响应结构（示例，前端 `src/utils/request.ts` 假设后端返回包装对象）：

{
  "code": 200,
  "message": "ok",
  "data": ...
}

错误示例：
{
  "code": 400,
  "message": "参数错误",
  "data": null
}

----

1) 获取转诊列表
- URL: GET /api/referrals
- Query 参数:
  - page (number, optional) - 默认为 1
  - pageSize (number, optional) - 默认为 10
  - q (string, optional) - 搜索关键字（患者姓名、来源医院、目标医院）
  - status (string, optional) - pending|accepted|rejected|all，默认 all
  - sortBy (string, optional) - e.g. createdAt
  - order (string, optional) - asc|desc

- Response (200):

{
  "code": 200,
  "message": "ok",
  "data": {
    "items": [
      {
        "id": "r1",
        "patientName": "张三",
        "patientId": "p1",
        "fromHospital": "A",
        "toHospital": "B",
        "direction": "outbound",
        "status": "pending",
        "note": "需要影像资料",
        "createdAt": "2025-09-10",
        "handledBy": null,
        "handledAt": null
      }
    ],
    "total": 123
  }
}

Notes: 前端会按 `status` 进行分组排序（pending 优先）。

----

2) 获取单条转诊详情
- URL: GET /api/referrals/:id
- Response (200):

{
  "code": 200,
  "message": "ok",
  "data": {
    "id": "r1",
    "patientName": "张三",
    "patientId": "p1",
    "fromHospital": "A",
    "toHospital": "B",
    "direction": "outbound",
    "status": "pending",
    "note": "需要影像资料",
    "createdAt": "2025-09-10",
    "handledBy": null,
    "handledAt": null
  }
}

----

3) 更新转诊状态（同意 / 拒绝）
- URL: POST /api/referrals/:id/status
- Body (application/json):
  {
    "status": "accepted" | "rejected",
    "note": "处理备注，可选"
  }
- Response (200): 返回更新后的资源

{
  "code": 200,
  "message": "ok",
  "data": {
    "id": "r1",
    "status": "accepted",
    "note": "已安排专家会诊",
    "handledBy": "doctor1",
    "handledAt": "2025-09-15"
  }
}

Error cases:
- 400: 请求参数错误
- 404: 资源不存在
- 409: 状态冲突（例如重复处理）

----

字段说明（关键字段）：
- id: string
- patientId: string | null
- patientName: string
- fromHospital / toHospital: string
- direction: 'inbound' | 'outbound' | null
- status: 'pending' | 'accepted' | 'rejected'
- note: string | null (请求或处理备注)
- handledBy: string | null (处理人 id 或姓名)
- handledAt: string | null (处理时间，YYYY-MM-DD 或 ISO)
- createdAt: string

----

建议与实现细节：
- 后端应在状态更新时写入 handledBy 与 handledAt，并返回最新资源以便前端刷新。
- 列表接口建议支持按 status 和 createdAt 排序，前端当前实现期望 pending 优先。
- 对于鉴权：前端通过 `Authorization: Bearer <token>` 发送请求，token 存储在 localStorage 的 `medical_union_token`。如鉴权失败返回 401。

----

若你希望，我可以把此契约生成为 Swagger/OpenAPI 草稿，或者把 mock 调用替换为真实网络请求的代码片段（在 `src/api/index.ts` 中）。
