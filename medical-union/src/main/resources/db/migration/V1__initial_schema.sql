-- V1__initial_schema.sql
-- Initial schema for Medical Union
-- Use with Flyway or run manually in MySQL

SET FOREIGN_KEY_CHECKS=0;

-- hospitals
CREATE TABLE IF NOT EXISTS hospitals (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(64),
  address VARCHAR(512),
  phone VARCHAR(64),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- departments
CREATE TABLE IF NOT EXISTS departments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  hospital_id BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(64),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- doctors
CREATE TABLE IF NOT EXISTS doctors (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  hospital_id BIGINT,
  department_id BIGINT,
  name VARCHAR(255) NOT NULL,
  title VARCHAR(128),
  username VARCHAR(128) UNIQUE,
  email VARCHAR(255),
  phone VARCHAR(64),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- patients
CREATE TABLE IF NOT EXISTS patients (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  id_card VARCHAR(64),
  gender ENUM('M','F','O') DEFAULT 'O',
  birth_date DATE,
  phone VARCHAR(64),
  address VARCHAR(512),
  emergency_contact VARCHAR(255),
  emergency_phone VARCHAR(64),
  medical_history TEXT,
  severity_level ENUM('MILD','MODERATE','SEVERE','CRITICAL') DEFAULT 'MILD',
  hospital_id BIGINT,
  department_id BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
  FOREIGN KEY (department_id) REFERENCES departments(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- visits
CREATE TABLE IF NOT EXISTS visits (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  patient_id BIGINT NOT NULL,
  doctor_id BIGINT,
  hospital_id BIGINT,
  visit_date TIMESTAMP,
  diagnosis TEXT,
  treatment TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id),
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- referrals
CREATE TABLE IF NOT EXISTS referrals (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  patient_id BIGINT NOT NULL,
  from_doctor_id BIGINT,
  to_doctor_id BIGINT,
  from_hospital_id BIGINT,
  to_hospital_id BIGINT,
  reason TEXT,
  urgency ENUM('LOW','NORMAL','HIGH') DEFAULT 'NORMAL',
  status ENUM('PENDING','APPROVED','REJECTED','COMPLETED') DEFAULT 'PENDING',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (from_doctor_id) REFERENCES doctors(id),
  FOREIGN KEY (to_doctor_id) REFERENCES doctors(id),
  FOREIGN KEY (from_hospital_id) REFERENCES hospitals(id),
  FOREIGN KEY (to_hospital_id) REFERENCES hospitals(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- users, roles, user_roles
CREATE TABLE IF NOT EXISTS roles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(64) NOT NULL UNIQUE,
  description VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(128) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  user_type ENUM('ADMIN','DOCTOR','PATIENT') NOT NULL,
  related_id BIGINT, -- points to doctors.id or patients.id
  full_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(64),
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_roles (
  user_id BIGINT,
  role_id BIGINT,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT,
  action VARCHAR(128),
  target_table VARCHAR(128),
  target_id BIGINT,
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- indexes
CREATE INDEX idx_patients_name ON patients(name);
CREATE INDEX idx_patients_phone ON patients(phone);
CREATE INDEX idx_visits_patient_date ON visits(patient_id, visit_date);
CREATE INDEX idx_referrals_patient_status ON referrals(patient_id, status);
CREATE INDEX idx_users_username ON users(username);

-- example roles
INSERT IGNORE INTO roles (name, description) VALUES
('ROLE_ADMIN', 'System administrator'),
('ROLE_DOCTOR', 'Doctor role'),
('ROLE_PATIENT', 'Patient role');

-- sample data (optional)
INSERT IGNORE INTO hospitals (id, name, code, address, phone) VALUES
(1, '北京协和医院', 'BJXH', '北京市东城区', '010-12345678');

INSERT IGNORE INTO departments (id, hospital_id, name, code) VALUES
(1,1,'心内科','CARDIO');

INSERT IGNORE INTO doctors (id, hospital_id, department_id, name, title, username, phone) VALUES
(1,1,1,'李医生','主任医师','doctor1','13800000001');

INSERT IGNORE INTO patients (id, name, id_card, gender, birth_date, phone, address, severity_level, hospital_id, department_id) VALUES
(1,'张三','110101199001011234','M','1990-01-01','13912345678','北京市朝阳区','MILD',1,1);

INSERT IGNORE INTO users (id, username, password_hash, user_type, related_id, full_name) VALUES
(1,'admin', '$2a$10$abcdefghijklmnopqrstuv', 'ADMIN', NULL, '系统管理员'),
(2,'doctor1','$2a$10$abcdefghijklmnopqrstuv', 'DOCTOR', 1, '李医生');

-- stored procedure templates for safe delete/update (example)
DROP PROCEDURE IF EXISTS sp_safe_delete_patient;
DELIMITER $$
CREATE PROCEDURE sp_safe_delete_patient(IN p_patient_id BIGINT)
BEGIN
  DECLARE v_cnt INT DEFAULT 0;
  SELECT COUNT(*) INTO v_cnt FROM visits WHERE patient_id = p_patient_id;
  IF v_cnt > 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot delete patient with visits';
  ELSE
    DELETE FROM patients WHERE id = p_patient_id;
    INSERT INTO audit_logs(user_id, action, target_table, target_id, details) VALUES (NULL, 'DELETE_PATIENT', 'patients', p_patient_id, CONCAT('Deleted patient id=', p_patient_id));
  END IF;
END$$
DELIMITER ;

SET FOREIGN_KEY_CHECKS=1;
