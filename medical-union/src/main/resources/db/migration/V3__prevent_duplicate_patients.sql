-- V3__prevent_duplicate_patients.sql
-- Prevent duplicate patients by id_card during create

DELIMITER $$

DROP PROCEDURE IF EXISTS sp_safe_create_patient$$
CREATE PROCEDURE sp_safe_create_patient(
  IN p_name VARCHAR(255),
  IN p_id_card VARCHAR(64),
  IN p_gender CHAR(1),
  IN p_birth_date DATE,
  IN p_phone VARCHAR(64),
  IN p_address VARCHAR(512),
  IN p_medical_card_no VARCHAR(128),
  IN p_emergency_contact VARCHAR(255),
  IN p_emergency_phone VARCHAR(64),
  IN p_severity_level VARCHAR(16),
  IN p_hospital_id BIGINT,
  IN p_department_id BIGINT,
  OUT p_new_id BIGINT,
  OUT p_result_code INT,
  OUT p_result_message VARCHAR(255)
)
proc_block: BEGIN   -- <<< 定义一个可 LEAVE 的标签 block
  DECLARE v_exists INT DEFAULT 0;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    GET DIAGNOSTICS CONDITION 1
      @sqlstate = RETURNED_SQLSTATE, @msg = MESSAGE_TEXT;
    SET p_result_code = -1;
    SET p_result_message = CONCAT('SQLSTATE=', @sqlstate, ' MSG=', @msg);
  END;

  START TRANSACTION;

  -- 如果传入了身份证号，检查是否已存在（避免重复创建）
  IF p_id_card IS NOT NULL AND TRIM(p_id_card) <> '' THEN
    SELECT COUNT(*) INTO v_exists FROM patients WHERE id_card = p_id_card;
    IF v_exists > 0 THEN
      ROLLBACK;
      SET p_result_code = -4;
      SET p_result_message = 'Duplicate id_card';
      LEAVE proc_block;  -- <<< 跳出整个存储过程
    END IF;
  END IF;

  INSERT INTO patients (
    name, id_card, gender, birth_date, phone, address, medical_history,
    severity_level, hospital_id, department_id, created_at
  )
  VALUES (
    p_name, p_id_card, p_gender, p_birth_date, p_phone, p_address, NULL,
    p_severity_level, p_hospital_id, p_department_id, CURRENT_TIMESTAMP
  );

  SET p_new_id = LAST_INSERT_ID();

  INSERT INTO audit_logs(user_id, action, target_table, target_id, details)
  VALUES (NULL, 'CREATE_PATIENT', 'patients', p_new_id, CONCAT('Created patient id=', p_new_id));

  COMMIT;
  SET p_result_code = 0;
  SET p_result_message = 'OK';

END proc_block$$

DELIMITER ;
