# 用户登录存储过程 API 文档

## 1. 存储过程定义

```sql
CREATE DEFINER = CURRENT_USER PROCEDURE `sp_user_login`(
  IN p_login_name VARCHAR(100),   -- 手机号/用户名
  IN p_password_hash VARCHAR(255), -- 输入密码（已加密/哈希）
  IN p_user_type VARCHAR(32),      -- 期望的用户类型（PATIENT/DOCTOR/ADMIN）
  
  OUT p_user_id INT,
  OUT p_username VARCHAR(100),
  OUT p_role VARCHAR(32),
  OUT p_phone VARCHAR(20),
  OUT p_profile_json TEXT,
  OUT p_last_login_at TIMESTAMP,
  OUT p_errcode INT,
  OUT p_errmsg TEXT
)
```

**说明**：

* 该存储过程用于用户登录操作，包括参数验证、登录名类型判断、用户信息查询、密码校验、用户类型匹配及最后登录时间更新。
* 使用事务控制，异常或警告时会回滚。

---

## 2. 输入参数说明

| 参数名          | 类型         | 必填 | 描述                                            |
| --------------- | ------------ | ---- | ----------------------------------------------- |
| p_login_name    | VARCHAR(100) | 是   | 用户登录名，可以是手机号或用户名                |
| p_password_hash | VARCHAR(255) | 是   | 用户密码的哈希值，不允许为空                    |
| p_user_type     | VARCHAR(32)  | 否   | 期望用户类型，可选 'PATIENT'、'DOCTOR'、'ADMIN' |

---

## 3. 输出参数说明

| 参数名          | 类型         | 描述                                       |
| --------------- | ------------ | ------------------------------------------ |
| p_user_id       | INT          | 成功登录返回用户 ID，失败返回 NULL         |
| p_username      | VARCHAR(100) | 用户名                                     |
| p_role          | VARCHAR(32)  | 用户角色                                   |
| p_phone         | VARCHAR(20)  | 手机号                                     |
| p_profile_json  | TEXT         | 用户信息 JSON                              |
| p_last_login_at | TIMESTAMP    | 最后登录时间                               |
| p_errcode       | INT          | 错误码，0 表示成功，其它值表示不同类型错误 |
| p_errmsg        | TEXT         | 错误信息或成功提示文本                     |

### 错误码说明（部分）

| 错误码 | 描述             |
| ------ | ---------------- |
| 0      | 成功             |
| 1101   | 用户名或密码错误 |
| 1102   | 用户类型不匹配   |
| 1105   | 登录名或密码为空 |
| 9999   | 数据库异常       |
| 9901   | 系统警告         |

---

## 4. 边界情况说明

1. **登录名为空** → 返回 1105 错误
2. **密码为空** → 返回 1105 错误
3. **用户名或手机号不存在** → 返回 1101 错误
4. **密码错误** → 返回 1101 错误
5. **用户类型不匹配** → 返回 1102 错误
6. **登录名为手机号格式，但不存在** → 返回 1101 错误
7. **数据库异常** → 返回 9999 错误
8. **系统警告** → 返回 9901 错误

---

## 5. 测试用例

### 5.1 正确用户名 + 密码 + 类型匹配

```sql
CALL sp_user_login(
    'alice',
    'hash_password_123',
    'PATIENT',
    @p_user_id,
    @p_username,
    @p_role,
    @p_phone,
    @p_profile_json,
    @p_last_login_at,
    @p_errcode,
    @p_errmsg
);

SELECT @p_user_id, @p_username, @p_role, @p_phone, @p_profile_json, @p_last_login_at, @p_errcode, @p_errmsg;
```

**期望结果**：

| p_user_id | p_username | p_role  | p_phone     | p_profile_json | p_last_login_at | p_errcode | p_errmsg |
| --------- | ---------- | ------- | ----------- | -------------- | --------------- | --------- | -------- |
| 1         | alice      | PATIENT | 13812345678 | null/{}        | 时间戳          | 0         | SUCCESS  |

---

### 5.2 使用手机号登录

```sql
CALL sp_user_login('13812345678', 'hash_password_123', 'PATIENT',
    @p_user_id, @p_username, @p_role, @p_phone, @p_profile_json, @p_last_login_at, @p_errcode, @p_errmsg);
SELECT @p_user_id, @p_username, @p_role, @p_phone, @p_profile_json, @p_last_login_at, @p_errcode, @p_errmsg;
```

**期望结果**：同上

---

### 5.3 密码错误

```sql
CALL sp_user_login('alice', 'wrong_hash', 'PATIENT',
    @p_user_id, @p_username, @p_role, @p_phone, @p_profile_json, @p_last_login_at, @p_errcode, @p_errmsg);
SELECT @p_user_id, @p_errcode, @p_errmsg;
```

**期望结果**：

| p_user_id | p_errcode | p_errmsg         |
| --------- | --------- | ---------------- |
| NULL      | 1101      | 用户名或密码错误 |

---

### 5.4 用户类型不匹配

```sql
CALL sp_user_login('alice', 'hash_password_123', 'DOCTOR',
    @p_user_id, @p_username, @p_role, @p_phone, @p_profile_json, @p_last_login_at, @p_errcode, @p_errmsg);
SELECT @p_user_id, @p_errcode, @p_errmsg;
```

**期望结果**：

| p_user_id | p_errcode | p_errmsg       |
| --------- | --------- | -------------- |
| NULL      | 1102      | 用户类型不匹配 |

---

### 5.5 手机号不存在

```sql
CALL sp_user_login('13900000000', 'hash_password_123', 'PATIENT',
    @p_user_id, @p_username, @p_role, @p_phone, @p_profile_json, @p_last_login_at, @p_errcode, @p_errmsg);
SELECT @p_user_id, @p_errcode, @p_errmsg;
```

**期望结果**：

| p_user_id | p_errcode | p_errmsg         |
| --------- | --------- | ---------------- |
| NULL      | 1101      | 用户名或密码错误 |

---

### 5.6 用户名不存在

```sql
CALL sp_user_login('unknown_user', 'hash_password_123', 'PATIENT',
    @p_user_id, @p_username, @p_role, @p_phone, @p_profile_json, @p_last_login_at, @p_errcode, @p_errmsg);
SELECT @p_user_id, @p_errcode, @p_errmsg;
```

**期望结果**：同上

---

### 5.7 空用户名

```sql
CALL sp_user_login('', 'hash_password_123', 'PATIENT',
    @p_user_id, @p_username, @p_role, @p_phone, @p_profile_json, @p_last_login_at, @p_errcode, @p_errmsg);
SELECT @p_user_id, @p_errcode, @p_errmsg;
```

**期望结果**：

| p_user_id | p_errcode | p_errmsg       |
| --------- | --------- | -------------- |
| NULL      | 1105      | 登录名不能为空 |

---

### 5.8 空密码

```sql
CALL sp_user_login('alice', '', 'PATIENT',
    @p_user_id, @p_username, @p_role, @p_phone, @p_profile_json, @p_last_login_at, @p_errcode, @p_errmsg);
SELECT @p_user_id, @p_errcode, @p_errmsg;
```

**期望结果**：

| p_user_id | p_errcode | p_errmsg     |
| --------- | --------- | ------------ |
| NULL      | 1105      | 密码不能为空 |

---

### 5.9 NULL用户名

```sql
CALL sp_user_login(NULL, 'hash_password_123', 'PATIENT',
    @p_user_id, @p_username, @p_role, @p_phone, @p_profile_json, @p_last_login_at, @p_errcode, @p_errmsg);
SELECT @p_user_id, @p_errcode, @p_errmsg;
```

**期望结果**：同上

---

### 5.10 用户类型为空（可选参数）

```sql
CALL sp_user_login('alice', 'hash
```





这里基于现在已有的测试数据：

```
id: 1  
doctor_code: DOC001  
password_hash: hash_password_456  
name: Dr_Test  
title: 主任医师  
specialties: ["Cardiology", "Internal"]  
phone: 13911112222  
```

------

# 医生登录存储过程 API 测试用例

## 1. 存储过程定义

```
CREATE PROCEDURE `sp_doctor_login`(
  IN p_login_name VARCHAR(100),     -- 登录名（doctor_code）
  IN p_password_hash VARCHAR(255),  -- 密码哈希值
  
  OUT p_doctor_id INT,
  OUT p_username VARCHAR(200),
  OUT p_specialty JSON,
  OUT p_phone VARCHAR(20),
  OUT p_last_login_at TIMESTAMP,
  OUT p_errcode INT,
  OUT p_errmsg TEXT
)
```

------

## 2. 输入参数说明

| 参数名          | 类型         | 必填 | 描述                       |
| --------------- | ------------ | ---- | -------------------------- |
| p_login_name    | VARCHAR(100) | 是   | 医生登录名，为医院内部编码 |
| p_password_hash | VARCHAR(255) | 是   | 医生密码哈希值             |

------

## 3. 输出参数说明

| 参数名          | 类型         | 描述                   |
| --------------- | ------------ | ---------------------- |
| p_doctor_id     | INT          | 医生 ID                |
| p_username      | VARCHAR(200) | 医生姓名               |
| p_specialty     | JSON         | 医生专业方向           |
| p_phone         | VARCHAR(20)  | 医生手机号             |
| p_last_login_at | TIMESTAMP    | 最后登录时间           |
| p_errcode       | INT          | 错误码，0 表示成功     |
| p_errmsg        | TEXT         | 错误信息或成功提示文本 |

------

## 4. 错误码说明

| 错误码 | 描述             |
| ------ | ---------------- |
| 0      | 成功             |
| 1101   | 用户名或密码错误 |
| 1105   | 登录名或密码为空 |
| 9999   | 数据库异常       |
| 9901   | 系统警告         |

------

## 5. 测试用例

### 5.1 正确doctor_code + 正确密码

```
CALL sp_doctor_login(
    '13911112222',
    'hash_password_456',
    'doctor',
    @p_doctor_id,
    @p_username,
    @p_role,
    @p_phone,
    @p_specialty,
    @p_last_login_at,
    @p_errcode,
    @p_errmsg
);

SELECT @p_doctor_id, @p_username, @p_specialty, @p_phone, @p_last_login_at, @p_errcode, @p_errmsg;
```

**期望结果：**

| p_doctor_id | p_username | p_specialty                                                  | p_phone     | p_last_login_at | p_errcode | p_errmsg |
| ----------- | ---------- | ------------------------------------------------------------ | ----------- | --------------- | --------- | -------- |
| 1           | Dr_Test    | {"intro": "测试医生简介", "title": "主任医师", "avatar_url": "https://example.com/avatar.jpg", "hospital_id": "11111111-1111-1111-1111-111111111111", "specialties": ["Cardiology", "Internal"], "department_id": "22222222-2222-2222-2222-222222222222"} | 13911112222 | 时间戳          | 0         | SUCCESS  |

------

### 5.2 使用 手机号 登录

```
CALL sp_user_login(
    '13911112222',
    'hash_password_456',
    'doctor',
    @p_doctor_id,
    @p_username,
    @p_role,
    @p_phone,
    @p_specialty,
    @p_last_login_at,
    @p_errcode,
    @p_errmsg
);

SELECT @p_doctor_id, @p_username, @p_specialty, @p_phone, @p_last_login_at, @p_errcode, @p_errmsg;
```

**期望结果：**

| p_doctor_id | p_username | p_specialty | p_phone | p_last_login_at | p_errcode | p_errmsg         |
| ----------- | ---------- | ----------- | ------- | --------------- | --------- | ---------------- |
| NULL        | NULL       | NULL        | NULL    | NULL            | 1101      | 用户名或密码错误 |

### 

------

### 5.3 错误密码

```
CALL sp_doctor_login(
    'DOC001',
    'wrong_password',
    'doctor',
    @p_doctor_id,
    @p_username,
    @p_role,
    @p_phone,
    @p_specialty,
    @p_last_login_at,
    @p_errcode,
    @p_errmsg
);

SELECT @p_doctor_id, @p_errcode, @p_errmsg;
```

**期望结果：**

下文中的p_doctor_id可忽略，这是其他设计导致的，想要消除起来很麻烦

| p_doctor_id | p_username | p_specialty | p_phone | p_last_login_at | p_errcode | p_errmsg         |
| ----------- | ---------- | ----------- | ------- | --------------- | --------- | ---------------- |
| 1           | NULL       | NULL        | NULL    | NULL            | 1101      | 用户名或密码错误 |



------

### 

### 5.4 doctor_code 不存在

```
CALL sp_doctor_login(
    'DOC999',
    'hash_password_456',
    'doctor',
    @p_doctor_id,
    @p_username,
    @p_role,
    @p_phone,
    @p_specialty,
    @p_last_login_at,
    @p_errcode,
    @p_errmsg
);

SELECT @p_doctor_id, @p_errcode, @p_errmsg;
```

**期望结果：**

| p_doctor_id | p_username | p_specialty | p_phone | p_last_login_at | p_errcode | p_errmsg         |
| ----------- | ---------- | ----------- | ------- | --------------- | --------- | ---------------- |
| 1           | NULL       | NULL        | NULL    | NULL            | 1101      | 用户名或密码错误 |

------

### 5.5 空登录名

```
CALL sp_doctor_login(
    '',
    'hash_password_456',
    'doctor',
    @p_doctor_id,
    @p_username,
    @p_role,
    @p_phone,
    @p_specialty,
    @p_last_login_at,
    @p_errcode,
    @p_errmsg
);

SELECT @p_doctor_id, @p_errcode, @p_errmsg;
```

**期望结果：**

| p_doctor_id | p_username | p_specialty | p_phone | p_last_login_at | p_errcode | p_errmsg       |
| ----------- | ---------- | ----------- | ------- | --------------- | --------- | -------------- |
| 1           | NULL       | NULL        | NULL    | NULL            | 1105      | 登录名不能为空 |

------

### 5.6 空密码

```
CALL sp_doctor_login(
    'DOC001',
    '',
    'doctor',
    @p_doctor_id,
    @p_username,
    @p_role,
    @p_phone,
    @p_specialty,
    @p_last_login_at,
    @p_errcode,
    @p_errmsg
);

SELECT @p_doctor_id, @p_errcode, @p_errmsg;
```

**期望结果：**

| p_doctor_id | p_username | p_specialty | p_phone | p_last_login_at | p_errcode | p_errmsg     |
| ----------- | ---------- | ----------- | ------- | --------------- | --------- | ------------ |
| 1           | NULL       | NULL        | NULL    | NULL            | 1105      | 密码不能为空 |

------

### 5.7 NULL 登录名

```
CALL sp_doctor_login(
    NULL,
    'hash_password_456',
    'doctor',
    @p_doctor_id,
    @p_username,
    @p_role,
    @p_phone,
    @p_specialty,
    @p_last_login_at,
    @p_errcode,
    @p_errmsg
);

SELECT @p_doctor_id, @p_errcode, @p_errmsg;
```

**期望结果：**

| p_doctor_id | p_username | p_specialty | p_phone | p_last_login_at | p_errcode | p_errmsg       |
| ----------- | ---------- | ----------- | ------- | --------------- | --------- | -------------- |
| 1           | NULL       | NULL        | NULL    | NULL            | 1105      | 登录名不能为空 |

------

### 5.8 NULL 密码

```
CALL sp_doctor_login(
    'DOC001',
    NULL,
    'doctor',
    @p_doctor_id,
    @p_username,
    @p_role,
    @p_phone,
    @p_specialty,
    @p_last_login_at,
    @p_errcode,
    @p_errmsg
);

SELECT @p_doctor_id, @p_errcode, @p_errmsg;
```

**期望结果：**

| p_doctor_id | p_username | p_specialty | p_phone | p_last_login_at | p_errcode | p_errmsg     |
| ----------- | ---------- | ----------- | ------- | --------------- | --------- | ------------ |
| 1           | NULL       | NULL        | NULL    | NULL            | 1105      | 密码不能为空 |