# Auth 模块：存储过程接口说明（草案）

说明：下面列出的存储过程为 Java 端调用契约草案，存储过程的具体 SQL 实现由你负责完成。请在实现后把最终版本放回此文档或另行提供 SQL 文件。Java 端假定所有存储过程通过 OUT 参数返回标准的 errcode（整数）与 errmsg（字符串），并在必要时通过 OUT 返回业务数据（例如 user_id、profile_json 等）。

1) sp_user_register
- 目的：注册新用户
- 入参（IN）:
  - p_username VARCHAR
  - p_password_hash VARCHAR
  - p_role VARCHAR
  - p_id_number VARCHAR (可空)
  - p_profile_json TEXT (可空)
- 出参（OUT）:
  - p_user_id INT
  - p_errcode INT
  - p_errmsg VARCHAR
- 返回语义：p_errcode = 0 表示成功，p_user_id 为新建用户的主键；错误码详见错误码表。

2) sp_user_login
- 目的：验证用户凭证并返回用户信息（MVP：不发 token）
- 入参（IN）:
  - p_username VARCHAR
  - p_password VARCHAR 或 p_password_hash（实现时请说明以便 Java 端配合）
- 出参（OUT）:
  - p_user_id INT
  - p_profile_json TEXT
  - p_role VARCHAR
  - p_errcode INT
  - p_errmsg VARCHAR
- 返回语义：p_errcode = 0 表示成功，其他为失败（如 INVALID_CREDENTIALS）

3) sp_user_set_refresh_token (可选)
- 目的：存储或更新用户的 refresh token（如果后续使用）
- 入参：p_user_id INT, p_refresh_token VARCHAR, p_expires_at TIMESTAMP
- 出参：p_errcode INT, p_errmsg VARCHAR

4) sp_user_invalidate_refresh_token (可选)
- 目的：使某一 refresh token 无效
- 入参：p_user_id INT, p_refresh_token VARCHAR
- 出参：p_errcode INT, p_errmsg VARCHAR


## 错误码草案
- 0: SUCCESS
- 1001: USERNAME_ALREADY_EXISTS
- 1002: INVALID_CREDENTIALS
- 1003: USER_NOT_FOUND
- 1004: WEAK_PASSWORD
- 1005: INVALID_INPUT
- 2001: DB_ERROR

请在实现存储过程时确保对上述错误码进行返回，或在必要时扩展错误码并在实现中记录说明。

