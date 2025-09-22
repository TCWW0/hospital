# 医联体管理系统 - 项目启动指南

## 项目概述

医联体管理系统(MedicalUnion)是一个基于Spring Boot + MyBatis + MySQL的医疗协同管理平台，支持患者管理、医生管理、医院管理、转诊管理等核心功能。

## 环境要求

- **JDK**: 17或更高版本
- **Maven**: 3.6或更高版本  
- **MySQL**: 8.0或更高版本
- **IDE**: IntelliJ IDEA或Eclipse(推荐IntelliJ IDEA)

## 数据库配置

### 1. 创建数据库

使用MySQL客户端或命令行工具连接到MySQL服务器，执行以下命令：

```sql
-- 连接到MySQL
mysql -u root -p

-- 输入密码：Tcww3498.

-- 创建数据库
CREATE DATABASE IF NOT EXISTS medical_union 
DEFAULT CHARACTER SET utf8mb4 
DEFAULT COLLATE utf8mb4_unicode_ci;
```

### 2. 初始化数据库结构

执行项目中的数据库初始化脚本：

```bash
# 进入项目目录
cd e:\project\hospital\medical-union

# 执行数据库初始化脚本
mysql -u root -p medical_union < src\main\resources\schema.sql
```

## 项目启动

### 方式一：使用Maven命令行启动

```bash
# 进入项目根目录
cd e:\project\hospital\medical-union

# 编译项目
mvn clean compile

# 启动应用
mvn spring-boot:run
```

### 方式二：使用IDE启动

1. 在IntelliJ IDEA中打开项目
2. 等待Maven依赖下载完成
3. 找到`MedicalUnionApplication.java`文件
4. 右键选择"Run MedicalUnionApplication"

### 方式三：打包后启动

```bash
# 打包项目
mvn clean package

# 运行jar包
java -jar target\medical-union-1.0.0-SNAPSHOT.jar
```

## 访问应用

启动成功后，应用将在以下地址运行：

- **应用地址**: http://localhost:8080/api
- **健康检查**: http://localhost:8080/api/actuator/health

## API接口文档

### 患者管理接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/patients` | 查询所有患者 |
| GET | `/patients/{id}` | 根据ID查询患者 |
| GET | `/patients/idcard/{idCard}` | 根据身份证号查询患者 |
| GET | `/patients/page?pageNum=1&pageSize=10` | 分页查询患者 |
| GET | `/patients/search?name=张` | 根据姓名模糊查询 |
| POST | `/patients` | 创建患者 |
| PUT | `/patients/{id}` | 更新患者信息(存储过程) |
| DELETE | `/patients/{id}` | 删除患者(存储过程) |
| GET | `/patients/count` | 统计患者总数 |

### 转诊管理接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/referrals` | 查询所有转诊记录 |
| GET | `/referrals/{id}` | 根据ID查询转诊记录 |
| GET | `/referrals/patient/{patientId}` | 根据患者ID查询转诊记录 |
| GET | `/referrals/status/{status}` | 根据状态查询转诊记录 |
| POST | `/referrals` | 创建转诊申请 |
| PUT | `/referrals/{id}/approve` | 审批转诊申请(存储过程) |
| PUT | `/referrals/{id}/reject` | 拒绝转诊申请(存储过程) |
| PUT | `/referrals/{id}/complete` | 完成转诊(存储过程) |

## 测试示例

### 创建患者示例

```bash
curl -X POST http://localhost:8080/api/patients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试患者",
    "idCard": "110101199001011111",
    "gender": "男",
    "birthDate": "1990-01-01",
    "phone": "13800138000",
    "address": "北京市朝阳区测试街道",
    "medicalCardNo": "MC001111111"
  }'
```

### 查询患者示例

```bash
# 查询所有患者
curl http://localhost:8080/api/patients

# 根据ID查询患者
curl http://localhost:8080/api/patients/1

# 分页查询患者
curl "http://localhost:8080/api/patients/page?pageNum=1&pageSize=5"
```

## 项目结构说明

```
medical-union/
├── src/main/java/com/medicalunion/
│   ├── MedicalUnionApplication.java        # 主启动类
│   ├── common/                             # 通用组件
│   │   ├── BaseEntity.java                # 基础实体类
│   │   ├── Result.java                    # 统一返回结果
│   │   └── StoredProcedureResult.java     # 存储过程结果
│   ├── patient/                           # 患者域
│   │   ├── entity/Patient.java           # 患者实体
│   │   ├── mapper/PatientMapper.java     # 患者数据访问
│   │   ├── service/PatientService.java   # 患者服务
│   │   └── controller/PatientController.java # 患者控制器
│   ├── hospital/                          # 医院域
│   ├── doctor/                            # 医生域
│   ├── visit/                             # 就诊域
│   └── referral/                          # 转诊域
├── src/main/resources/
│   ├── application.yml                    # 应用配置
│   ├── schema.sql                         # 数据库初始化脚本
│   └── mapper/                            # MyBatis映射文件
└── pom.xml                                # Maven配置
```

## 技术特点

1. **分层架构**: Controller → Service → Repository/Mapper → Database
2. **存储过程优先**: 敏感操作(删除、修改)使用存储过程封装
3. **统一返回格式**: 所有API接口返回统一的Result格式
4. **参数验证**: 使用Jakarta Validation进行请求参数验证
5. **事务管理**: Service层使用@Transactional注解管理事务
6. **日志记录**: 使用Slf4j进行详细的操作日志记录

## 注意事项

1. **数据库连接**: 确保MySQL服务已启动，用户名密码正确
2. **端口占用**: 默认端口8080，如有冲突可在application.yml中修改
3. **存储过程**: 删除和更新操作通过存储过程执行，确保数据安全
4. **编码规范**: 保持代码结构清晰，便于后续review和扩展

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查MySQL服务是否启动
   - 验证用户名密码是否正确
   - 确认数据库名称是否存在

2. **端口被占用**
   - 修改application.yml中的server.port配置
   - 或者停止占用8080端口的其他应用

3. **Maven依赖下载失败**
   - 检查网络连接
   - 配置Maven国内镜像源

4. **存储过程调用失败**
   - 检查数据库中存储过程是否正确创建
   - 验证存储过程参数类型和个数

## 后续扩展

项目采用模块化设计，后续可以方便地扩展以下功能：

- 医生管理模块完善
- 医院管理模块完善
- 就诊记录管理模块
- 用户权限管理模块
- 消息通知模块
- 数据统计和报表模块

---

如有疑问，请及时沟通和反馈。