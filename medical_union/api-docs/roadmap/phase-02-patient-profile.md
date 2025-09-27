# Phase 2 — 患者档案

范围
- 完成患者档案的获取与更新。
- 接口：
  - GET /api/v1/patient/profile
  - PUT /api/v1/patient/profile

数据库依赖
- 复用表：`patients`（已存在，含 `user_id` 外键到 `user.id`）
- 建议存储过程：
  - `sp_patient_get_profile(IN p_user_id INT, OUT p_profile_json TEXT, OUT p_errcode INT, OUT p_errmsg TEXT)`
  - `sp_patient_update_profile(IN p_user_id INT, IN p_profile_json TEXT, OUT p_errcode INT, OUT p_errmsg TEXT)`

实现要点
- 通过 JWT 获取 userId。
- GET：根据 `patients.user_id = userId` 取一条记录，映射为 profile（可直接 SELECT 各字段，或统一封装到 JSON）。
- PUT：将前端传入字段写回 `patients` 对应列（或拼 JSON 写入一个 profile 字段，如果要保持与 user.profile 一致的风格）。

返回模型
- 统一 `{ code, message, data }`。

验收标准
- 已绑定患者能正确返回其档案；未绑定时返回空或特定错误码（例如 404）。
- 更新成功后再次 GET 数据一致。

风险与备注
- `patients.user_id` 需要保证唯一性（一对一）。
- 若未来支持多就诊人，需引入 `patient_id` 与 `user_id` 多对一设计。
