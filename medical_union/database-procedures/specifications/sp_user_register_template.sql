-- ==================================================================
-- 存储过程模板：用户注册
-- 功能：实现新用户注册到系统
-- 作者：数据库开发人员
-- 创建时间：2025-09-23
-- ==================================================================

DELIMITER $$

DROP PROCEDURE IF EXISTS sp_user_register$$

CREATE PROCEDURE sp_user_register(
    -- 输入参数
    IN p_username VARCHAR(100),
    IN p_password_hash VARCHAR(255),
    IN p_role VARCHAR(32),
    IN p_phone VARCHAR(20),
    IN p_id_number VARCHAR(64),
    IN p_profile_json TEXT,
    
    -- 输出参数
    OUT p_user_id INT,
    OUT p_errcode INT,
    OUT p_errmsg VARCHAR(255)
)
BEGIN
    -- 声明变量
    DECLARE v_user_count INT DEFAULT 0;
    DECLARE v_id_count INT DEFAULT 0;
    DECLARE v_phone_count INT DEFAULT 0;
    DECLARE v_final_role VARCHAR(32);
    
    -- 声明异常处理器
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
    
    -- 初始化输出参数
    SET p_user_id = NULL;
    SET p_errcode = 0;
    SET p_errmsg = 'SUCCESS';
    
    -- 1. 参数验证
    IF p_username IS NULL OR LENGTH(TRIM(p_username)) = 0 THEN
        SET p_errcode = 1009;
        SET p_errmsg = '用户名不能为空';
        ROLLBACK;
        LEAVE;
    END IF;
    
    IF p_password_hash IS NULL OR LENGTH(TRIM(p_password_hash)) = 0 THEN
        SET p_errcode = 1009;
        SET p_errmsg = '密码不能为空';
        ROLLBACK;
        LEAVE;
    END IF;
    
    -- 验证用户名格式（3-100字符，字母数字下划线中文）
    IF LENGTH(p_username) < 3 OR LENGTH(p_username) > 100 THEN
        SET p_errcode = 1004;
        SET p_errmsg = '用户名长度必须在3-100个字符之间';
        ROLLBACK;
        LEAVE;
    END IF;
    
    -- 处理角色默认值
    SET v_final_role = COALESCE(UPPER(TRIM(p_role)), 'PATIENT');
    
    -- 验证角色值
    IF v_final_role NOT IN ('PATIENT', 'DOCTOR', 'ADMIN') THEN
        SET p_errcode = 1008;
        SET p_errmsg = '无效的用户角色';
        ROLLBACK;
        LEAVE;
    END IF;
    
    -- 验证身份证号格式（如果提供）
    IF p_id_number IS NOT NULL AND LENGTH(TRIM(p_id_number)) > 0 THEN
        IF LENGTH(p_id_number) != 18 OR p_id_number NOT REGEXP '^[0-9]{17}[0-9Xx]$' THEN
            SET p_errcode = 1006;
            SET p_errmsg = '身份证号格式无效';
            ROLLBACK;
            LEAVE;
        END IF;
    END IF;
    
    -- 验证手机号格式（如果提供）
    IF p_phone IS NOT NULL AND LENGTH(TRIM(p_phone)) > 0 THEN
        IF LENGTH(p_phone) != 11 OR p_phone NOT REGEXP '^1[0-9]{10}$' THEN
            SET p_errcode = 1007;
            SET p_errmsg = '手机号格式无效';
            ROLLBACK;
            LEAVE;
        END IF;
    END IF;
    
    -- 验证JSON格式（如果提供）
    IF p_profile_json IS NOT NULL AND LENGTH(TRIM(p_profile_json)) > 0 THEN
        IF NOT JSON_VALID(p_profile_json) THEN
            SET p_errcode = 1004;
            SET p_errmsg = 'profile信息格式无效';
            ROLLBACK;
            LEAVE;
        END IF;
    END IF;
    
    -- 2. 唯一性检查
    
    -- 检查用户名是否已存在
    SELECT COUNT(*) INTO v_user_count 
    FROM users 
    WHERE username = p_username;
    
    IF v_user_count > 0 THEN
        SET p_errcode = 1001;
        SET p_errmsg = '用户名已存在';
        ROLLBACK;
        LEAVE;
    END IF;
    
    -- 检查身份证号是否已存在（如果提供）
    IF p_id_number IS NOT NULL AND LENGTH(TRIM(p_id_number)) > 0 THEN
        SELECT COUNT(*) INTO v_id_count 
        FROM users 
        WHERE id_number = p_id_number;
        
        IF v_id_count > 0 THEN
            SET p_errcode = 1002;
            SET p_errmsg = '身份证号已存在';
            ROLLBACK;
            LEAVE;
        END IF;
    END IF;
    
    -- 检查手机号是否已存在（如果提供）
    -- 注意：这里假设手机号存储在profile的phone字段中
    IF p_phone IS NOT NULL AND LENGTH(TRIM(p_phone)) > 0 THEN
        SELECT COUNT(*) INTO v_phone_count 
        FROM users 
        WHERE JSON_UNQUOTE(JSON_EXTRACT(profile, '$.phone')) = p_phone;
        
        IF v_phone_count > 0 THEN
            SET p_errcode = 1003;
            SET p_errmsg = '手机号已存在';
            ROLLBACK;
            LEAVE;
        END IF;
    END IF;
    
    -- 3. 插入用户数据
    
    -- 构建最终的profile JSON（包含手机号）
    SET @final_profile = COALESCE(p_profile_json, '{}');
    IF p_phone IS NOT NULL AND LENGTH(TRIM(p_phone)) > 0 THEN
        SET @final_profile = JSON_SET(@final_profile, '$.phone', p_phone);
    END IF;
    
    -- 插入用户记录
    INSERT INTO users (
        username,
        password_hash,
        role,
        id_number,
        profile,
        created_at,
        updated_at
    ) VALUES (
        p_username,
        p_password_hash,
        v_final_role,
        NULLIF(TRIM(p_id_number), ''),
        NULLIF(@final_profile, '{}'),
        NOW(),
        NOW()
    );
    
    -- 获取新创建的用户ID
    SET p_user_id = LAST_INSERT_ID();
    
    -- 提交事务
    COMMIT;
    
END$$

DELIMITER ;

-- ==================================================================
-- 使用示例：
-- CALL sp_user_register(
--     'testuser',                                    -- 用户名
--     '$2a$10$...',                                  -- 密码哈希
--     'PATIENT',                                     -- 角色
--     '13812345678',                                 -- 手机号
--     '110101199001011234',                          -- 身份证号
--     '{"nickname":"测试用户","age":25}',              -- 配置信息
--     @user_id,                                      -- 输出：用户ID
--     @errcode,                                      -- 输出：错误码
--     @errmsg                                        -- 输出：错误信息
-- );
-- SELECT @user_id, @errcode, @errmsg;
-- ==================================================================