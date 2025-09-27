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

 Date: 24/09/2025 21:23:47
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for appointments
-- ----------------------------
DROP TABLE IF EXISTS `appointments`;
CREATE TABLE `appointments`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `patient_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `doctor_id` int NULL DEFAULT NULL,
  `schedule_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `date` date NULL DEFAULT NULL,
  `start_time` time NULL DEFAULT NULL,
  `end_time` time NULL DEFAULT NULL,
  `slot_type` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `complaint` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `status` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_appointments_patient`(`patient_id` ASC) USING BTREE,
  INDEX `fk_appointments_doctor`(`doctor_id` ASC) USING BTREE,
  INDEX `fk_appointments_schedule`(`schedule_id` ASC) USING BTREE,
  CONSTRAINT `fk_appointments_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_appointments_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_appointments_schedule` FOREIGN KEY (`schedule_id`) REFERENCES `schedules` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of appointments
-- ----------------------------

-- ----------------------------
-- Table structure for attachments
-- ----------------------------
DROP TABLE IF EXISTS `attachments`;
CREATE TABLE `attachments`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `owner_type` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `owner_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `filename` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `url` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `content_type` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `size` int NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of attachments
-- ----------------------------

-- ----------------------------
-- Table structure for doctors
-- ----------------------------
DROP TABLE IF EXISTS `doctors`;
CREATE TABLE `doctors`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `doctor_code` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `specialties` json NULL,
  `hospital_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `department_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `intro` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `avatar_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `status` tinyint NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `phone_UNIQUE`(`phone` ASC) USING BTREE,
  UNIQUE INDEX `doctor_code`(`doctor_code` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of doctors
-- ----------------------------
INSERT INTO `doctors` VALUES (1, 'DOC001', '$2a$10$6.JptjIQUS.py56/dtBGwerMyqZViZLO0Nis5IwhHiXhxHo4kHPM.', 'Dr_Test', '主任医师', '[\"Cardiology\", \"Internal\"]', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '测试医生简介', 'https://example.com/avatar.jpg', 1, '2025-09-24 10:34:51', '2025-09-24 16:01:30', '13911112222');
INSERT INTO `doctors` VALUES (2, 'DOC002', '$2a$10$euN2uA8ww4MYHo4fwVSWmuQ7m47/og7hxsHVIWjy3F95S5wBsYOOa', 'Dr_New', '副主任医师', '[\"Neurology\", \"Pediatrics\"]', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '新加入医生简介', 'https://example.com/avatar_new.jpg', 1, '2025-09-24 20:26:16', '2025-09-24 20:55:45', '13911113333');

-- ----------------------------
-- Table structure for patients
-- ----------------------------
DROP TABLE IF EXISTS `patients`;
CREATE TABLE `patients`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `user_id` int NULL DEFAULT NULL,
  `name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `gender` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `dob` date NULL DEFAULT NULL,
  `phone` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `id_number` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'ongoing',
  `triage` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'low',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_patients_user`(`user_id` ASC) USING BTREE,
  CONSTRAINT `fk_patients_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of patients
-- ----------------------------

-- ----------------------------
-- Table structure for schedules
-- ----------------------------
DROP TABLE IF EXISTS `schedules`;
CREATE TABLE `schedules`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `doctor_id` int NOT NULL,
  `date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `slot_type` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `capacity` int NULL DEFAULT 1,
  `available` int NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uq_schedule`(`doctor_id` ASC, `date` ASC, `start_time` ASC, `end_time` ASC) USING BTREE,
  CONSTRAINT `fk_schedules_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of schedules
-- ----------------------------

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `role` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'patient',
  `id_number` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `profile` json NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `username`(`username` ASC) USING BTREE,
  UNIQUE INDEX `phone_UNIQUE`(`phone` ASC) USING BTREE,
  UNIQUE INDEX `id_number`(`id_number` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO `user` VALUES (1, 'alice', 'hash_password_123', 'PATIENT', NULL, NULL, '2025-09-23 22:26:03', '2025-09-23 23:56:23', '13812345678');
INSERT INTO `user` VALUES (2, 'testuser', '$2a$10$Op7lYl6fWcmbK1xiPFbD4OOuHlhyxzzjTXcq/dhM6q.qkdAjWO8gO', 'PATIENT', NULL, NULL, '2025-09-24 13:59:01', '2025-09-24 13:59:01', '13800138000');
INSERT INTO `user` VALUES (3, '测试用户001', '$2a$10$aJJN.BwiatuH7LCsxj/w9.mHJidPDzrBgwlDmg5vMwhY9IsT3XDs6', 'PATIENT', NULL, NULL, '2025-09-24 14:08:49', '2025-09-24 14:08:49', '13900139001');
INSERT INTO `user` VALUES (4, 'testuser001', '$2a$10$3fEOLudB6xgpiKIkl1/im.N5TIjz75zkgDYjIIcAFEltPYvHBxIwm', 'PATIENT', NULL, NULL, '2025-09-24 14:19:47', '2025-09-24 14:19:47', '13912345001');
INSERT INTO `user` VALUES (5, 'testuser002', '$2a$10$6x72dck39ni5je1W3NxtP.edkXzdeXoyY44r.Gi.EKyCZnXWUuDPe', 'PATIENT', NULL, NULL, '2025-09-24 14:41:36', '2025-09-24 14:41:36', '13912345002');
INSERT INTO `user` VALUES (6, 'testuser003', '$2a$10$6.JptjIQUS.py56/dtBGwerMyqZViZLO0Nis5IwhHiXhxHo4kHPM.', 'PATIENT', NULL, NULL, '2025-09-24 14:44:09', '2025-09-24 20:58:50', '13912345003');

-- ----------------------------
-- Procedure structure for sp_user_get_info
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_user_get_info`;
delimiter ;;
CREATE PROCEDURE `sp_user_get_info`(IN p_user_id INT,
    OUT p_username VARCHAR(100),
    OUT p_role VARCHAR(32),
    OUT p_phone VARCHAR(20),
    OUT p_id_number VARCHAR(64),
    OUT p_profile_json TEXT,
    OUT p_created_at TIMESTAMP,
    OUT p_updated_at TIMESTAMP,
    OUT p_errcode INT,
    OUT p_errmsg VARCHAR(255))
main_block: BEGIN
    DECLARE v_user_count INT DEFAULT 0;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    GET DIAGNOSTICS CONDITION 1
      @errno = MYSQL_ERRNO,
      @text = MESSAGE_TEXT;
    SET p_errcode = 9999;
    SET p_errmsg = CONCAT('数据库错误[', @errno, ']: ', @text);
    ROLLBACK;
  END;

    DECLARE EXIT HANDLER FOR SQLWARNING
    BEGIN
        SET p_errcode = 9901;
        SET p_errmsg = '系统警告';
    END;

    -- 初始化输出参数
    SET p_username = NULL;
    SET p_role = NULL;
    SET p_phone = NULL;
    SET p_id_number = NULL;
    SET p_profile_json = NULL;
    SET p_created_at = NULL;
    SET p_updated_at = NULL;
    SET p_errcode = 0;
    SET p_errmsg = 'SUCCESS';

    -- 参数验证
    IF p_user_id IS NULL OR p_user_id <= 0 THEN
        SET p_errcode = 3001;
        SET p_errmsg = '无效的用户ID';
        LEAVE main_block;
    END IF;

    -- 查询用户是否存在
    SELECT COUNT(*) INTO v_user_count 
    FROM user 
    WHERE id = p_user_id;

    IF v_user_count = 0 THEN
        SET p_errcode = 3001;
        SET p_errmsg = '用户不存在';
        LEAVE main_block;
    END IF;

    -- 查询用户信息
    SELECT 
        username,
        role,
        id_number,
        profile,
        created_at,
        updated_at,
        phone
    INTO 
        p_username,
        p_role,
        p_id_number,
        p_profile_json,
        p_created_at,
        p_updated_at,
        p_phone
    FROM user 
    WHERE id = p_user_id;

    -- 脱敏身份证号（只显示前6位和后4位）
    IF p_id_number IS NOT NULL AND LENGTH(p_id_number) = 18 THEN
        SET p_id_number = CONCAT(
            SUBSTRING(p_id_number, 1, 6),
            '********',
            SUBSTRING(p_id_number, 15, 4)
        );
    END IF;

    -- 脱敏手机号（只显示前3位和后4位）
    IF p_phone IS NOT NULL AND LENGTH(p_phone) = 11 THEN
        SET p_phone = CONCAT(
            SUBSTRING(p_phone, 1, 3),
            '****',
            SUBSTRING(p_phone, 8, 4)
        );
    END IF;

END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_user_login
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_user_login`;
delimiter ;;
CREATE PROCEDURE `sp_user_login`(IN p_login_name VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  IN p_password_hash VARCHAR(255),
  IN p_user_type VARCHAR(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  OUT p_user_id INT,
  OUT p_username VARCHAR(100),
  OUT p_role VARCHAR(32),
  OUT p_phone VARCHAR(20),
  OUT p_profile_json TEXT,
  OUT p_last_login_at TIMESTAMP,
  OUT p_errcode INT,
  OUT p_errmsg TEXT)
main_block: BEGIN
  DECLARE v_user_count INT DEFAULT 0;
  DECLARE v_db_password_hash VARCHAR(255);

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    GET DIAGNOSTICS CONDITION 1
      @errno = MYSQL_ERRNO,
      @text = MESSAGE_TEXT;
    SET p_errcode = 9999;
    SET p_errmsg = CONCAT('数据库错误[', @errno, ']: ', @text);
    ROLLBACK;
  END;

  -- 初始化输出
  SET p_user_id = NULL;
  SET p_username = NULL;
  SET p_role = NULL;
  SET p_phone = NULL;
  SET p_profile_json = NULL;
  SET p_last_login_at = NULL;
  SET p_errcode = 0;
  SET p_errmsg = 'SUCCESS';

  -- 参数校验
  IF p_login_name IS NULL OR LENGTH(TRIM(p_login_name)) = 0 THEN
    SET p_errcode = 1105;
    SET p_errmsg = '登录名不能为空';
    LEAVE main_block;
  END IF;

  IF p_password_hash IS NULL OR LENGTH(TRIM(p_password_hash)) = 0 THEN
    SET p_errcode = 1105;
    SET p_errmsg = '密码不能为空';
    LEAVE main_block;
  END IF;

  -- 医生逻辑
  IF LOWER(p_user_type) = 'doctor' THEN
    SELECT COUNT(*) INTO v_user_count
    FROM doctors
    WHERE doctor_code = p_login_name;

    IF v_user_count = 0 THEN
      SET p_errcode = 1101;
      SET p_errmsg = '用户名或密码错误';
      LEAVE main_block;
    END IF;

    SELECT id, name, password_hash, phone, updated_at
    INTO p_user_id, p_username, v_db_password_hash, p_phone, p_last_login_at
    FROM doctors
    WHERE doctor_code = p_login_name
    LIMIT 1;

    IF p_password_hash != v_db_password_hash THEN
      SET p_errcode = 1101;
      SET p_errmsg = '用户名或密码错误';
      LEAVE main_block;
    END IF;

    SET p_role = 'DOCTOR';

    SELECT JSON_OBJECT(
      'title', title,
      'specialties', specialties,
      'hospital_id', hospital_id,
      'department_id', department_id,
      'intro', intro,
      'avatar_url', avatar_url
    ) INTO p_profile_json
    FROM doctors
    WHERE id = p_user_id;

    UPDATE doctors SET updated_at = NOW() WHERE id = p_user_id;

  ELSE
    -- 普通用户逻辑
    IF LENGTH(p_login_name) = 11 AND p_login_name REGEXP '^1[0-9]{10}$' THEN
      SELECT id, username, password_hash, role, phone, profile, updated_at
      INTO p_user_id, p_username, v_db_password_hash, p_role, p_phone, p_profile_json, p_last_login_at
      FROM `user`
      WHERE phone = p_login_name
      LIMIT 1;
    ELSE
      SELECT id, username, password_hash, role, phone, profile, updated_at
      INTO p_user_id, p_username, v_db_password_hash, p_role, p_phone, p_profile_json, p_last_login_at
      FROM `user`
      WHERE username = p_login_name
      LIMIT 1;
    END IF;

    IF p_user_id IS NULL OR p_password_hash != v_db_password_hash THEN
      SET p_errcode = 1101;
      SET p_errmsg = '用户名或密码错误';
      LEAVE main_block;
    END IF;

    UPDATE `user` SET updated_at = NOW() WHERE id = p_user_id;
  END IF;

  COMMIT;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_user_login_simple
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_user_login_simple`;
delimiter ;;
CREATE PROCEDURE `sp_user_login_simple`(IN p_login_name VARCHAR(100) CHARACTER SET utf8mb4,
  IN p_user_type VARCHAR(32) CHARACTER SET utf8mb4,
  OUT p_user_id INT,
  OUT p_username VARCHAR(100),
  OUT p_role VARCHAR(32),
  OUT p_phone VARCHAR(20),
  OUT p_profile_json TEXT,
  OUT p_last_login_at TIMESTAMP,
  OUT p_errcode INT,
  OUT p_errmsg TEXT)
main_block: BEGIN
  DECLARE v_user_count INT DEFAULT 0;
  DECLARE v_db_password_hash VARCHAR(255);

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    GET DIAGNOSTICS CONDITION 1
      @errno = MYSQL_ERRNO,
      @text = MESSAGE_TEXT;
    SET p_errcode = 9999;
    SET p_errmsg = CONCAT('数据库错误[', @errno, ']: ', @text);
    ROLLBACK;
  END;

  SET p_user_id = NULL;
  SET p_username = NULL;
  SET p_role = NULL;
  SET p_phone = NULL;
  SET p_profile_json = NULL;
  SET p_last_login_at = NULL;
  SET p_errcode = 0;
  SET p_errmsg = 'SUCCESS';

  IF p_login_name IS NULL OR LENGTH(TRIM(p_login_name)) = 0 THEN
    SET p_errcode = 1105;
    SET p_errmsg = '登录名不能为空';
    LEAVE main_block;
  END IF;

  -- 医生逻辑
  IF LOWER(p_user_type) = 'doctor' THEN
    SELECT COUNT(*) INTO v_user_count
    FROM doctors
    WHERE doctor_code = p_login_name;

    IF v_user_count = 0 THEN
      SET p_errcode = 1101;
      SET p_errmsg = '用户名或密码错误';
      LEAVE main_block;
    END IF;

    SELECT id, name, password_hash, phone, updated_at
    INTO p_user_id, p_username, v_db_password_hash, p_phone, p_last_login_at
    FROM doctors
    WHERE doctor_code = p_login_name
    LIMIT 1;

    SET p_role = 'DOCTOR';

    SELECT JSON_OBJECT(
      'title', title,
      'specialties', specialties,
      'hospital_id', hospital_id,
      'department_id', department_id,
      'intro', intro,
      'avatar_url', avatar_url
    ) INTO p_profile_json
    FROM doctors
    WHERE id = p_user_id;

    UPDATE doctors SET updated_at = NOW() WHERE id = p_user_id;

  ELSE
    -- 普通用户逻辑
    IF LENGTH(p_login_name) = 11 AND p_login_name REGEXP '^1[0-9]{10}$' THEN
      SELECT id, username, password_hash, role, phone, profile, updated_at
      INTO p_user_id, p_username, v_db_password_hash, p_role, p_phone, p_profile_json, p_last_login_at
      FROM `user`
      WHERE phone = p_login_name
      LIMIT 1;
    ELSE
      SELECT id, username, password_hash, role, phone, profile, updated_at
      INTO p_user_id, p_username, v_db_password_hash, p_role, p_phone, p_profile_json, p_last_login_at
      FROM `user`
      WHERE username = p_login_name
      LIMIT 1;
    END IF;

    IF p_user_id IS NULL THEN
      SET p_errcode = 1101;
      SET p_errmsg = '用户名或密码错误';
      LEAVE main_block;
    END IF;

    UPDATE `user` SET updated_at = NOW() WHERE id = p_user_id;
  END IF;

  COMMIT;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_user_register
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_user_register`;
delimiter ;;
CREATE PROCEDURE `sp_user_register`(IN p_username VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
    IN p_password_hash VARCHAR(255),
    IN p_role VARCHAR(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,		
    IN p_phone VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
    
    OUT p_user_id INT,
    OUT p_errcode INT,
    OUT p_errmsg TEXT)
main_block: BEGIN
	-- 声明变量
    DECLARE v_user_count INT DEFAULT 0;
    DECLARE v_id_count INT DEFAULT 0;
	DECLARE v_phone_count INT DEFAULT 0;
    DECLARE v_final_role VARCHAR(32);
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
		GET DIAGNOSTICS CONDITION 1
            @errno = MYSQL_ERRNO,
            @text = MESSAGE_TEXT;
        
        SET p_errcode = 9999;
        SET p_errmsg = CONCAT('数据库错误[', @errno, ']: ', @text);
        ROLLBACK;
    END;
    
    DECLARE EXIT HANDLER FOR SQLWARNING
    BEGIN
        SET p_errcode = 9901;
        SET p_errmsg = '系统警告';
        ROLLBACK;
    END;
    
    -- 开始事务
    START TRANSACTION;
	
    SET p_user_id = NULL;
    SET p_errcode = 0;
    SET p_errmsg = 'SUCCESS';
    
    -- 1.参数验证
    IF p_username IS NULL OR LENGTH(TRIM(p_username)) = 0 THEN
		SET p_errcode = 1009;
        SET p_errmsg = '用户名不能为空';
        ROLLBACK;
        LEAVE main_block;
    END IF;
    
    IF p_password_hash IS NULL OR LENGTH(TRIM(p_password_hash)) = 0 THEN
		SET p_errcode = 1009;
        SET p_errmsg = '密码不能为空';
        ROLLBACK;
        LEAVE main_block;
    END IF;
    
    -- 验证用户名格式（3-100字符，字母数字下划线中文），后续可使用正则来进行更加严格的检测
    IF LENGTH(p_username)<3 OR LENGTH(p_username)>100 THEN
		SET p_errcode = 1004;
        SET p_errmsg = '用户名长度必须在3-100个字符之间';
        ROLLBACK;
        LEAVE main_block;
    END IF;
    
    -- 处理角色默认值
    SET v_final_role = COALESCE(UPPER(TRIM(p_role)),'PATIENT');
    
    -- 验证角色值
    IF v_final_role NOT IN (
		'PATIENT' COLLATE utf8mb4_0900_ai_ci,
		'DOCTOR' COLLATE utf8mb4_0900_ai_ci,
		'ADMIN' COLLATE utf8mb4_0900_ai_ci
	) THEN
        SET p_errcode = 1008;
        SET p_errmsg = '无效的用户角色';
        ROLLBACK;
        LEAVE main_block;
    END IF;
    
     -- 验证手机号格式（如果提供）
    IF p_phone IS NOT NULL AND LENGTH(TRIM(p_phone)) > 0 THEN
        IF LENGTH(p_phone) != 11 OR p_phone NOT REGEXP '^1[0-9]{10}$' THEN
            SET p_errcode = 1007;
            SET p_errmsg = '手机号格式无效';
            ROLLBACK;
            LEAVE main_block;
        END IF;
    END IF;
    
    -- 2.唯一性检查
    -- 检查用户名是否已存在
    SELECT COUNT(*) INTO v_user_count 
    FROM user
    WHERE username = p_username;
    
    IF v_user_count > 0 THEN
        SET p_errcode = 1001;
        SET p_errmsg = '用户名已存在';
        ROLLBACK;
        LEAVE main_block;
    END IF;
    
    -- 检查手机号是否已经存在(实际上是注册阶段必需的字段)
    IF p_phone IS NOT NULL AND LENGTH(TRIM(p_phone)) > 0 THEN
		SELECT COUNT(*) INTO v_phone_count 
        FROM user
        WHERE phone = p_phone;
        
        IF v_phone_count > 0 THEN
            SET p_errcode = 1003;
            SET p_errmsg = '手机号已存在';
            ROLLBACK;
            LEAVE main_block;
        END IF;
    END IF;
    
    -- 3.插入用户数据
    
    INSERT INTO user(
		username,
        password_hash,
        role,
        phone,
        created_at,
        updated_at
    )VALUES(
		p_username,
        p_password_hash,
        v_final_role,
        p_phone,
        NOW(),
		NOW()
    );
    
    SET p_user_id = LAST_INSERT_ID();
    
	-- 提交事务
    COMMIT;
    
END
;;
delimiter ;

SET FOREIGN_KEY_CHECKS = 1;
