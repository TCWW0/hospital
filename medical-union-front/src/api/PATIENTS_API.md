# Patients API (开发者指南)

该文档基于 `src/api/openapi-patients.yaml`（OpenAPI v3）并为前后端对接、mock 启动与生产部署提供实用指南。

概览
- 基础路径（示例）: `/api/v1`
- 认证: 推荐使用 Bearer JWT（见 OpenAPI 的 `bearerAuth`）。开发阶段可在 mock server 上禁用认证。
- 返回约定: 推荐返回统一 envelope 结构 { code:number, message:string, data:object }。Front-end 目前使用 `{code,message,data}` 格式。

主要端点

- GET /patients
  - 功能: 分页列出患者
  - 查询参数: `q`, `page`, `pageSize`, `status`, `triage`, `department`, `sort`
  - 返回: `PaginatedPatients` (total,page,pageSize,items[])

- POST /patients
  - 功能: 新建患者
  - body: `PatientCreate`
  - 返回: 201 + 新建患者对象

- GET /patients/{id}
  - 功能: 获取单个患者详情

- PUT /patients/{id}
  - 功能: 更新患者

- DELETE /patients/{id}
  - 功能: 删除患者（返回 204）

- GET /patients/{id}/visits
  - 功能: 获取患者的就诊记录列表

示例 — 列表请求

请求:

GET /api/v1/patients?q=张&page=1&pageSize=10&sort=lastVisit:desc

成功响应示例 (HTTP 200, application/json):

{
  "code": 0,
  "message": "OK",
  "data": {
    "total": 2,
    "page": 1,
    "pageSize": 10,
    "items": [
      {
        "id": "p1",
        "name": "张三",
        "age": 45,
        "gender": "M",
        "phone": "13800000001",
        "lastVisit": "2025-09-18T10:00:00Z",
        "department": "内科",
        "triage": "high",
        "status": "ongoing",
        "unreadMessages": 2
      }
    ]
  }
}

错误响应示例 (HTTP 404):

{
  "code": 404,
  "message": "Patient not found",
  "data": null
}

Mock server 快速起步

方案一 — json-server（轻量、快速）

1. 在项目根或 `medical-union-front` 中创建 `mock/db.json`，示例结构：

{
  "patients": [
    {
      "id": "p1",
      "name": "张三",
      "age": 45,
      "gender": "M",
      "phone": "13800000001",
      "lastVisit": "2025-09-18T10:00:00Z",
      "department": "内科",
      "triage": "high",
      "status": "ongoing",
      "unreadMessages": 2
    }
  ]
}

2. 安装并运行:

```
npm install -D json-server
npx json-server --watch mock/db.json --port 4000 --routes mock/routes.json
```

3. 将前端 `utils/request` 的 baseURL 改为 `http://localhost:4000/api/v1` 或使用代理（推荐），以保留 `/api/v1` 前缀：

在 Vite 配置中添加 dev server proxy（示例 `vite.config.ts`）:

```ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:4000',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '/api')
    }
  }
}
```

方案二 — Prism（基于 OpenAPI，支持更严格的响应验证）

1. 安装 Prism 或使用 Docker 镜像。
2. 运行: prism mock src/api/openapi-patients.yaml -p 4000

生产部署与兼容性建议

- 反向代理（Nginx）配置要考虑路径前缀（例如 `/api/`）与 CORS。
- 推荐 API 路径统一以 `/api/v1` 开头以便将来无缝版本切换。
- 在 Nginx 中添加 header 转发和缓存策略（GET 请求可以缓存短时）并确保对后端的 HTTPS/TLS 终端可用。
- 日志建议：记录 request_id（可通过请求头 X-Request-ID 传递）以便于跟踪和联调。

安全与认证

- 推荐使用 JWT (Bearer) 做微服务间以及前端访问的认证，OpenAPI 已包含 bearerAuth 定义。
- Mock 阶段可以禁用或使用静态 token。

契约测试建议

- 使用 `prism` 或 `openapi-backend` 在 CI 中对 mock responses 做契约测试。
- 也可使用 `dredd` 或 `openapi-validator` 在 Pull Request 中验证后端实现是否满足 OpenAPI 定义。

迁移到后端实现的步骤建议

1. 后端根据 `openapi-patients.yaml` 生成接口存根（Spring Boot/Node/Express 代码生成器）。
2. 后端实现并返回与文档一致的 envelope 结构或根据团队约定调整前端解析。
3. 在 dev 环境启用 Prism/json-server 并让前端切换到 Mock baseURL 验证页面行为。
4. 逐步替换 Mock 到真实后端并运行契约测试确保无破坏变更。

参考文件
- `src/api/openapi-patients.yaml`（OpenAPI 草案）
- `src/api/REFERRAL_API.md`（已有的转诊 API 文档示例）

联系人
- 如需对字段、分页或错误编码策略调整，请在 PR 中标注修改理由并同步后端同学。
