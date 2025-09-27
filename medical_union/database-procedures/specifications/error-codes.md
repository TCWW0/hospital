# 医院管理系统错误码规范

## 概述
本文档定义了医院管理系统的统一错误码体系，用于Java后端和数据库存储过程之间的错误信息传递。

## 错误码设计原则
1. **统一性**：Java端和数据库端使用相同的错误码
2. **可扩展性**：按模块分段，便于后续扩展
3. **可读性**：错误码有明确的含义和分类
4. **兼容性**：保持向后兼容，新增不修改已有错误码

## 错误码分段规则
```
0        : 成功
1000-1999: Auth模块错误
2000-2999: Patient模块错误  
3000-3999: Doctor模块错误
4000-4999: Appointment模块错误
5000-5999: Referral模块错误
6000-6999: Payment模块错误
7000-7999: Statistics模块错误
8000-8999: System模块错误
9000-9999: 通用错误/数据库错误
```

---

## 成功码

| 错误码 | 错误信息 | 描述 | 使用场景 |
|--------|----------|------|----------|
| 0 | SUCCESS | 操作成功 | 所有成功的操作 |

---

## Auth模块错误码 (1000-1999)

### 注册相关错误 (1001-1099)
| 错误码 | 错误信息 | 描述 | 存储过程 | Java处理 |
|--------|----------|------|----------|----------|
| 1001 | 用户名已存在 | 注册时用户名重复 | sp_user_register | 返回400错误 |
| 1002 | 身份证号已存在 | 注册时身份证号重复 | sp_user_register | 返回400错误 |
| 1003 | 手机号已存在 | 注册时手机号重复 | sp_user_register | 返回400错误 |
| 1004 | 用户名格式无效 | 用户名不符合规范 | sp_user_register | 返回400错误 |
| 1005 | 密码格式无效 | 密码不符合安全要求 | sp_user_register | 返回400错误 |
| 1006 | 身份证号格式无效 | 身份证号格式错误 | sp_user_register | 返回400错误 |
| 1007 | 手机号格式无效 | 手机号格式错误 | sp_user_register | 返回400错误 |
| 1008 | 用户角色无效 | 不支持的用户角色 | sp_user_register | 返回400错误 |
| 1009 | 必填参数缺失 | 缺少必需的注册参数 | sp_user_register | 返回400错误 |

### 登录相关错误 (1101-1199)
| 错误码 | 错误信息 | 描述 | 存储过程 | Java处理 |
|--------|----------|------|----------|----------|
| 1101 | 用户名或密码错误 | 登录凭证验证失败 | sp_user_login | 返回401错误 |
| 1102 | 用户类型不匹配 | 用户角色与期望不符 | sp_user_login | 返回403错误 |
| 1103 | 用户账户已禁用 | 用户状态为禁用 | sp_user_login | 返回403错误 |
| 1104 | 用户账户已锁定 | 用户因安全原因被锁定 | sp_user_login | 返回423错误 |
| 1105 | 登录参数无效 | 登录参数格式错误 | sp_user_login | 返回400错误 |
| 1106 | 登录频率过高 | 短时间内登录次数过多 | sp_user_login | 返回429错误 |

### 用户信息相关错误 (1201-1299)
| 错误码 | 错误信息 | 描述 | 存储过程 | Java处理 |
|--------|----------|------|----------|----------|
| 1201 | 用户不存在 | 指定的用户ID不存在 | sp_user_get_info | 返回404错误 |
| 1202 | 用户信息获取失败 | 获取用户信息时发生错误 | sp_user_get_info | 返回500错误 |

### Token相关错误 (1301-1399)
| 错误码 | 错误信息 | 描述 | 存储过程 | Java处理 |
|--------|----------|------|----------|----------|
| 1301 | Token无效 | JWT token格式错误或已过期 | N/A | 返回401错误 |
| 1302 | Token已过期 | JWT token超出有效期 | N/A | 返回401错误 |
| 1303 | 权限不足 | 用户权限不足执行操作 | N/A | 返回403错误 |
| 1304 | Token生成失败 | 生成JWT token时发生错误 | N/A | 返回500错误 |

---

## 通用错误码 (9000-9999)

### 数据库错误 (9001-9099)
| 错误码 | 错误信息 | 描述 | 使用场景 |
|--------|----------|------|----------|
| 9001 | 数据库连接失败 | 无法连接到数据库 | 所有存储过程 |
| 9002 | 数据库超时 | 数据库操作超时 | 所有存储过程 |
| 9003 | 数据库约束违反 | 违反数据库约束条件 | 所有存储过程 |
| 9004 | 数据库死锁 | 发生数据库死锁 | 所有存储过程 |
| 9005 | 数据库事务失败 | 事务执行失败 | 所有存储过程 |

### 系统错误 (9901-9999)
| 错误码 | 错误信息 | 描述 | 使用场景 |
|--------|----------|------|----------|
| 9901 | 系统内部错误 | 未知的系统错误 | 所有模块 |
| 9902 | 服务暂不可用 | 系统维护或过载 | 所有模块 |
| 9903 | 参数验证失败 | 通用参数验证错误 | 所有模块 |
| 9904 | 配置错误 | 系统配置有误 | 所有模块 |
| 9999 | 未知错误 | 无法分类的错误 | 所有模块 |

---

## Java端错误码处理

### ErrorCode枚举类设计
```java
public enum ErrorCode {
    SUCCESS(0, "操作成功"),
    
    // Auth模块错误
    USERNAME_EXISTS(1001, "用户名已存在"),
    ID_NUMBER_EXISTS(1002, "身份证号已存在"),
    PHONE_EXISTS(1003, "手机号已存在"),
    INVALID_USERNAME(1004, "用户名格式无效"),
    INVALID_PASSWORD(1005, "密码格式无效"),
    INVALID_ID_NUMBER(1006, "身份证号格式无效"),
    INVALID_PHONE(1007, "手机号格式无效"),
    INVALID_ROLE(1008, "用户角色无效"),
    MISSING_REQUIRED_PARAM(1009, "必填参数缺失"),
    
    LOGIN_FAILED(1101, "用户名或密码错误"),
    USER_TYPE_MISMATCH(1102, "用户类型不匹配"),
    USER_DISABLED(1103, "用户账户已禁用"),
    USER_LOCKED(1104, "用户账户已锁定"),
    INVALID_LOGIN_PARAM(1105, "登录参数无效"),
    LOGIN_RATE_LIMIT(1106, "登录频率过高"),
    
    USER_NOT_EXISTS(1201, "用户不存在"),
    USER_INFO_FETCH_FAILED(1202, "用户信息获取失败"),
    
    INVALID_TOKEN(1301, "Token无效"),
    TOKEN_EXPIRED(1302, "Token已过期"),
    INSUFFICIENT_PERMISSION(1303, "权限不足"),
    TOKEN_GENERATION_FAILED(1304, "Token生成失败"),
    
    // 通用错误
    DB_CONNECTION_FAILED(9001, "数据库连接失败"),
    DB_TIMEOUT(9002, "数据库超时"),
    DB_CONSTRAINT_VIOLATION(9003, "数据库约束违反"),
    DB_DEADLOCK(9004, "数据库死锁"),
    DB_TRANSACTION_FAILED(9005, "数据库事务失败"),
    
    SYSTEM_ERROR(9901, "系统内部错误"),
    SERVICE_UNAVAILABLE(9902, "服务暂不可用"),
    PARAM_VALIDATION_FAILED(9903, "参数验证失败"),
    CONFIG_ERROR(9904, "配置错误"),
    UNKNOWN_ERROR(9999, "未知错误");
    
    private final int code;
    private final String message;
    
    ErrorCode(int code, String message) {
        this.code = code;
        this.message = message;
    }
    
    public static ErrorCode fromCode(int code) {
        for (ErrorCode errorCode : values()) {
            if (errorCode.code == code) {
                return errorCode;
            }
        }
        return UNKNOWN_ERROR;
    }
}
```

### HTTP状态码映射
| 错误码范围 | HTTP状态码 | 说明 |
|------------|------------|------|
| 0 | 200 | 成功 |
| 1001-1099 | 400 | 注册参数错误 |
| 1101-1199 | 401/403/423/429 | 登录相关错误 |
| 1201-1299 | 404/500 | 用户信息错误 |
| 1301-1399 | 401/403/500 | Token相关错误 |
| 9001-9099 | 500 | 数据库错误 |
| 9901-9999 | 500 | 系统错误 |

---

## 存储过程错误处理模板

### MySQL存储过程错误处理示例
```sql
DELIMITER $$

CREATE PROCEDURE sp_example_procedure(
    IN p_param VARCHAR(100),
    OUT p_result INT,
    OUT p_errcode INT,
    OUT p_errmsg VARCHAR(255)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
            @errno = MYSQL_ERRNO,
            @text = MESSAGE_TEXT;
        
        SET p_errcode = 9999;
        SET p_errmsg = CONCAT('数据库错误: ', @text);
        ROLLBACK;
    END;
    
    DECLARE EXIT HANDLER FOR SQLWARNING
    BEGIN
        SET p_errcode = 9901;
        SET p_errmsg = '系统警告';
        ROLLBACK;
    END;
    
    START TRANSACTION;
    
    -- 初始化输出参数
    SET p_result = NULL;
    SET p_errcode = 0;
    SET p_errmsg = 'SUCCESS';
    
    -- 业务逻辑
    -- ...
    
    COMMIT;
END$$

DELIMITER ;
```

---

## 变更记录
| 版本 | 日期 | 变更内容 | 作者 |
|------|------|----------|------|
| 1.0 | 2025-09-23 | 初始版本，定义Auth模块错误码 | 后端工程师 |

---

## 使用说明
1. **存储过程**：必须返回规范定义的错误码
2. **Java端**：使用ErrorCode枚举处理错误码
3. **前端**：根据HTTP状态码和错误码进行相应处理
4. **扩展**：新增错误码时遵循分段规则，更新此文档