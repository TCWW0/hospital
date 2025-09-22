# 后端实现文档（面向 Spring Boot + MyBatis）

目标：为后端开发提供具体实现建议、接口示例、Spring 控制器/DTO/Mapper 模板及部署配置样例，帮助开发者快速启动基于 OpenAPI 的后端实现。

目录
- 概览
- 接口清单与示例
- DTO / Entity / Mapper 设计
- MyBatis mapper XML 示例
- Controller 示例（Spring Boot）
- application.yml 示例
- 数据库初始化 SQL
- 部署与运维建议

## 概览
- 使用 Spring Boot 3.x + MyBatis-Plus（或 MyBatis）
- 使用 springdoc-openapi-ui 将 OpenAPI 暴露为 Swagger UI（方便本地验证）
- 使用 JWT（Spring Security）做认证

## 接口清单与示例
以下接口与 `medical-union-front/src/api/openapi-patients.yaml` 保持一致；示例均使用 `/api/v1` 前缀。

1) GET /api/v1/patients
- 描述：分页/过滤/搜索患者列表
- 参数：q, page, pageSize, status, triage, department, sort
- 返回：{
  code:200,
  message:'OK',
  data: { total, page, pageSize, items:[Patient] }
}

2) POST /api/v1/patients
- 描述：创建患者
- body: PatientCreate
- 返回：201 + 新建患者对象

3) GET /api/v1/patients/{id}
- 描述：获取患者详情

4) PUT /api/v1/patients/{id}
- 描述：更新患者

5) DELETE /api/v1/patients/{id}
- 描述：删除患者

6) GET /api/v1/patients/{id}/visits
- 描述：获取患者的就诊记录列表

## DTO / Entity / Mapper 设计
示例 Entity 与 DTO（Java）

```java
// Patient entity (MyBatis-Plus)
@Data
@TableName("patients")
public class Patient {
    private String id;
    private String name;
    private Integer age;
    private String gender;
    private String phone;
    private LocalDateTime lastVisit;
    private String department;
    private String triage;
    private String status;
    private Integer unreadMessages;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

// Patient DTO (用于请求/响应)
@Data
public class PatientDTO {
    private String id;
    private String name;
    private Integer age;
    private String gender;
    private String phone;
    private String lastVisit; // ISO string
    private String department;
    private String triage;
    private String status;
    private Integer unreadMessages;
}
```

## MyBatis mapper XML 示例

```xml
<!-- PatientMapper.xml -->
<mapper namespace="com.example.mapper.PatientMapper">
  <resultMap id="BaseResultMap" type="com.example.entity.Patient">
    <id column="id" property="id" />
    <result column="name" property="name" />
    <!-- ... -->
  </resultMap>

  <select id="selectPatients" resultMap="BaseResultMap">
    SELECT * FROM patients
    <where>
      <if test="q != null and q != ''">
        AND (name LIKE CONCAT('%', #{q}, '%') OR phone LIKE CONCAT('%', #{q}, '%'))
      </if>
      <if test="status != null and status != 'all'">
        AND status = #{status}
      </if>
    </where>
    ORDER BY ${sort}
    LIMIT #{pageSize} OFFSET #{offset}
  </select>
</mapper>
```

## Controller 示例（Spring Boot）

```java
@RestController
@RequestMapping("/api/v1/patients")
public class PatientController {

    @Autowired
    private PatientService patientService;

    @GetMapping
    public ResponseEntity<ApiResponse<PaginatedResult<PatientDTO>>> list(
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String triage,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String sort) {

        PaginatedResult<PatientDTO> result = patientService.list(q, page, pageSize, status, triage, department, sort);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PatientDTO>> get(@PathVariable String id) {
        PatientDTO dto = patientService.getById(id);
        return ResponseEntity.ok(ApiResponse.ok(dto));
    }

    // create/update/delete omitted for brevity
}
```

## application.yml 示例

```yaml
server:
  port: 8080
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/medical_union?characterEncoding=UTF-8&useSSL=false&serverTimezone=UTC
    username: root
    password: secret
  jackson:
    serialization:
      WRITE_DATES_AS_TIMESTAMPS: false

jwt:
  secret: your-jwt-secret
  expire: 3600

logging:
  level:
    root: INFO
```

## 数据库初始化 SQL
参见 `BACKEND_REQUIREMENTS.md` 中的 DDL 示例。

## 部署建议
- 使用 Docker + Docker Compose（或 Kubernetes）部署
- Nginx 作为反向代理并处理 TLS
- 在容器内运行 Spring Boot jar，并把数据库连接与环境配置通过 env 注入

## 进一步工作
- 如果你希望，我可以：
  - 基于 OpenAPI 使用 openapi-generator 生成 Spring Boot server stub（Controller + DTO）
  - 生成 MyBatis-Plus 的 Entity/Mapper/Service/Controller 案例代码
  - 创建一个简单的 Spring Boot 项目骨架并加入到仓库（或单独提交压缩包）

***

请选择你希望我优先生成的后端交付物（例如：openapi-generator stub、MyBatis-Plus 示例代码、或者完整的 Spring Boot skeleton），我将接着生成并提交到 `medical-union/api-docs/` 或 `medical-union-backend/`（新目录）。