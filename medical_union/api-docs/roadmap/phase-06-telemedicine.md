# Phase 6 — 远程医疗

范围
- 申请远程医疗与列表查询。
- 接口：
  - POST /api/v1/telemedicine/apply
  - GET /api/v1/telemedicine/requests

数据库依赖
- 新增表建议：`telemedicine_requests`：
  - `id` CHAR(36) PK
  - `patient_id` CHAR(36) FK -> patients.id
  - `doctor_id` INT FK -> doctors.id
  - `description` TEXT
  - `attachments` JSON 或复用 `attachments` 表通过 owner_type/owner_id 关联
  - `status` VARCHAR(20) DEFAULT 'PENDING'
  - `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  - `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

存储过程建议
- `sp_telemedicine_apply(IN p_patient_id CHAR(36), IN p_doctor_id INT, IN p_description TEXT, IN p_attachments_json TEXT, OUT p_request_id CHAR(36), OUT p_errcode INT, OUT p_errmsg TEXT)`
- `sp_telemedicine_list_by_user(IN p_patient_id CHAR(36), IN p_page INT, IN p_size INT, IN p_status VARCHAR(20), OUT p_total INT, OUT p_list_json TEXT, OUT p_errcode INT, OUT p_errmsg TEXT)`

实现要点
- 附件：可复用 `attachments` 表，采用 `owner_type='telemedicine'` 与 `owner_id=request_id` 关联。
- 审批流（可选）：医生/管理员审批，后续扩展。

验收标准
- 申请成功返回 requestId；列表分页准确；状态流转可记录。

风险与备注
- 敏感信息合规与访问控制；
- 附件安全（URL 过期、鉴权）。
