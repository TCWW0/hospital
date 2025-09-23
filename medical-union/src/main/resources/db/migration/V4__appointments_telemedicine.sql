-- V4: Appointments & Telemedicine support
-- Adds tables and stored-procedure skeletons for appointment booking, scheduling, payments, family members, and telemedicine

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------
-- Table structure for family_members
-- patients can have family members which can be used as visit participants
-- --------------------------------------------------
DROP TABLE IF EXISTS `family_members`;
CREATE TABLE `family_members` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `owner_patient_id` BIGINT NOT NULL, -- references patients(id)
  `name` VARCHAR(255) NOT NULL,
  `relation` VARCHAR(64) NULL,
  `id_card` VARCHAR(64) NULL,
  `birth_date` DATE NULL,
  `phone` VARCHAR(64) NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_family_owner`(`owner_patient_id`),
  INDEX `idx_family_idcard`(`id_card`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------
-- Table structure for appointment_slots
-- a slot represents a fixed time window opened by a doctor (or hospital) with capacity/ticketing
-- --------------------------------------------------
DROP TABLE IF EXISTS `appointment_slots`;
CREATE TABLE `appointment_slots` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `doctor_id` BIGINT NULL,
  `hospital_id` BIGINT NULL,
  `department_id` BIGINT NULL,
  `slot_date` DATE NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `slot_type` ENUM('普通','专家','特需') NOT NULL DEFAULT '普通',
  `capacity` INT NOT NULL DEFAULT 1, -- how many concurrent bookings allowed
  `remaining` INT NOT NULL DEFAULT 1,
  `price` DECIMAL(10,2) NULL DEFAULT 0.00,
  `currency` VARCHAR(8) NULL DEFAULT 'CNY',
  `status` ENUM('OPEN','CLOSED','PAUSED') NOT NULL DEFAULT 'OPEN',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY(`id`),
  INDEX `idx_slot_doctor_date`(`doctor_id`,`slot_date`),
  INDEX `idx_slot_hospital_date`(`hospital_id`,`slot_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------
-- Table structure for appointments
-- records a booking (预约) and its status
-- --------------------------------------------------
DROP TABLE IF EXISTS `appointments`;
CREATE TABLE `appointments` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `patient_id` BIGINT NOT NULL,
  `booking_user_id` BIGINT NULL, -- user who made the booking (could be patient or family member owner)
  `family_member_id` BIGINT NULL, -- optional: visit as family member
  `doctor_id` BIGINT NULL,
  `hospital_id` BIGINT NULL,
  `department_id` BIGINT NULL,
  `slot_id` BIGINT NULL, -- appointment_slots.id
  `appointment_type` ENUM('普通','专家','特需') NULL,
  `visit_datetime` DATETIME NULL, -- scheduled date/time (derived from slot)
  `status` ENUM('PENDING','CONFIRMED','CHECKED_IN','COMPLETED','CANCELLED','NO_SHOW') NOT NULL DEFAULT 'PENDING',
  `checkin_code` VARCHAR(64) NULL, -- for on-site pick-up
  `ticket_number` VARCHAR(64) NULL,
  `complaint` TEXT NULL, -- 就诊主诉
  `payment_id` BIGINT NULL,
  `is_insurance` TINYINT(1) NULL DEFAULT 0, -- whether using insurance
  `source` ENUM('WEB','MOBILE','COUNTER') NULL DEFAULT 'WEB',
  `created_by` BIGINT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY(`id`),
  INDEX `idx_appointments_patient`(`patient_id`),
  INDEX `idx_appointments_doctor`(`doctor_id`),
  INDEX `idx_appointments_slot`(`slot_id`),
  INDEX `idx_appointments_status`(`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------
-- Table structure for appointment_payments
-- stores payment attempts and transactions for appointments
-- --------------------------------------------------
DROP TABLE IF EXISTS `appointment_payments`;
CREATE TABLE `appointment_payments` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `appointment_id` BIGINT NULL,
  `amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `currency` VARCHAR(8) NOT NULL DEFAULT 'CNY',
  `payment_method` ENUM('WECHAT','ALIPAY','INSURANCE','CARD','NONE') NOT NULL DEFAULT 'NONE',
  `status` ENUM('INIT','PENDING','PAID','REFUNDED','FAILED') NOT NULL DEFAULT 'INIT',
  `provider_txn_id` VARCHAR(128) NULL,
  `refund_txn_id` VARCHAR(128) NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY(`id`),
  INDEX `idx_payment_appointment`(`appointment_id`),
  INDEX `idx_payment_status`(`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------
-- Table structure for telemedicine_requests
-- patient requests remote consultation; later becomes telemedicine_sessions
-- --------------------------------------------------
DROP TABLE IF EXISTS `telemedicine_requests`;
CREATE TABLE `telemedicine_requests` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `patient_id` BIGINT NOT NULL,
  `appointment_id` BIGINT NULL, -- optional link if created from an appointment
  `requested_specialty` VARCHAR(128) NULL,
  `preferred_mode` ENUM('PHONE','VIDEO') NULL DEFAULT 'VIDEO',
  `preferred_date` DATE NULL,
  `preferred_time_range` VARCHAR(64) NULL,
  `status` ENUM('NEW','ASSIGNED','SCHEDULED','CANCELLED','COMPLETED') NOT NULL DEFAULT 'NEW',
  `assigned_doctor_id` BIGINT NULL,
  `assigned_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY(`id`),
  INDEX `idx_tm_patient`(`patient_id`),
  INDEX `idx_tm_status`(`status`),
  INDEX `idx_tm_specialty`(`requested_specialty`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------
-- Table structure for telemedicine_sessions
-- scheduled session with link/phone info and result
-- --------------------------------------------------
DROP TABLE IF EXISTS `telemedicine_sessions`;
CREATE TABLE `telemedicine_sessions` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `telemedicine_request_id` BIGINT NOT NULL,
  `doctor_id` BIGINT NOT NULL,
  `patient_id` BIGINT NOT NULL,
  `session_mode` ENUM('PHONE','VIDEO') NOT NULL,
  `scheduled_at` DATETIME NULL,
  `duration_minutes` INT NULL,
  `session_link` VARCHAR(1024) NULL,
  `session_phone` VARCHAR(64) NULL,
  `status` ENUM('SCHEDULED','ONGOING','COMPLETED','CANCELLED','NO_SHOW') NOT NULL DEFAULT 'SCHEDULED',
  `diagnosis` TEXT NULL,
  `report_url` VARCHAR(1024) NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY(`id`),
  INDEX `idx_tms_request`(`telemedicine_request_id`),
  INDEX `idx_tms_doctor`(`doctor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------
-- Table structure for patient_documents
-- store uploaded medical records, attachments
-- --------------------------------------------------
DROP TABLE IF EXISTS `patient_documents`;
CREATE TABLE `patient_documents` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `patient_id` BIGINT NOT NULL,
  `uploaded_by` BIGINT NULL,
  `document_type` VARCHAR(128) NULL,
  `file_path` VARCHAR(1024) NOT NULL,
  `file_name` VARCHAR(255) NULL,
  `mime_type` VARCHAR(128) NULL,
  `size_bytes` BIGINT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(`id`),
  INDEX `idx_doc_patient`(`patient_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------
-- Foreign keys (add cautiously, might require data cleanup)
-- Note: these FKs assume referenced tables exist; if not present, apply manually after schema
-- --------------------------------------------------
ALTER TABLE `family_members` ADD CONSTRAINT `fk_family_owner_patient` FOREIGN KEY (`owner_patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;
ALTER TABLE `appointment_slots` ADD CONSTRAINT `fk_slot_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;
ALTER TABLE `appointment_slots` ADD CONSTRAINT `fk_slot_hospital` FOREIGN KEY (`hospital_id`) REFERENCES `hospitals`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;
ALTER TABLE `appointments` ADD CONSTRAINT `fk_app_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;
ALTER TABLE `appointments` ADD CONSTRAINT `fk_app_family_member` FOREIGN KEY (`family_member_id`) REFERENCES `family_members`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;
ALTER TABLE `appointments` ADD CONSTRAINT `fk_app_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;
ALTER TABLE `appointments` ADD CONSTRAINT `fk_app_slot` FOREIGN KEY (`slot_id`) REFERENCES `appointment_slots`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;
ALTER TABLE `appointment_payments` ADD CONSTRAINT `fk_pay_appointment` FOREIGN KEY (`appointment_id`) REFERENCES `appointments`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;
ALTER TABLE `telemedicine_requests` ADD CONSTRAINT `fk_tm_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;
ALTER TABLE `telemedicine_requests` ADD CONSTRAINT `fk_tm_doctor` FOREIGN KEY (`assigned_doctor_id`) REFERENCES `doctors`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;
ALTER TABLE `telemedicine_sessions` ADD CONSTRAINT `fk_tms_request` FOREIGN KEY (`telemedicine_request_id`) REFERENCES `telemedicine_requests`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;
ALTER TABLE `telemedicine_sessions` ADD CONSTRAINT `fk_tms_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `patient_documents` ADD CONSTRAINT `fk_doc_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- --------------------------------------------------
-- Stored-procedure skeletons
-- Important: these are templates — please review and adapt refund/time-window logic to requirements
-- --------------------------------------------------
DROP PROCEDURE IF EXISTS `sp_create_appointment`;
delimiter ;;
CREATE PROCEDURE `sp_create_appointment`(
  IN p_patient_id BIGINT,
  IN p_booking_user_id BIGINT,
  IN p_family_member_id BIGINT,
  IN p_slot_id BIGINT,
  IN p_appointment_type VARCHAR(16),
  IN p_complaint TEXT,
  IN p_is_insurance TINYINT,
  OUT p_appointment_id BIGINT,
  OUT p_result_code INT,
  OUT p_result_message VARCHAR(255)
)
proc_block: BEGIN
  DECLARE v_rem INT DEFAULT 0;
  DECLARE v_slot_date DATE;
  DECLARE v_start TIME;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    GET DIAGNOSTICS CONDITION 1 @sqlstate = RETURNED_SQLSTATE, @msg = MESSAGE_TEXT;
    SET p_result_code = -1;
    SET p_result_message = CONCAT('SQLSTATE=', @sqlstate, ' MSG=', @msg);
  END;

  START TRANSACTION;

  -- check slot exists and remaining > 0
  SELECT remaining, slot_date, start_time INTO v_rem, v_slot_date, v_start FROM appointment_slots WHERE id = p_slot_id FOR UPDATE;
  IF v_rem IS NULL THEN
    ROLLBACK;
    SET p_result_code = -2;
    SET p_result_message = 'Slot not found';
    LEAVE proc_block;
  END IF;

  IF v_rem <= 0 THEN
    ROLLBACK;
    SET p_result_code = -3;
    SET p_result_message = 'No tickets available';
    LEAVE proc_block;
  END IF;

  -- decrement remaining
  UPDATE appointment_slots SET remaining = remaining - 1 WHERE id = p_slot_id;

  INSERT INTO appointments (patient_id, booking_user_id, family_member_id, doctor_id, hospital_id, department_id, slot_id, appointment_type, visit_datetime, complaint, is_insurance, status, created_by)
  SELECT p_patient_id, p_booking_user_id, p_family_member_id, doctor_id, hospital_id, department_id, id, p_appointment_type, TIMESTAMP(slot_date, start_time), p_complaint, p_is_insurance, 'CONFIRMED', p_booking_user_id FROM appointment_slots WHERE id = p_slot_id;

  SET p_appointment_id = LAST_INSERT_ID();

  INSERT INTO audit_logs(user_id, action, target_table, target_id, details) VALUES (p_booking_user_id, 'CREATE_APPOINTMENT', 'appointments', p_appointment_id, CONCAT('Created appointment slot=', p_slot_id, ' appointment=', p_appointment_id));

  COMMIT;
  SET p_result_code = 0;
  SET p_result_message = 'OK';
END proc_block;;
delimiter ;

DROP PROCEDURE IF EXISTS `sp_cancel_appointment`;
delimiter ;;
CREATE PROCEDURE `sp_cancel_appointment`(
  IN p_appointment_id BIGINT,
  IN p_requesting_user BIGINT,
  OUT p_refund_amount DECIMAL(10,2),
  OUT p_result_code INT,
  OUT p_result_message VARCHAR(255)
)
proc_block2: BEGIN
  DECLARE v_status VARCHAR(32);
  DECLARE v_slot_id BIGINT;
  DECLARE v_scheduled DATETIME;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    GET DIAGNOSTICS CONDITION 1 @sqlstate = RETURNED_SQLSTATE, @msg = MESSAGE_TEXT;
    SET p_result_code = -1;
    SET p_result_message = CONCAT('SQLSTATE=', @sqlstate, ' MSG=', @msg);
  END;

  START TRANSACTION;

  SELECT status, slot_id, visit_datetime INTO v_status, v_slot_id, v_scheduled FROM appointments WHERE id = p_appointment_id FOR UPDATE;
  IF v_status IS NULL THEN
    ROLLBACK;
    SET p_result_code = -2;
    SET p_result_message = 'Appointment not found';
    LEAVE proc_block2;
  END IF;

  IF v_status NOT IN ('CONFIRMED','PENDING') THEN
    ROLLBACK;
    SET p_result_code = -3;
    SET p_result_message = 'Cannot cancel in current state';
    LEAVE proc_block2;
  END IF;

  -- simple refund policy: full refund if cancelled >24 hours before scheduled; partial / none otherwise
  SET p_refund_amount = 0.00;
  IF v_scheduled IS NOT NULL THEN
    IF TIMESTAMPDIFF(HOUR, NOW(), v_scheduled) > 24 THEN
      -- try to mark payment for refund (higher level integration required)
      SET p_refund_amount = (SELECT IFNULL(amount,0.00) FROM appointment_payments WHERE appointment_id = p_appointment_id AND status = 'PAID' LIMIT 1);
    END IF;
  END IF;

  UPDATE appointments SET status = 'CANCELLED', updated_at = CURRENT_TIMESTAMP WHERE id = p_appointment_id;

  -- restore slot remaining if linked
  IF v_slot_id IS NOT NULL THEN
    UPDATE appointment_slots SET remaining = remaining + 1 WHERE id = v_slot_id;
  END IF;

  INSERT INTO audit_logs(user_id, action, target_table, target_id, details) VALUES (p_requesting_user, 'CANCEL_APPOINTMENT', 'appointments', p_appointment_id, CONCAT('Cancelled appointment=', p_appointment_id, ' refund=', p_refund_amount));

  COMMIT;
  SET p_result_code = 0;
  SET p_result_message = 'OK';
END proc_block2;;
delimiter ;

-- --------------------------------------------------
-- Notes:
-- 1) The stored procedures above use simple lock-for-update flows on appointment_slots and appointments. In high-concurrency environments
--    you may want to introduce optimistic locking or a dedicated ticketing table to avoid contention.
-- 2) Payment/refund is only sketched here. Real integrations with WeChat/Alipay/医保平台 require secure server-side handlers and webhook processing.
-- 3) For telemedicine assignment, an application-level dispatcher (service) is recommended to consider doctor's load, specialty, and rules; telemedicine_requests table
--    provides assignment fields and timestamps for that purpose.
-- 4) After applying this migration, consider adding additional indexes based on query patterns (e.g. frequent searches by hospital/date/doctor/status).
-- 5) Before adding foreign key constraints in production, ensure referenced rows exist or apply data-clean scripts first.

SET FOREIGN_KEY_CHECKS = 1;
