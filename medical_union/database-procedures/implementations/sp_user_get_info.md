

------

# 用户信息查询存储过程 API 文档

## 1. 存储过程定义

```sql
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_user_get_info`(
    IN p_user_id INT,
    OUT p_username VARCHAR(100),
    OUT p_role VARCHAR(32),
    OUT p_phone VARCHAR(20),
    OUT p_id_number VARCHAR(64),
    OUT p_profile_json TEXT,
    OUT p_created_at TIMESTAMP,
    OUT p_updated_at TIMESTAMP,
    OUT p_errcode INT,
    OUT p_errmsg VARCHAR(255)
)
main_block: BEGIN
    DECLARE v_user_count INT DEFAULT 0;

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
    END;

    -- 初始化输出参数
    SET p_username = NULL;
    SET p_role = NULL;
    SET p_phone = NULL;
    SET p_id_number = NULL;
    SET p_profile_json = NULL;
    SET p_created_at = NULL;
    SET p_updated_at = NULL;
    SET p_errcode = 0;
    SET p_errmsg = 'SUCCESS';

    -- 参数验证
    IF p_user_id IS NULL OR p_user_id <= 0 THEN
        SET p_errcode = 3001;
        SET p_errmsg = '无效的用户ID';
        LEAVE main_block;
    END IF;

    -- 查询用户是否存在
    SELECT COUNT(*) INTO v_user_count 
    FROM user 
    WHERE id = p_user_id;

    IF v_user_count = 0 THEN
        SET p_errcode = 3001;
        SET p_errmsg = '用户不存在';
        LEAVE main_block;
    END IF;

    -- 查询用户信息
    SELECT 
        username,
        role,
        id_number,
        profile,
        created_at,
        updated_at,
        phone
    INTO 
        p_username,
        p_role,
        p_id_number,
        p_profile_json,
        p_created_at,
        p_updated_at,
        p_phone
    FROM user 
    WHERE id = p_user_id;

    -- 脱敏身份证号（只显示前6位和后4位）
    IF p_id_number IS NOT NULL AND LENGTH(p_id_number) = 18 THEN
        SET p_id_number = CONCAT(
            SUBSTRING(p_id_number, 1, 6),
            '********',
            SUBSTRING(p_id_number, 15, 4)
        );
    END IF;

    -- 脱敏手机号（只显示前3位和后4位）
    IF p_phone IS NOT NULL AND LENGTH(p_phone) = 11 THEN
        SET p_phone = CONCAT(
            SUBSTRING(p_phone, 1, 3),
            '****',
            SUBSTRING(p_phone, 8, 4)
        );
    END IF;

END
```

------

## 2. 输入参数说明

| 参数名    | 类型 | 必填 | 描述    |
| --------- | ---- | ---- | ------- |
| p_user_id | INT  | 是   | 用户 ID |

------

## 3. 输出参数说明

| 参数名         | 类型         | 描述                                       |
| -------------- | ------------ | ------------------------------------------ |
| p_username     | VARCHAR(100) | 用户名                                     |
| p_role         | VARCHAR(32)  | 用户角色                                   |
| p_phone        | VARCHAR(20)  | 手机号（脱敏显示）                         |
| p_id_number    | VARCHAR(64)  | 身份证号（脱敏显示）                       |
| p_profile_json | TEXT         | 用户信息 JSON                              |
| p_created_at   | TIMESTAMP    | 用户创建时间                               |
| p_updated_at   | TIMESTAMP    | 用户最后更新时间                           |
| p_errcode      | INT          | 错误码，0 表示成功，其它值表示不同类型错误 |
| p_errmsg       | VARCHAR(255) | 错误信息或成功提示文本                     |

### 错误码说明

| 错误码 | 描述                   |
| ------ | ---------------------- |
| 0      | 成功                   |
| 3001   | 用户不存在或无效用户ID |
| 9999   | 数据库异常             |
| 9901   | 系统警告               |

------

## 4. 测试数据

| id   | username | password_hash     | role    | phone       | created_at          | updated_at          |
| ---- | -------- | ----------------- | ------- | ----------- | ------------------- | ------------------- |
| 1    | alice    | hash_password_123 | PATIENT | 13812345678 | 2025-09-23 22:26:03 | 2025-09-23 23:56:23 |

------

## 5. 测试用例

### 5.1 正确用户ID

```sql
CALL sp_user_get_info(
    1,
    @p_username, @p_role, @p_phone, @p_id_number, @p_profile_json, @p_created_at, @p_updated_at, @p_errcode, @p_errmsg
);

SELECT @p_username, @p_role, @p_phone, @p_id_number, @p_profile_json, @p_created_at, @p_updated_at, @p_errcode, @p_errmsg;
```

**期望结果**：

| p_username | p_role  | p_phone     | p_id_number | p_profile_json | p_created_at        | p_updated_at        | p_errcode | p_errmsg |
| ---------- | ------- | ----------- | ----------- | -------------- | ------------------- | ------------------- | --------- | -------- |
| alice      | PATIENT | 138****5678 | NULL        | NULL           | 2025-09-23 22:26:03 | 2025-09-23 23:56:23 | 0         | SUCCESS  |

------

### 5.2 用户ID不存在

```sql
CALL sp_user_get_info(
    999,
    @p_username, @p_role, @p_phone, @p_id_number, @p_profile_json, @p_created_at, @p_updated_at, @p_errcode, @p_errmsg
);
SELECT @p_errcode, @p_errmsg;
```

**期望结果**：

| p_errcode | p_errmsg   |
| --------- | ---------- |
| 3001      | 用户不存在 |

------

### 5.3 用户ID为空

```sql
CALL sp_user_get_info(
    NULL,
    @p_username, @p_role, @p_phone, @p_id_number, @p_profile_json, @p_created_at, @p_updated_at, @p_errcode, @p_errmsg
);
SELECT @p_errcode, @p_errmsg;
```

**期望结果**：

| p_errcode | p_errmsg     |
| --------- | ------------ |
| 3001      | 无效的用户ID |

------

### 5.4 系统异常模拟（如表不存在或查询出错）

```sql
-- 手动触发数据库异常，例如DROP TABLE user; 后执行
CALL sp_user_get_info(
    1,
    @p_username, @p_role, @p_phone, @p_id_number, @p_profile_json, @p_created_at, @p_updated_at, @p_errcode, @p_errmsg
);
SELECT @p_errcode, @p_errmsg;
```

**期望结果**：

| p_errcode | p_errmsg        |
| --------- | --------------- |
| 9999      | 数据库错误[...] |

------

### 5.5 系统警告模拟（如 SQLWARNING 被触发）

```sql
-- 可通过触发 WARNING 的 SQL 进行测试
```

**期望结果**：

| p_errcode | p_errmsg |
| --------- | -------- |
| 9901      | 系统警告 |

------

