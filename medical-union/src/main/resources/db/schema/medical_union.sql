/*
 Navicat Premium Dump SQL

 Source Server         : LocalSQL
 Source Server Type    : MySQL
 Source Server Version : 80040 (8.0.40)
 Source Host           : localhost:3306
 Source Schema         : medical_union

 Target Server Type    : MySQL
 Target Server Version : 80040 (8.0.40)
 File Encoding         : 65001

 Date: 23/09/2025 06:25:22
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for audit_logs
-- ----------------------------
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NULL DEFAULT NULL,
  `action` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `target_table` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `target_id` bigint NULL DEFAULT NULL,
  `details` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of audit_logs
-- ----------------------------
INSERT INTO `audit_logs` VALUES (1, NULL, 'CREATE_PATIENT', 'patients', 2, 'Created patient id=2', '2025-09-22 13:54:00');
INSERT INTO `audit_logs` VALUES (2, NULL, 'CREATE_PATIENT', 'patients', 3, 'Created patient id=3', '2025-09-22 13:54:49');
INSERT INTO `audit_logs` VALUES (3, NULL, 'UPDATE_PATIENT', 'patients', 2, 'Updated patient id=2', '2025-09-22 14:17:40');
INSERT INTO `audit_logs` VALUES (4, NULL, 'UPDATE_PATIENT', 'patients', 2, 'Updated patient id=2', '2025-09-22 14:19:18');
INSERT INTO `audit_logs` VALUES (5, NULL, 'DELETE_PATIENT', 'patients', 3, 'Deleted patient id=3', '2025-09-22 14:23:09');
INSERT INTO `audit_logs` VALUES (6, NULL, 'DELETE_PATIENT', 'patients', 2, 'Deleted patient id=2', '2025-09-22 14:24:06');

-- ----------------------------
-- Table structure for departments
-- ----------------------------
DROP TABLE IF EXISTS `departments`;
CREATE TABLE `departments`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `hospital_id` bigint NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `hospital_id`(`hospital_id` ASC) USING BTREE,
  CONSTRAINT `departments_ibfk_1` FOREIGN KEY (`hospital_id`) REFERENCES `hospitals` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of departments
-- ----------------------------
INSERT INTO `departments` VALUES (1, 1, '心内科', 'CARDIO', '2025-09-22 13:08:49', '2025-09-22 13:08:49');

-- ----------------------------
-- Table structure for doctors
-- ----------------------------
DROP TABLE IF EXISTS `doctors`;
CREATE TABLE `doctors`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `hospital_id` bigint NULL DEFAULT NULL,
  `department_id` bigint NULL DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `username` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `phone` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `username`(`username` ASC) USING BTREE,
  INDEX `hospital_id`(`hospital_id` ASC) USING BTREE,
  CONSTRAINT `doctors_ibfk_1` FOREIGN KEY (`hospital_id`) REFERENCES `hospitals` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of doctors
-- ----------------------------
INSERT INTO `doctors` VALUES (1, 1, 1, '李医生', '主任医师', 'doctor1', NULL, '13800000001', '2025-09-22 13:08:49', '2025-09-22 13:08:49');

-- ----------------------------
-- Table structure for hospitals
-- ----------------------------
DROP TABLE IF EXISTS `hospitals`;
CREATE TABLE `hospitals`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `address` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `phone` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of hospitals
-- ----------------------------
INSERT INTO `hospitals` VALUES (1, '北京协和医院', 'BJXH', '北京市东城区', '010-12345678', '2025-09-22 13:08:49', '2025-09-22 13:08:49');

-- ----------------------------
-- Table structure for patients
-- ----------------------------
DROP TABLE IF EXISTS `patients`;
CREATE TABLE `patients`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_card` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `gender` enum('M','F','O') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'O',
  `birth_date` date NULL DEFAULT NULL,
  `phone` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `address` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `emergency_contact` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `emergency_phone` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `medical_history` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `severity_level` enum('MILD','MODERATE','SEVERE','CRITICAL') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'MILD',
  `hospital_id` bigint NULL DEFAULT NULL,
  `department_id` bigint NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `hospital_id`(`hospital_id` ASC) USING BTREE,
  INDEX `department_id`(`department_id` ASC) USING BTREE,
  INDEX `idx_patients_name`(`name` ASC) USING BTREE,
  INDEX `idx_patients_phone`(`phone` ASC) USING BTREE,
  CONSTRAINT `patients_ibfk_1` FOREIGN KEY (`hospital_id`) REFERENCES `hospitals` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `patients_ibfk_2` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of patients
-- ----------------------------
INSERT INTO `patients` VALUES (1, '张三', '110101199001011234', 'M', '1990-01-01', '13912345678', '北京市朝阳区', NULL, NULL, NULL, 'MILD', 1, 1, '2025-09-22 13:08:49', '2025-09-22 13:08:49');

-- ----------------------------
-- Table structure for referrals
-- ----------------------------
DROP TABLE IF EXISTS `referrals`;
CREATE TABLE `referrals`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `patient_id` bigint NOT NULL,
  `from_doctor_id` bigint NULL DEFAULT NULL,
  `to_doctor_id` bigint NULL DEFAULT NULL,
  `from_hospital_id` bigint NULL DEFAULT NULL,
  `to_hospital_id` bigint NULL DEFAULT NULL,
  `reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `urgency` enum('LOW','NORMAL','HIGH') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'NORMAL',
  `status` enum('PENDING','APPROVED','REJECTED','COMPLETED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'PENDING',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `from_doctor_id`(`from_doctor_id` ASC) USING BTREE,
  INDEX `to_doctor_id`(`to_doctor_id` ASC) USING BTREE,
  INDEX `from_hospital_id`(`from_hospital_id` ASC) USING BTREE,
  INDEX `to_hospital_id`(`to_hospital_id` ASC) USING BTREE,
  INDEX `idx_referrals_patient_status`(`patient_id` ASC, `status` ASC) USING BTREE,
  CONSTRAINT `referrals_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `referrals_ibfk_2` FOREIGN KEY (`from_doctor_id`) REFERENCES `doctors` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `referrals_ibfk_3` FOREIGN KEY (`to_doctor_id`) REFERENCES `doctors` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `referrals_ibfk_4` FOREIGN KEY (`from_hospital_id`) REFERENCES `hospitals` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `referrals_ibfk_5` FOREIGN KEY (`to_hospital_id`) REFERENCES `hospitals` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of referrals
-- ----------------------------

-- ----------------------------
-- Table structure for roles
-- ----------------------------
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `name`(`name` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of roles
-- ----------------------------
INSERT INTO `roles` VALUES (1, 'ROLE_ADMIN', 'System administrator');
INSERT INTO `roles` VALUES (2, 'ROLE_DOCTOR', 'Doctor role');
INSERT INTO `roles` VALUES (3, 'ROLE_PATIENT', 'Patient role');

-- ----------------------------
-- Table structure for user_roles
-- ----------------------------
DROP TABLE IF EXISTS `user_roles`;
CREATE TABLE `user_roles`  (
  `user_id` bigint NOT NULL,
  `role_id` bigint NOT NULL,
  PRIMARY KEY (`user_id`, `role_id`) USING BTREE,
  INDEX `role_id`(`role_id` ASC) USING BTREE,
  CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user_roles
-- ----------------------------

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_type` enum('ADMIN','DOCTOR','PATIENT') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `related_id` bigint NULL DEFAULT NULL,
  `full_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `phone` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `enabled` tinyint(1) NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `username`(`username` ASC) USING BTREE,
  INDEX `idx_users_username`(`username` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, 'admin', '$2a$10$abcdefghijklmnopqrstuv', 'ADMIN', NULL, '系统管理员', NULL, NULL, 1, '2025-09-22 13:08:49', '2025-09-22 13:08:49');
INSERT INTO `users` VALUES (2, 'doctor1', '$2a$10$abcdefghijklmnopqrstuv', 'DOCTOR', 1, '李医生', NULL, NULL, 1, '2025-09-22 13:08:49', '2025-09-22 13:08:49');

-- ----------------------------
-- Table structure for visits
-- ----------------------------
DROP TABLE IF EXISTS `visits`;
CREATE TABLE `visits`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `patient_id` bigint NOT NULL,
  `doctor_id` bigint NULL DEFAULT NULL,
  `hospital_id` bigint NULL DEFAULT NULL,
  `visit_date` timestamp NULL DEFAULT NULL,
  `diagnosis` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `treatment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `doctor_id`(`doctor_id` ASC) USING BTREE,
  INDEX `hospital_id`(`hospital_id` ASC) USING BTREE,
  INDEX `idx_visits_patient_date`(`patient_id` ASC, `visit_date` ASC) USING BTREE,
  CONSTRAINT `visits_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `visits_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `visits_ibfk_3` FOREIGN KEY (`hospital_id`) REFERENCES `hospitals` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of visits
-- ----------------------------

-- ----------------------------
-- Procedure structure for sp_safe_create_patient
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_safe_create_patient`;
delimiter ;;
CREATE PROCEDURE `sp_safe_create_patient`(IN p_name VARCHAR(255),
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
  OUT p_result_message VARCHAR(255))
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

END proc_block
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_safe_delete_patient
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_safe_delete_patient`;
delimiter ;;
CREATE PROCEDURE `sp_safe_delete_patient`(IN p_patient_id BIGINT,
  OUT p_result_code INT,
  OUT p_result_message VARCHAR(255))
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
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_safe_update_patient
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_safe_update_patient`;
delimiter ;;
CREATE PROCEDURE `sp_safe_update_patient`(IN p_patient_id BIGINT,
  IN p_name VARCHAR(255),
  IN p_phone VARCHAR(64),
  IN p_address VARCHAR(512),
  OUT p_result_code INT,
  OUT p_result_message VARCHAR(255))
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
END
;;
delimiter ;

SET FOREIGN_KEY_CHECKS = 1;
