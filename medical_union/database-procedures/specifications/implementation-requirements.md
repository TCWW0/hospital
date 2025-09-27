# Auth模块存储过程实现需求文档

## 项目概述
医院管理系统Auth认证模块的数据库存储过程实现需求，基于现有的MySQL数据库表结构，实现用户注册、登录和信息查询功能。

## 数据库环境要求
- **数据库类型**：MySQL 8.0+
- **字符集**：utf8mb4
- **存储引擎**：InnoDB
- **事务支持**：是
- **存储过程支持**：是

## 相关表结构

### users表（主要表）
```sql
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `role` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'patient',
  `id_number` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `profile` json NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `username`(`username`),
  UNIQUE INDEX `id_number`(`id_number`)
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
```

### 可能需要的关联表
- `patients` 表：与users表通过user_id关联
- `doctors` 表：将来扩展医生信息时使用

---

## 业务需求详解

### 1. 用户注册业务需求

#### 功能描述
实现新用户注册到系统，支持不同角色用户（患者、医生、管理员）的统一注册流程。

#### 业务规则

**1.1 用户名规则**
- 长度：3-100个字符
- 格式：只能包含字母、数字、下划线、中文
- 唯一性：系统内必须唯一
- 大小写：区分大小写

**1.2 密码安全规则**
- 接收：已经BCrypt加密的密码哈希值
- 存储：直接存储传入的哈希值
- 长度：哈希值通常为60个字符

**1.3 角色管理**
- 允许的角色：'PATIENT', 'DOCTOR', 'ADMIN'
- 默认角色：'PATIENT'
- 大小写：不敏感，统一转换为大写

**1.4 身份信息验证**
- 身份证号：18位数字，支持X结尾
- 手机号：11位数字，1开头
- 唯一性：身份证号和手机号在系统内必须唯一

**1.5 配置信息**
- profile字段：存储JSON格式的用户扩展信息
- 可选字段：允许为空或null
- 格式验证：必须是有效的JSON格式

#### 执行流程
```
1. 参数验证
   ├─ 检查必填参数
   ├─ 验证用户名格式
   ├─ 验证角色值
   ├─ 验证身份证号格式（如果提供）
   └─ 验证JSON格式（如果提供）

2. 唯一性检查
   ├─ 检查用户名是否已存在
   ├─ 检查身份证号是否已存在（如果提供）
   └─ 检查手机号是否已存在（如果提供）

3. 数据插入
   ├─ 插入users表
   ├─ 获取新生成的user_id
   └─ 提交事务

4. 返回结果
   ├─ 成功：返回新用户ID
   └─ 失败：返回相应错误码和错误信息
```

### 2. 用户登录业务需求

#### 功能描述
验证用户登录凭证，支持用户名或手机号登录，返回用户基本信息用于生成JWT token。

#### 业务规则

**2.1 登录名识别**
- 支持类型：用户名或手机号
- 自动识别：根据格式判断是用户名还是手机号
- 手机号格式：11位数字且以1开头

**2.2 密码验证**
- 验证方式：使用BCrypt算法验证明文密码与存储的哈希值
- 安全性：验证失败时不泄露是用户名错误还是密码错误
- 性能：密码验证耗时控制在100ms内

**2.3 用户状态检查**
- 账户状态：检查用户是否被禁用或锁定
- 角色验证：如果指定了期望角色，验证用户角色是否匹配

**2.4 登录记录**
- 更新时间：成功登录后更新users表的updated_at字段
- 失败记录：可选记录登录失败次数（暂不实现）

#### 执行流程
```
1. 参数验证
   ├─ 检查登录名和密码是否为空
   └─ 识别登录名类型（用户名/手机号）

2. 查找用户
   ├─ 根据用户名查找用户
   ├─ 或根据手机号查找用户（需要从profile中提取）
   └─ 用户不存在则返回登录失败

3. 密码验证
   ├─ 使用BCrypt验证密码
   └─ 验证失败则返回登录失败

4. 角色检查
   ├─ 如果指定了用户类型
   └─ 验证用户角色是否匹配

5. 更新登录时间
   └─ 更新users表的updated_at字段

6. 返回用户信息
   ├─ 用户ID、用户名、角色
   ├─ profile配置信息
   └─ 最后登录时间
```

### 3. 用户信息查询业务需求

#### 功能描述
根据用户ID获取用户的详细信息，主要用于JWT token验证后的用户信息获取。

#### 业务规则

**3.1 查询范围**
- 基本信息：ID、用户名、角色
- 身份信息：身份证号、手机号（从profile提取）
- 配置信息：完整的profile JSON
- 时间信息：创建时间、更新时间

**3.2 安全性**
- 不返回：密码哈希值
- 脱敏处理：身份证号和手机号可选择脱敏

**3.3 性能要求**
- 查询时间：< 50ms
- 缓存友好：查询结果适合缓存

#### 执行流程
```
1. 参数验证
   └─ 检查用户ID是否为有效整数

2. 查询用户
   ├─ 根据ID查询users表
   └─ 用户不存在则返回错误

3. 组装信息
   ├─ 提取基本信息
   ├─ 解析profile JSON
   └─ 脱敏敏感信息（可选）

4. 返回结果
   └─ 返回完整的用户信息
```

---

## 技术实现要求

### 1. 密码处理

#### BCrypt验证函数
MySQL中需要实现BCrypt密码验证功能，可选方案：

**方案A：使用UDF（用户自定义函数）**
```sql
-- 需要安装MySQL BCrypt UDF插件
SELECT bcrypt_verify('明文密码', '哈希值') AS is_valid;
```

**方案B：调用外部验证（推荐）**
```sql
-- 在存储过程中，将验证逻辑移到Java端
-- 存储过程只进行用户查找，密码验证由Java端完成
```

#### 推荐实现方式
由于BCrypt在MySQL中实现较复杂，建议采用以下方式：

1. **用户注册**：存储过程直接存储传入的BCrypt哈希值
2. **用户登录**：
   - 存储过程根据用户名查找用户信息
   - 返回存储的密码哈希值
   - Java端进行BCrypt验证
   - 验证成功后再次调用存储过程更新登录时间

### 2. JSON处理

#### profile字段处理
```sql
-- 验证JSON格式
SELECT JSON_VALID(p_profile_json) AS is_valid;

-- 提取手机号（如果存储在profile中）
SELECT JSON_UNQUOTE(JSON_EXTRACT(profile, '$.phone')) AS phone FROM users;

-- 更新profile中的字段
UPDATE users SET profile = JSON_SET(profile, '$.lastLoginAt', NOW());
```

### 3. 错误处理

#### 统一错误处理框架
```sql
DELIMITER $$

CREATE PROCEDURE sp_auth_procedure_template(
    -- 输入参数
    OUT p_errcode INT,
    OUT p_errmsg VARCHAR(255)
)
BEGIN
    -- 声明异常处理器
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
            @errno = MYSQL_ERRNO,
            @text = MESSAGE_TEXT;
        
        SET p_errcode = 9999;
        SET p_errmsg = CONCAT('数据库错误[', @errno, ']: ', @text);
        ROLLBACK;
    END;
    
    DECLARE EXIT HANDLER FOR SQLWARNING
    BEGIN
        SET p_errcode = 9901;
        SET p_errmsg = '系统警告';
        ROLLBACK;
    END;
    
    -- 开始事务
    START TRANSACTION;
    
    -- 初始化返回值
    SET p_errcode = 0;
    SET p_errmsg = 'SUCCESS';
    
    -- 业务逻辑
    -- ...
    
    -- 提交事务
    COMMIT;
END$$

DELIMITER ;
```

### 4. 性能优化

#### 索引建议
```sql
-- 确保以下索引存在
ALTER TABLE users ADD INDEX idx_username (username);
ALTER TABLE users ADD INDEX idx_id_number (id_number);
ALTER TABLE users ADD INDEX idx_role (role);
ALTER TABLE users ADD INDEX idx_created_at (created_at);

-- 如果手机号存储在profile中，考虑生成列索引
ALTER TABLE users ADD COLUMN phone_number VARCHAR(20) 
    AS (JSON_UNQUOTE(JSON_EXTRACT(profile, '$.phone'))) STORED;
ALTER TABLE users ADD INDEX idx_phone_number (phone_number);
```

#### 查询优化
- 使用LIMIT限制结果集大小
- 避免SELECT *，只查询需要的字段
- 合理使用事务，避免长时间锁表

---

## 测试要求

### 1. 功能测试用例

#### 用户注册测试
```sql
-- 正常注册
CALL sp_user_register('testuser', '$2a$10$hash...', 'PATIENT', '13812345678', '110101199001011234', '{"nickname":"测试用户"}', @user_id, @errcode, @errmsg);

-- 用户名重复
-- 身份证号重复  
-- 手机号重复
-- 无效参数
```

#### 用户登录测试
```sql
-- 用户名登录
CALL sp_user_login('testuser', 'password123', 'PATIENT', @user_id, @username, @role, @profile, @last_login, @errcode, @errmsg);

-- 手机号登录
-- 密码错误
-- 用户不存在
-- 角色不匹配
```

### 2. 性能测试要求
- 单个存储过程执行时间 < 100ms
- 并发执行100个请求时响应时间 < 200ms
- 支持1000个用户同时在线

### 3. 安全测试要求
- SQL注入防护
- 敏感信息不泄露
- 错误信息不暴露系统内部结构

---

## 部署要求

### 1. 权限设置
```sql
-- 创建专用的数据库用户
CREATE USER 'medical_union_app'@'%' IDENTIFIED BY 'strong_password';

-- 授予必要的权限
GRANT SELECT, INSERT, UPDATE ON medical_union.users TO 'medical_union_app'@'%';
GRANT EXECUTE ON PROCEDURE medical_union.sp_user_register TO 'medical_union_app'@'%';
GRANT EXECUTE ON PROCEDURE medical_union.sp_user_login TO 'medical_union_app'@'%';
GRANT EXECUTE ON PROCEDURE medical_union.sp_user_get_info TO 'medical_union_app'@'%';
```

### 2. 监控要求
- 记录存储过程执行时间
- 监控错误率
- 记录用户注册和登录统计

---

## 交付物清单

### 需要您实现的存储过程文件
1. `sp_user_register.sql` - 用户注册存储过程
2. `sp_user_login.sql` - 用户登录存储过程  
3. `sp_user_get_info.sql` - 用户信息查询存储过程

### 存储过程命名规范
- 前缀：`sp_` 
- 模块：`user_`
- 功能：`register`, `login`, `get_info`
- 示例：`sp_user_register`

### 文件存放位置
请将实现的存储过程SQL文件放置在：
```
database-procedures/implementations/
├── sp_user_register.sql
├── sp_user_login.sql
├── sp_user_get_info.sql
└── README.md (实现说明)
```

---

## 验收标准

### 1. 功能验收
- [ ] 所有存储过程按规范实现
- [ ] 错误码返回正确
- [ ] 业务逻辑符合需求
- [ ] 数据一致性保证

### 2. 性能验收  
- [ ] 执行时间满足要求
- [ ] 并发性能达标
- [ ] 内存使用合理

### 3. 安全验收
- [ ] SQL注入防护有效
- [ ] 敏感信息保护到位
- [ ] 权限控制正确

---

## 协作流程

1. **您实现存储过程**：按照本文档要求实现三个存储过程
2. **提交到指定目录**：将SQL文件放到implementations文件夹
3. **我进行集成测试**：更新Java端代码，进行集成测试
4. **迭代优化**：根据测试结果进行必要的调整

请在实现完成后告知我，我将及时进行Java端的配套开发和测试。