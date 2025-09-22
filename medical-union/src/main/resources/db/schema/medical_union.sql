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

 Date: 22/09/2025 13:13:53
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
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of audit_logs
-- ----------------------------

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
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

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
-- Procedure structure for sp_safe_delete_patient
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_safe_delete_patient`;
delimiter ;;
CREATE PROCEDURE `sp_safe_delete_patient`(IN p_patient_id BIGINT)
BEGIN
  DECLARE v_cnt INT DEFAULT 0;
  SELECT COUNT(*) INTO v_cnt FROM visits WHERE patient_id = p_patient_id;
  IF v_cnt > 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot delete patient with visits';
  ELSE
    DELETE FROM patients WHERE id = p_patient_id;
    INSERT INTO audit_logs(user_id, action, target_table, target_id, details) VALUES (NULL, 'DELETE_PATIENT', 'patients', p_patient_id, CONCAT('Deleted patient id=', p_patient_id));
  END IF;
END
;;
delimiter ;

SET FOREIGN_KEY_CHECKS = 1;
