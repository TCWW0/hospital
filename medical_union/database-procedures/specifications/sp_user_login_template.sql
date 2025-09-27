-- ==================================================================
-- 存储过程模板：用户登录
-- 功能：验证用户登录凭证，返回用户信息
-- 作者：数据库开发人员
-- 创建时间：2025-09-23
-- ==================================================================

DELIMITER $$

DROP PROCEDURE IF EXISTS sp_user_login$$

CREATE PROCEDURE sp_user_login(
    -- 输入参数
    IN p_login_name VARCHAR(100),      -- 用户名或手机号
    IN p_password VARCHAR(255),        -- 明文密码
    IN p_user_type VARCHAR(32),        -- 期望的用户类型（可选）
    
    -- 输出参数
    OUT p_user_id INT,
    OUT p_username VARCHAR(100),
    OUT p_role VARCHAR(32),
    OUT p_profile_json TEXT,
    OUT p_password_hash VARCHAR(255),   -- 返回密码哈希供Java端验证
    OUT p_last_login_at TIMESTAMP,
    OUT p_errcode INT,
    OUT p_errmsg VARCHAR(255)
)
BEGIN
    -- 声明变量
    DECLARE v_user_count INT DEFAULT 0;
    DECLARE v_is_phone_number BOOLEAN DEFAULT FALSE;
    DECLARE v_expected_role VARCHAR(32);
    
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
    SET p_username = NULL;
    SET p_role = NULL;
    SET p_profile_json = NULL;
    SET p_password_hash = NULL;
    SET p_last_login_at = NULL;
    SET p_errcode = 0;
    SET p_errmsg = 'SUCCESS';
    
    -- 1. 参数验证
    IF p_login_name IS NULL OR LENGTH(TRIM(p_login_name)) = 0 THEN
        SET p_errcode = 1105;
        SET p_errmsg = '登录名不能为空';
        ROLLBACK;
        LEAVE;
    END IF;
    
    IF p_password IS NULL OR LENGTH(TRIM(p_password)) = 0 THEN
        SET p_errcode = 1105;
        SET p_errmsg = '密码不能为空';
        ROLLBACK;
        LEAVE;
    END IF;
    
    -- 2. 识别登录名类型（手机号 vs 用户名）
    SET v_is_phone_number = (LENGTH(p_login_name) = 11 AND p_login_name REGEXP '^1[0-9]{10}$');
    
    -- 处理期望角色
    SET v_expected_role = UPPER(TRIM(p_user_type));
    
    -- 3. 查找用户
    IF v_is_phone_number THEN
        -- 通过手机号查找用户（从profile中查找）
        SELECT 
            id, username, password_hash, role, profile, updated_at,
            COUNT(*) OVER() as user_count
        INTO 
            p_user_id, p_username, p_password_hash, p_role, p_profile_json, p_last_login_at,
            v_user_count
        FROM users 
        WHERE JSON_UNQUOTE(JSON_EXTRACT(profile, '$.phone')) = p_login_name
        LIMIT 1;
    ELSE
        -- 通过用户名查找用户
        SELECT 
            id, username, password_hash, role, profile, updated_at,
            COUNT(*) OVER() as user_count
        INTO 
            p_user_id, p_username, p_password_hash, p_role, p_profile_json, p_last_login_at,
            v_user_count
        FROM users 
        WHERE username = p_login_name
        LIMIT 1;
    END IF;
    
    -- 4. 检查用户是否存在
    IF p_user_id IS NULL THEN
        SET p_errcode = 1101;
        SET p_errmsg = '用户名或密码错误';
        ROLLBACK;
        LEAVE;
    END IF;
    
    -- 5. 检查用户类型匹配（如果指定了期望类型）
    IF v_expected_role IS NOT NULL AND LENGTH(v_expected_role) > 0 THEN
        IF p_role != v_expected_role THEN
            SET p_errcode = 1102;
            SET p_errmsg = '用户类型不匹配';
            ROLLBACK;
            LEAVE;
        END IF;
    END IF;
    
    -- 6. 检查用户状态（这里可以扩展检查账户是否被禁用等）
    -- 暂时跳过，如果需要可以添加status字段检查
    
    -- 7. 更新登录时间
    -- 注意：密码验证成功后才会调用另一个存储过程来更新登录时间
    -- 这里先不更新，等Java端验证密码成功后再更新
    
    -- 提交事务
    COMMIT;
    
END$$

DELIMITER ;

-- ==================================================================
-- 辅助存储过程：更新登录时间
-- 功能：密码验证成功后更新用户的最后登录时间
-- ==================================================================

DELIMITER $$

DROP PROCEDURE IF EXISTS sp_user_update_login_time$$

CREATE PROCEDURE sp_user_update_login_time(
    -- 输入参数
    IN p_user_id INT,
    
    -- 输出参数
    OUT p_errcode INT,
    OUT p_errmsg VARCHAR(255)
)
BEGIN
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
    
    -- 开始事务
    START TRANSACTION;
    
    -- 初始化输出参数
    SET p_errcode = 0;
    SET p_errmsg = 'SUCCESS';
    
    -- 更新登录时间
    UPDATE users 
    SET updated_at = NOW(),
        profile = JSON_SET(COALESCE(profile, '{}'), '$.lastLoginAt', NOW())
    WHERE id = p_user_id;
    
    -- 检查是否更新成功
    IF ROW_COUNT() = 0 THEN
        SET p_errcode = 1201;
        SET p_errmsg = '用户不存在';
        ROLLBACK;
        LEAVE;
    END IF;
    
    -- 提交事务
    COMMIT;
    
END$$

DELIMITER ;

-- ==================================================================
-- 使用示例：
-- 
-- 1. 登录验证（获取密码哈希）
-- CALL sp_user_login(
--     'testuser',                    -- 登录名（用户名或手机号）
--     'password123',                 -- 明文密码（实际不会用于验证）
--     'PATIENT',                     -- 期望用户类型（可选）
--     @user_id,                      -- 输出：用户ID
--     @username,                     -- 输出：用户名
--     @role,                         -- 输出：用户角色
--     @profile_json,                 -- 输出：用户配置
--     @password_hash,                -- 输出：密码哈希
--     @last_login_at,                -- 输出：最后登录时间
--     @errcode,                      -- 输出：错误码
--     @errmsg                        -- 输出：错误信息
-- );
-- 
-- 2. 更新登录时间（密码验证成功后调用）
-- CALL sp_user_update_login_time(
--     @user_id,                      -- 用户ID
--     @errcode,                      -- 输出：错误码
--     @errmsg                        -- 输出：错误信息
-- );
-- 
-- SELECT @user_id, @username, @role, @errcode, @errmsg;
-- ==================================================================