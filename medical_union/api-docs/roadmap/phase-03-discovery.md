# Phase 3 — 医院与医生检索

范围
- 面向患者的医院/医生检索与详情。
- 接口：
  - GET /api/v1/hospitals
  - GET /api/v1/hospitals/{id}
  - GET /api/v1/doctors
  - GET /api/v1/doctors/{id}

数据库依赖
- 现有：`doctors`（含 `hospital_id`、`department_id` 字段）
- 新增（建议）：
  - `hospitals` 表（id CHAR(36), name, level, address, contact, intro, created_at, updated_at）
  - `departments` 表（id CHAR(36), hospital_id CHAR(36), name, intro, created_at, updated_at）
  - 补充外键/索引：`doctors.hospital_id -> hospitals.id`，`doctors.department_id -> departments.id`

存储过程建议
- `sp_hospital_list(IN p_page INT, IN p_size INT, IN p_level VARCHAR(10), IN p_keyword VARCHAR(100), OUT p_total INT, OUT p_list_json TEXT, OUT p_errcode INT, OUT p_errmsg TEXT)`
- `sp_hospital_get(IN p_id CHAR(36), OUT p_detail_json TEXT, OUT p_errcode INT, OUT p_errmsg TEXT)`
- `sp_doctor_list(IN p_page INT, IN p_size INT, IN p_hospital_id CHAR(36), IN p_department VARCHAR(100), IN p_keyword VARCHAR(100), OUT p_total INT, OUT p_list_json TEXT, OUT p_errcode INT, OUT p_errmsg TEXT)`
- `sp_doctor_get(IN p_id INT, OUT p_detail_json TEXT, OUT p_errcode INT, OUT p_errmsg TEXT)`

实现要点
- 列表接口分页与过滤（level/keyword/hospital/department）。
- 详情可直接 SELECT 并 JSON_OBJECT 打包。

验收标准
- 能按条件分页返回医院/医生列表；详情字段齐全。

风险与备注
- 需补齐 `hospitals`、`departments` DDL 与种子数据；与 `doctors` 建立外键关系。
