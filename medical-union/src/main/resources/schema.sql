-- 医联体管理系统数据库初始化脚本
-- Medical Union Management System Database Initialization Script

-- 创建数据库
CREATE DATABASE IF NOT EXISTS medical_union 
DEFAULT CHARACTER SET utf8mb4 
DEFAULT COLLATE utf8mb4_unicode_ci;

USE medical_union;

-- 1. 医疗机构表 (hospitals)
CREATE TABLE hospitals (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '医院ID',
    name VARCHAR(100) NOT NULL COMMENT '医院名称',
    address VARCHAR(200) COMMENT '医院地址',
    phone VARCHAR(20) COMMENT '联系电话',
    hospital_level ENUM('三甲', '三乙', '二甲', '二乙', '一甲', '一乙', '社区卫生中心') COMMENT '医院等级',
    hospital_type ENUM('综合医院', '专科医院', '中医医院', '社区卫生中心', '诊所') COMMENT '医院类型',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_name (name),
    INDEX idx_level (hospital_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='医疗机构表';

-- 2. 科室表 (departments)
CREATE TABLE departments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '科室ID',
    name VARCHAR(50) NOT NULL COMMENT '科室名称',
    hospital_id BIGINT NOT NULL COMMENT '所属医院ID',
    department_type ENUM('内科', '外科', '妇科', '儿科', '眼科', '耳鼻喉科', '皮肤科', '精神科', '急诊科', '其他') COMMENT '科室类型',
    description TEXT COMMENT '科室描述',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE,
    INDEX idx_hospital_id (hospital_id),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='科室表';

-- 3. 医生表 (doctors)
CREATE TABLE doctors (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '医生ID',
    name VARCHAR(50) NOT NULL COMMENT '医生姓名',
    employee_id VARCHAR(20) UNIQUE COMMENT '工号',
    phone VARCHAR(20) COMMENT '联系电话',
    title ENUM('主任医师', '副主任医师', '主治医师', '住院医师', '实习医师') COMMENT '职称',
    department_id BIGINT NOT NULL COMMENT '所属科室ID',
    specialties TEXT COMMENT '专长领域',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
    INDEX idx_department_id (department_id),
    INDEX idx_employee_id (employee_id),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='医生表';

-- 4. 患者表 (patients)
CREATE TABLE patients (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '患者ID',
    name VARCHAR(50) NOT NULL COMMENT '患者姓名',
    id_card VARCHAR(18) UNIQUE COMMENT '身份证号',
    gender ENUM('男', '女', '未知') DEFAULT '未知' COMMENT '性别',
    birth_date DATE COMMENT '出生日期',
    phone VARCHAR(20) COMMENT '联系电话',
    address VARCHAR(200) COMMENT '联系地址',
    medical_card_no VARCHAR(30) COMMENT '医保卡号',
    emergency_contact VARCHAR(50) COMMENT '紧急联系人',
    emergency_phone VARCHAR(20) COMMENT '紧急联系人电话',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_id_card (id_card),
    INDEX idx_name (name),
    INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='患者表';

-- 5. 就诊记录表 (visits)
CREATE TABLE visits (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '就诊记录ID',
    patient_id BIGINT NOT NULL COMMENT '患者ID',
    doctor_id BIGINT NOT NULL COMMENT '医生ID',
    hospital_id BIGINT NOT NULL COMMENT '医院ID',
    visit_date DATETIME NOT NULL COMMENT '就诊时间',
    chief_complaint TEXT COMMENT '主诉',
    diagnosis TEXT COMMENT '诊断',
    treatment_advice TEXT COMMENT '治疗建议',
    prescription TEXT COMMENT '处方',
    visit_type ENUM('门诊', '急诊', '住院', '复诊') DEFAULT '门诊' COMMENT '就诊类型',
    status ENUM('就诊中', '已完成', '已取消') DEFAULT '就诊中' COMMENT '就诊状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE,
    INDEX idx_patient_id (patient_id),
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_hospital_id (hospital_id),
    INDEX idx_visit_date (visit_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='就诊记录表';

-- 6. 转诊表 (referrals)
CREATE TABLE referrals (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '转诊ID',
    patient_id BIGINT NOT NULL COMMENT '患者ID',
    from_doctor_id BIGINT NOT NULL COMMENT '转出医生ID',
    to_doctor_id BIGINT COMMENT '转入医生ID',
    from_hospital_id BIGINT NOT NULL COMMENT '转出医院ID',
    to_hospital_id BIGINT NOT NULL COMMENT '转入医院ID',
    referral_reason TEXT NOT NULL COMMENT '转诊原因',
    referral_type ENUM('上转', '下转', '平转') DEFAULT '上转' COMMENT '转诊类型',
    priority ENUM('普通', '急诊', '特急') DEFAULT '普通' COMMENT '优先级',
    status ENUM('待审批', '已审批', '已接收', '已完成', '已拒绝', '已取消') DEFAULT '待审批' COMMENT '转诊状态',
    referral_date DATETIME NOT NULL COMMENT '转诊申请时间',
    expected_date DATETIME COMMENT '期望转诊时间',
    approval_date DATETIME COMMENT '审批时间',
    completion_date DATETIME COMMENT '完成时间',
    notes TEXT COMMENT '备注信息',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (from_doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (to_doctor_id) REFERENCES doctors(id) ON DELETE SET NULL,
    FOREIGN KEY (from_hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE,
    FOREIGN KEY (to_hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE,
    INDEX idx_patient_id (patient_id),
    INDEX idx_from_doctor_id (from_doctor_id),
    INDEX idx_to_doctor_id (to_doctor_id),
    INDEX idx_status (status),
    INDEX idx_referral_date (referral_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='转诊表';

-- 7. 用户表 (users) - 支持医生和患者登录
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码(加密后)',
    user_type ENUM('DOCTOR', 'PATIENT', 'ADMIN') NOT NULL COMMENT '用户类型',
    ref_id BIGINT NOT NULL COMMENT '关联ID(医生ID或患者ID)',
    status ENUM('ACTIVE', 'INACTIVE', 'LOCKED') DEFAULT 'ACTIVE' COMMENT '用户状态',
    last_login_time DATETIME COMMENT '最后登录时间',
    login_count INT DEFAULT 0 COMMENT '登录次数',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_username (username),
    INDEX idx_user_type (user_type),
    INDEX idx_ref_id (ref_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 修改患者表，添加病情严重度字段
ALTER TABLE patients 
ADD COLUMN severity_level ENUM('轻症', '中症', '重症', '危重症') DEFAULT '轻症' COMMENT '病情严重度' 
AFTER emergency_phone;

-- 插入测试数据

-- 插入医院数据
INSERT INTO hospitals (name, address, phone, hospital_level, hospital_type) VALUES
('北京协和医院', '北京市东城区王府井大街1号', '010-65296114', '三甲', '综合医院'),
('上海华山医院', '上海市静安区乌鲁木齐中路12号', '021-52889999', '三甲', '综合医院'),
('广州中山医院', '广州市越秀区中山二路58号', '020-87755766', '三甲', '综合医院'),
('社区卫生服务中心', '北京市朝阳区建国路88号', '010-85123456', '社区卫生中心', '社区卫生中心');

-- 插入科室数据
INSERT INTO departments (name, hospital_id, department_type) VALUES
('内科', 1, '内科'),
('外科', 1, '外科'),
('儿科', 1, '儿科'),
('急诊科', 1, '急诊科'),
('心内科', 2, '内科'),
('神经外科', 2, '外科'),
('全科医学科', 4, '内科');

-- 插入医生数据
INSERT INTO doctors (name, employee_id, phone, title, department_id, specialties) VALUES
('张主任', 'D001', '13801234567', '主任医师', 1, '心血管疾病,高血压,糖尿病'),
('李医生', 'D002', '13902345678', '主治医师', 2, '普外科手术,腹腔镜技术'),
('王医生', 'D003', '13703456789', '副主任医师', 3, '儿童呼吸系统疾病,小儿感染'),
('陈医生', 'D004', '13604567890', '主治医师', 4, '急诊抢救,创伤外科'),
('刘教授', 'D005', '13505678901', '主任医师', 5, '冠心病,心律失常'),
('赵医生', 'D006', '13406789012', '副主任医师', 6, '颅脑外伤,脑肿瘤'),
('全科医生', 'D007', '13307890123', '主治医师', 7, '常见病,慢性病管理');

-- 插入患者数据（包含病情严重度）
INSERT INTO patients (name, id_card, gender, birth_date, phone, address, medical_card_no, severity_level) VALUES
('张三', '110101199001011234', '男', '1990-01-01', '13912345678', '北京市朝阳区', 'MC001234567', '轻症'),
('李四', '110101198502152345', '女', '1985-02-15', '13823456789', '北京市海淀区', 'MC002345678', '中症'),
('王五', '110101197803203456', '男', '1978-03-20', '13734567890', '北京市西城区', 'MC003456789', '重症'),
('赵六', '110101199212254567', '女', '1992-12-25', '13645678901', '北京市东城区', 'MC004567890', '轻症'),
('钱七', '110101198807088888', '男', '1988-07-08', '13556789012', '北京市丰台区', 'MC005678901', '危重症'),
('孙八', '110101199505159999', '女', '1995-05-15', '13467890123', '北京市石景山区', 'MC006789012', '中症');

-- 插入用户登录数据
-- 医生用户 (密码为明文，实际应用中需要加密)
INSERT INTO users (username, password, user_type, ref_id, status) VALUES
('doctor_zhang', '$2a$10$XuJjsWT6vZBB4DDgMN.Fzu6rM1H7jfY3ZXKf6Q0A8ZQz7Px8QP3Pe', 'DOCTOR', 1, 'ACTIVE'),  -- 密码: doctor123
('doctor_li', '$2a$10$XuJjsWT6vZBB4DDgMN.Fzu6rM1H7jfY3ZXKf6Q0A8ZQz7Px8QP3Pe', 'DOCTOR', 2, 'ACTIVE'),
('doctor_wang', '$2a$10$XuJjsWT6vZBB4DDgMN.Fzu6rM1H7jfY3ZXKf6Q0A8ZQz7Px8QP3Pe', 'DOCTOR', 3, 'ACTIVE'),
('doctor_chen', '$2a$10$XuJjsWT6vZBB4DDgMN.Fzu6rM1H7jfY3ZXKf6Q0A8ZQz7Px8QP3Pe', 'DOCTOR', 4, 'ACTIVE'),
('doctor_liu', '$2a$10$XuJjsWT6vZBB4DDgMN.Fzu6rM1H7jfY3ZXKf6Q0A8ZQz7Px8QP3Pe', 'DOCTOR', 5, 'ACTIVE'),
('doctor_zhao', '$2a$10$XuJjsWT6vZBB4DDgMN.Fzu6rM1H7jfY3ZXKf6Q0A8ZQz7Px8QP3Pe', 'DOCTOR', 6, 'ACTIVE'),
('doctor_quanke', '$2a$10$XuJjsWT6vZBB4DDgMN.Fzu6rM1H7jfY3ZXKf6Q0A8ZQz7Px8QP3Pe', 'DOCTOR', 7, 'ACTIVE');

-- 患者用户 (密码为明文，实际应用中需要加密)
INSERT INTO users (username, password, user_type, ref_id, status) VALUES
('patient_zhang', '$2a$10$L7bO9QMXR8qhYyNO8.Fzu6rM1H7jfY3ZXKf6Q0A8ZQz7Px8QP4Rg', 'PATIENT', 1, 'ACTIVE'),  -- 密码: patient123
('patient_li', '$2a$10$L7bO9QMXR8qhYyNO8.Fzu6rM1H7jfY3ZXKf6Q0A8ZQz7Px8QP4Rg', 'PATIENT', 2, 'ACTIVE'),
('patient_wang', '$2a$10$L7bO9QMXR8qhYyNO8.Fzu6rM1H7jfY3ZXKf6Q0A8ZQz7Px8QP4Rg', 'PATIENT', 3, 'ACTIVE'),
('patient_zhao', '$2a$10$L7bO9QMXR8qhYyNO8.Fzu6rM1H7jfY3ZXKf6Q0A8ZQz7Px8QP4Rg', 'PATIENT', 4, 'ACTIVE'),
('patient_qian', '$2a$10$L7bO9QMXR8qhYyNO8.Fzu6rM1H7jfY3ZXKf6Q0A8ZQz7Px8QP4Rg', 'PATIENT', 5, 'ACTIVE'),
('patient_sun', '$2a$10$L7bO9QMXR8qhYyNO8.Fzu6rM1H7jfY3ZXKf6Q0A8ZQz7Px8QP4Rg', 'PATIENT', 6, 'ACTIVE');

-- 管理员用户
INSERT INTO users (username, password, user_type, ref_id, status) VALUES
('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'ADMIN', 0, 'ACTIVE');  -- 密码: admin123

-- 插入就诊记录数据
INSERT INTO visits (patient_id, doctor_id, hospital_id, visit_date, chief_complaint, diagnosis, treatment_advice, visit_type) VALUES
(1, 1, 1, '2024-01-15 09:00:00', '胸闷气短', '高血压病', '规律服药，定期监测血压', '门诊'),
(2, 3, 1, '2024-01-16 14:30:00', '发热咳嗽', '上呼吸道感染', '抗感染治疗，多休息', '门诊'),
(3, 2, 1, '2024-01-17 10:15:00', '腹痛', '急性阑尾炎', '建议手术治疗', '急诊'),
(4, 7, 4, '2024-01-18 16:20:00', '头痛头晕', '原发性高血压', '生活方式干预，药物治疗', '门诊');

-- 插入转诊记录数据
INSERT INTO referrals (patient_id, from_doctor_id, to_doctor_id, from_hospital_id, to_hospital_id, 
                      referral_reason, referral_type, priority, status, referral_date, expected_date) VALUES
(4, 7, 1, 4, 1, '血压控制不佳，需要专科诊治', '上转', '普通', '已审批', '2024-01-18 17:00:00', '2024-01-20 09:00:00'),
(3, 2, NULL, 1, 4, '术后康复指导', '下转', '普通', '待审批', '2024-01-20 10:00:00', '2024-01-22 14:00:00');

-- 存储过程定义
DELIMITER //

-- 1. 安全删除患者存储过程
CREATE PROCEDURE sp_safe_delete_patient(
    IN p_patient_id BIGINT,
    OUT p_result_code INT,
    OUT p_result_message VARCHAR(255)
)
BEGIN
    DECLARE v_visit_count INT DEFAULT 0;
    DECLARE v_referral_count INT DEFAULT 0;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION 
    BEGIN
        ROLLBACK;
        SET p_result_code = -1;
        SET p_result_message = '删除患者失败：数据库错误';
    END;
    
    START TRANSACTION;
    
    -- 检查是否存在关联的就诊记录
    SELECT COUNT(*) INTO v_visit_count FROM visits WHERE patient_id = p_patient_id;
    
    -- 检查是否存在关联的转诊记录
    SELECT COUNT(*) INTO v_referral_count FROM referrals WHERE patient_id = p_patient_id;
    
    -- 如果存在关联记录，不允许删除
    IF v_visit_count > 0 OR v_referral_count > 0 THEN
        SET p_result_code = -2;
        SET p_result_message = CONCAT('删除失败：患者存在', v_visit_count, '条就诊记录和', v_referral_count, '条转诊记录');
        ROLLBACK;
    ELSE
        -- 安全删除患者
        DELETE FROM patients WHERE id = p_patient_id;
        
        IF ROW_COUNT() > 0 THEN
            SET p_result_code = 0;
            SET p_result_message = '患者删除成功';
            COMMIT;
        ELSE
            SET p_result_code = -3;
            SET p_result_message = '删除失败：患者不存在';
            ROLLBACK;
        END IF;
    END IF;
END //

-- 2. 安全更新患者信息存储过程
CREATE PROCEDURE sp_safe_update_patient(
    IN p_patient_id BIGINT,
    IN p_name VARCHAR(50),
    IN p_phone VARCHAR(20),
    IN p_address VARCHAR(200),
    OUT p_result_code INT,
    OUT p_result_message VARCHAR(255)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION 
    BEGIN
        ROLLBACK;
        SET p_result_code = -1;
        SET p_result_message = '更新患者信息失败：数据库错误';
    END;
    
    START TRANSACTION;
    
    UPDATE patients 
    SET name = p_name,
        phone = p_phone,
        address = p_address,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_patient_id;
    
    IF ROW_COUNT() > 0 THEN
        SET p_result_code = 0;
        SET p_result_message = '患者信息更新成功';
        COMMIT;
    ELSE
        SET p_result_code = -2;
        SET p_result_message = '更新失败：患者不存在';
        ROLLBACK;
    END IF;
END //

-- 3. 转诊状态更新存储过程
CREATE PROCEDURE sp_update_referral_status(
    IN p_referral_id BIGINT,
    IN p_status VARCHAR(20),
    IN p_to_doctor_id BIGINT,
    IN p_notes TEXT,
    OUT p_result_code INT,
    OUT p_result_message VARCHAR(255)
)
BEGIN
    DECLARE v_current_status VARCHAR(20);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION 
    BEGIN
        ROLLBACK;
        SET p_result_code = -1;
        SET p_result_message = '更新转诊状态失败：数据库错误';
    END;
    
    START TRANSACTION;
    
    -- 获取当前状态
    SELECT status INTO v_current_status FROM referrals WHERE id = p_referral_id;
    
    -- 检查状态转换是否合法
    IF v_current_status IS NULL THEN
        SET p_result_code = -2;
        SET p_result_message = '更新失败：转诊记录不存在';
        ROLLBACK;
    ELSEIF v_current_status = '已完成' OR v_current_status = '已取消' THEN
        SET p_result_code = -3;
        SET p_result_message = CONCAT('更新失败：转诊已', v_current_status, '，无法修改');
        ROLLBACK;
    ELSE
        -- 更新转诊状态
        UPDATE referrals 
        SET status = p_status,
            to_doctor_id = IFNULL(p_to_doctor_id, to_doctor_id),
            notes = IFNULL(p_notes, notes),
            approval_date = CASE WHEN p_status = '已审批' THEN CURRENT_TIMESTAMP ELSE approval_date END,
            completion_date = CASE WHEN p_status = '已完成' THEN CURRENT_TIMESTAMP ELSE completion_date END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = p_referral_id;
        
        SET p_result_code = 0;
        SET p_result_message = CONCAT('转诊状态更新为：', p_status);
        COMMIT;
    END IF;
END //

-- 4. 安全删除医生存储过程
CREATE PROCEDURE sp_safe_delete_doctor(
    IN p_doctor_id BIGINT,
    OUT p_result_code INT,
    OUT p_result_message VARCHAR(255)
)
BEGIN
    DECLARE v_visit_count INT DEFAULT 0;
    DECLARE v_referral_count INT DEFAULT 0;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION 
    BEGIN
        ROLLBACK;
        SET p_result_code = -1;
        SET p_result_message = '删除医生失败：数据库错误';
    END;
    
    START TRANSACTION;
    
    -- 检查是否存在关联记录
    SELECT COUNT(*) INTO v_visit_count FROM visits WHERE doctor_id = p_doctor_id;
    SELECT COUNT(*) INTO v_referral_count FROM referrals WHERE from_doctor_id = p_doctor_id OR to_doctor_id = p_doctor_id;
    
    IF v_visit_count > 0 OR v_referral_count > 0 THEN
        SET p_result_code = -2;
        SET p_result_message = CONCAT('删除失败：医生存在', v_visit_count, '条就诊记录和', v_referral_count, '条转诊记录');
        ROLLBACK;
    ELSE
        DELETE FROM doctors WHERE id = p_doctor_id;
        
        IF ROW_COUNT() > 0 THEN
            SET p_result_code = 0;
            SET p_result_message = '医生删除成功';
            COMMIT;
        ELSE
            SET p_result_code = -3;
            SET p_result_message = '删除失败：医生不存在';
            ROLLBACK;
        END IF;
    END IF;
END //

DELIMITER ;

COMMIT;