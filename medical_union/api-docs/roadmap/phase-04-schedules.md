# Phase 4 — 医生排班

范围
- 返回某医生在时间范围内的排班。
- 接口：
  - GET /api/v1/doctors/{id}/schedules?start=YYYY-MM-DD&end=YYYY-MM-DD

数据库依赖
- 复用表：`schedules`（已存在，外键指向 `doctors`）

存储过程建议
- `sp_doctor_schedules_range(IN p_doctor_id INT, IN p_start DATE, IN p_end DATE, OUT p_list_json TEXT, OUT p_errcode INT, OUT p_errmsg TEXT)`

实现要点
- 仅返回该范围内的排班记录（date/start_time/end_time/slot_type/capacity/available）。
- 利用 JSON_ARRAYAGG 打包返回或行集直接映射。

验收标准
- 给定日期范围能正确返回排班数组；边界日期包含。

风险与备注
- 确认 `available` 字段与预约并发的更新策略（参见 Phase 5）。
