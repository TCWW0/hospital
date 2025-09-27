# Phase 1 — 用户基础

范围
- 完成用户基础信息查询与修改、修改密码。
- 接口：
  - GET /api/v1/user/me
  - PATCH /api/v1/user/me
  - POST /api/v1/user/change-password

数据库依赖
- 复用表：`user`
- 现有存储过程：`sp_user_get_info`
- 新增建议：
  - `sp_user_update_profile(IN p_user_id INT, IN p_name VARCHAR(200), IN p_avatar_url VARCHAR(500), OUT p_errcode INT, OUT p_errmsg TEXT)`
  - `sp_user_change_password(IN p_user_id INT, IN p_old_hash VARCHAR(255), IN p_new_hash VARCHAR(255), OUT p_errcode INT, OUT p_errmsg TEXT)`

实现要点
- 认证后获取 userId（JWT）。
- /user/me：调用 `sp_user_get_info` 返回基础信息（username/role/phone/idNumber/profile）。
- PATCH /user/me：
  - Java 将 body 合并进 `profile` JSON（或引入独立字段 `name`、`avatar_url`）；
  - 调用 `sp_user_update_profile`（或直接 UPDATE user.profile）。
- POST /user/change-password：
  - Java 先查出 storedHash 并 matches(oldPassword)；
  - 通过后 encode(newPassword) 得到 `new_hash`，传入 `sp_user_change_password` 更新。

返回模型
- 统一 `{ code, message, data }`。
- 成功 `code=200`。

验收标准
- 登录后能成功获取 /user/me。
- 修改昵称/头像能持久化到 `user.profile`。
- 修改密码，oldPassword 错误时报 422；成功后旧密码失效。

风险与备注
- 注意避免在日志打印密码/哈希。
- `profile` JSON 字段建议加长度与内容校验。
