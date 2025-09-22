-- V2__stored_procedures.sql
-- Stored procedures for safe create/update/delete of patients (MySQL 8.0+)

DELIMITER $$

-- ===================================
-- CREATE patient
-- ===================================
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
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    GET DIAGNOSTICS CONDITION 1
      @sqlstate = RETURNED_SQLSTATE, @msg = MESSAGE_TEXT;
    SET p_result_code = -1;
    SET p_result_message = CONCAT('SQLSTATE=', @sqlstate, ' MSG=', @msg);
  END;

  START TRANSACTION;
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
END$$

-- ===================================
-- UPDATE patient
-- ===================================
DROP PROCEDURE IF EXISTS sp_safe_update_patient$$
CREATE PROCEDURE sp_safe_update_patient(
  IN p_patient_id BIGINT,
  IN p_name VARCHAR(255),
  IN p_phone VARCHAR(64),
  IN p_address VARCHAR(512),
  OUT p_result_code INT,
  OUT p_result_message VARCHAR(255)
)
BEGIN
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
  SELECT COUNT(*) INTO v_exists FROM patients WHERE id = p_patient_id;

  IF v_exists = 0 THEN
    ROLLBACK;
    SET p_result_code = -2;
    SET p_result_message = 'Patient not found';
  ELSE
    UPDATE patients
    SET name = p_name,
        phone = p_phone,
        address = p_address,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_patient_id;

    INSERT INTO audit_logs(user_id, action, target_table, target_id, details)
    VALUES (NULL, 'UPDATE_PATIENT', 'patients', p_patient_id, CONCAT('Updated patient id=', p_patient_id));

    COMMIT;
    SET p_result_code = 0;
    SET p_result_message = 'OK';
  END IF;
END$$

-- ===================================
-- DELETE patient
-- ===================================
DROP PROCEDURE IF EXISTS sp_safe_delete_patient$$
CREATE PROCEDURE sp_safe_delete_patient(
  IN p_patient_id BIGINT,
  OUT p_result_code INT,
  OUT p_result_message VARCHAR(255)
)
BEGIN
  DECLARE v_cnt INT DEFAULT 0;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    GET DIAGNOSTICS CONDITION 1
      @sqlstate = RETURNED_SQLSTATE, @msg = MESSAGE_TEXT;
    SET p_result_code = -1;
    SET p_result_message = CONCAT('SQLSTATE=', @sqlstate, ' MSG=', @msg);
  END;

  START TRANSACTION;
  SELECT COUNT(*) INTO v_cnt FROM visits WHERE patient_id = p_patient_id;

  IF v_cnt > 0 THEN
    ROLLBACK;
    SET p_result_code = -3;
    SET p_result_message = 'Cannot delete patient with visits';
  ELSE
    DELETE FROM patients WHERE id = p_patient_id;

    INSERT INTO audit_logs(user_id, action, target_table, target_id, details)
    VALUES (NULL, 'DELETE_PATIENT', 'patients', p_patient_id, CONCAT('Deleted patient id=', p_patient_id));

    COMMIT;
    SET p_result_code = 0;
    SET p_result_message = 'OK';
  END IF;
END$$

DELIMITER ;
