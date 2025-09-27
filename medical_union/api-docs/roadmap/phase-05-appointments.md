# Phase 5 — 预约挂号

范围
- 创建预约、查询列表与详情、取消预约。
- 接口：
  - POST /api/v1/appointments
  - GET /api/v1/appointments
  - GET /api/v1/appointments/{id}
  - POST /api/v1/appointments/{id}/cancel

数据库依赖
- 复用表：`appointments`、`schedules`、`doctors`、`patients`

存储过程建议
- `sp_appointment_create(IN p_patient_id CHAR(36), IN p_doctor_id INT, IN p_schedule_id CHAR(36), IN p_time_slot VARCHAR(16), OUT p_appointment_id CHAR(36), OUT p_errcode INT, OUT p_errmsg TEXT)`
- `sp_appointment_list_by_user(IN p_patient_id CHAR(36), IN p_page INT, IN p_size INT, IN p_status VARCHAR(32), OUT p_total INT, OUT p_list_json TEXT, OUT p_errcode INT, OUT p_errmsg TEXT)`
- `sp_appointment_get(IN p_id CHAR(36), OUT p_detail_json TEXT, OUT p_errcode INT, OUT p_errmsg TEXT)`
- `sp_appointment_cancel(IN p_id CHAR(36), OUT p_errcode INT, OUT p_errmsg TEXT)`

实现要点
- 创建预约：
  - 事务中检查 `schedules.available > 0`，成功后 `available = available - 1` 并插入 `appointments`；
  - 并发下使用 `SELECT ... FOR UPDATE` 或乐观锁字段。
- 取消预约：恢复 `schedules.available = available + 1`（根据状态机决定是否允许恢复）。

验收标准
- 并发创建下无超卖；列表分页准确；取消后可再次预约。

风险与备注
- 注意幂等（同一用户同一时段重复请求）；
- 预约状态机建议：pending -> booked -> finished/cancelled。
