
````markdown
# 用户注册存储过程 API 文档

## 1. 存储过程定义

```sql
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_user_register`(
    IN p_username VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
    IN p_password_hash VARCHAR(255),
    IN p_role VARCHAR(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,		
    IN p_phone VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
    
    OUT p_user_id INT,
    OUT p_errcode INT,
    OUT p_errmsg TEXT
)
main_block: BEGIN
    -- 省略过程体，详见实际sp_user_register.sql中的详细定义
END;
````

**说明**：

* 该存储过程用于用户注册操作，包括参数验证、唯一性检查及用户信息插入。
* 采用事务控制，出现异常或警告时会回滚。

---

## 2. 输入参数说明

| 参数名               | 类型           | 必填 | 描述                                                  |
| ----------------- | ------------ | -- | --------------------------------------------------- |
| p\_username       | VARCHAR(100) | 是  | 用户名，长度 3-100，允许字母、数字、下划线、中文                         |
| p\_password\_hash | VARCHAR(255) | 是  | 用户密码的哈希值，不允许为空                                      |
| p\_role           | VARCHAR(32)  | 否  | 用户角色，MVP 阶段可选 `'PATIENT'`，后续支持 `'DOCTOR'`、`'ADMIN'` |
| p\_phone          | VARCHAR(20)  | 否  | 手机号，长度为 11 位，格式必须符合 `^1[0-9]{10}$`                  |

---

## 3. 输出参数说明

| 参数名         | 类型   | 描述                     |
| ----------- | ---- | ---------------------- |
| p\_user\_id | INT  | 成功注册返回新用户 ID，失败返回 NULL |
| p\_errcode  | INT  | 错误码，0 表示成功，其它值表示不同类型错误 |
| p\_errmsg   | TEXT | 错误信息或成功提示文本            |

### 错误码说明（部分）

| 错误码  | 描述                |
| ---- | ----------------- |
| 0    | 成功                |
| 1001 | 用户名已存在            |
| 1003 | 手机号已存在            |
| 1004 | 用户名长度不合法（3-100字符） |
| 1007 | 手机号格式无效           |
| 1008 | 无效的用户角色           |
| 1009 | 用户名或密码为空          |
| 9999 | 数据库异常             |
| 9901 | 系统警告              |

---

## 4. 边界情况说明

1. **用户名为空** → 返回 1009 错误
2. **密码为空** → 返回 1009 错误
3. **用户名长度 < 3 或 > 100** → 返回 1004 错误
4. **角色非法** → 返回 1008 错误
5. **手机号格式不合法** → 返回 1007 错误
6. **用户名已存在** → 返回 1001 错误
7. **手机号已存在** → 返回 1003 错误
8. **数据库异常** → 返回 9999 错误，含 MySQL 错误信息
9. **系统警告** → 返回 9901 错误

---

## 5. 测试用例

### 5.1 正常注册（成功）

```sql
CALL sp_user_register(
    'alice',
    'hash_password_123',
    'PATIENT',
    '13812345678',
    @p_user_id,
    @p_errcode,
    @p_errmsg
);

SELECT @p_user_id, @p_errcode, @p_errmsg;
```

**期望结果**：

| @p\_user\_id | @p\_errcode | @p\_errmsg |
| ------------ | ----------- | ---------- |
| 自增ID值        | 0           | SUCCESS    |

---

### 5.2 用户名为空

```sql
CALL sp_user_register(
    '',
    'hash_password_123',
    'PATIENT',
    '13812345679',
    @p_user_id,
    @p_errcode,
    @p_errmsg
);

SELECT @p_user_id, @p_errcode, @p_errmsg;
```

**期望结果**：

| @p\_user\_id | @p\_errcode | @p\_errmsg |
| ------------ | ----------- | ---------- |
| NULL         | 1009        | 用户名不能为空    |

---

### 5.3 密码为空

```sql
CALL sp_user_register(
    'bob',
    '',
    'PATIENT',
    '13812345680',
    @p_user_id,
    @p_errcode,
    @p_errmsg
);

SELECT @p_user_id, @p_errcode, @p_errmsg;
```

**期望结果**：

| @p\_user\_id | @p\_errcode | @p\_errmsg |
| ------------ | ----------- | ---------- |
| NULL         | 1009        | 密码不能为空     |

---

### 5.4 用户名已存在

```sql
CALL sp_user_register(
    'alice',  -- 已注册用户名
    'hash_password_456',
    'PATIENT',
    '13812345681',
    @p_user_id,
    @p_errcode,
    @p_errmsg
);

SELECT @p_user_id, @p_errcode, @p_errmsg;
```

**期望结果**：

| @p\_user\_id | @p\_errcode | @p\_errmsg |
| ------------ | ----------- | ---------- |
| NULL         | 1001        | 用户名已存在     |

---

### 5.5 手机号已存在

```sql
CALL sp_user_register(
    'eve',
    'hash_password_123',
    'PATIENT',
    '13812345678',  -- alice 的手机号
    @p_user_id,
    @p_errcode,
    @p_errmsg
);

SELECT @p_user_id, @p_errcode, @p_errmsg;
```

**期望结果**：

| @p\_user\_id | @p\_errcode | @p\_errmsg |
| ------------ | ----------- | ---------- |
| NULL         | 1003        | 手机号已存在     |

---

## 6. 使用建议

1. 调用存储过程前，可以先检查用户名和手机号是否为空或格式合法，减少数据库事务开销。
2. 对于批量注册或高并发场景，可考虑加锁或唯一索引，保证数据一致性。
3. 日志记录：对于返回 9999 或 9901 的情况，可在应用层记录日志以便排查。
4. 参数 `p_role` 在 MVP 阶段固定为 `'PATIENT'`，后续扩展时再允许 `'DOCTOR'` 或 `'ADMIN'`。

---

