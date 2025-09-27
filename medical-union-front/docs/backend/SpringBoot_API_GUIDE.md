Spring Boot 后端对接指南（针对 `openapi-generated.yaml`）

目标
- 基于 `src/api/openapi-generated.yaml` 实现后端服务，统一路由前缀 `/api/v1`，在 Nginx 中可整体转发到后端服务。
- 使用 Spring Boot 3.x + Spring Web + Spring Security (JWT) + Spring Data JPA (或 MyBatis) 实现。

项目结构建议（简短）
- controller/  - RestController，映射 OpenAPI 路径
- dto/         - 请求/响应 DTO（与 OpenAPI schemas 对齐）
- service/     - 业务逻辑与事务边界
- repository/  - JPA Repository 或 Mapper
- model/       - JPA 实体（表结构参考 docs/db-design/DATABASE_DESIGN.md 或现有 SQL）
- config/      - CORS、Security、Swagger/OpenAPI 配置
- util/        - 通用工具（请求ID、异常处理、文件上传）

重要约定
- 全部 API 使用统一前缀 `/api/v1`（OpenAPI 已包含）。
- 响应包裹（envelope）：建议后端返回 { code:int, message:string, data:... }，匹配前端 `utils/request.ts` 中的解析逻辑。
- 认证：使用 Bearer JWT。前端会在 `Authorization: Bearer <token>` 中发送 token，后端应返回 401 并可能清理前端 token。
- 错误码：业务错误返回 code !== 200；HTTP 状态码用于语义（例如 400、401、403、404、500），但 envelope 中的 code 也应被设置以便前端显示友好信息。

控制器示例（伪代码）

@RestController
@RequestMapping("/api/v1/referrals")
public class ReferralController {

  @GetMapping
  public ApiEnvelope<ReferralListDto> list(@RequestParam Optional<Integer> page, @RequestParam Optional<Integer> pageSize, @RequestParam Optional<String> q, @RequestParam Optional<String> status) {
    var res = referralService.list(...);
    return Envelope.ok(res);
  }

  @PostMapping("/{id}/status")
  public ApiEnvelope<ReferralDto> updateStatus(@PathVariable String id, @RequestBody UpdateStatusDto dto) {
    var updated = referralService.updateStatus(id, dto.getStatus(), dto.getNote());
    return Envelope.ok(updated);
  }
}

DTO / Entity mapping
- 使用 MapStruct（可选）或手写转换。
- DTO 字段应与 OpenAPI schema 对齐，实体字段参考 `docs/db-design/DATABASE_DESIGN.md` 或 `medical-union/src/main/resources/db/schema/medical_union.sql`（仓库中已有 MySQL DDL，可复用）。

认证与安全（建议）
- 使用 Spring Security + JWT。登录 `/api/v1/auth/login` 返回 { token, user }。
- 为方便前端开发，可在 dev 环境允许静态 token（env），但生产必须校验 JWT。

文件上传
- 前端 `uploadFile` 使用 multipart/form-data 上传。
- 建议后端实现 POST `/api/v1/attachments` 接收 MultipartFile，保存到对象存储（如 NFS、S3、MinIO），并将附件记录保存到 attachments 表，返回附件 URL 或 id。

事务与并发
- 对于排班与预约（reserve slot），在服务层使用悲观锁或数据库唯一索引/乐观校验以防重叠预约。

Swagger / OpenAPI
- 在 Spring Boot 中使用 `springdoc-openapi` 将 `openapi-generated.yaml` 导入或生成同步文档，便于前端/后端共同使用。

示例启动参数
- server.port=8080
- spring.datasource.url=jdbc:mysql://localhost:3306/medical_union
- app.api.prefix=/api/v1
- jwt.secret=xxx

下一步
- 根据 `openapi-generated.yaml` 生成 Controller/DTO 草稿（可使用 openapi-generator 生成 Java Spring stubs），然后逐个实现服务逻辑并运行集成测试。

