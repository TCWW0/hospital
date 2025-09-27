-- ==================================================================
-- 存储过程模板：用户信息查询
-- 功能：根据用户ID获取用户详细信息
-- 作者：数据库开发人员
-- 创建时间：2025-09-23
-- ==================================================================

DELIMITER $$

DROP PROCEDURE IF EXISTS sp_user_get_info$$

CREATE PROCEDURE sp_user_get_info(
    -- 输入参数
    IN p_user_id INT,
    
    -- 输出参数
    OUT p_username VARCHAR(100),
    OUT p_role VARCHAR(32),
    OUT p_phone VARCHAR(20),
    OUT p_id_number VARCHAR(64),
    OUT p_profile_json TEXT,
    OUT p_created_at TIMESTAMP,
    OUT p_updated_at TIMESTAMP,
    OUT p_errcode INT,
    OUT p_errmsg VARCHAR(255)
)
BEGIN
    -- 声明变量
    DECLARE v_user_count INT DEFAULT 0;
    
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
    
    -- 开始事务（只读事务）
    START TRANSACTION READ ONLY;
    
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
    
    -- 1. 参数验证
    IF p_user_id IS NULL OR p_user_id <= 0 THEN
        SET p_errcode = 3001;
        SET p_errmsg = '无效的用户ID';
        ROLLBACK;
        LEAVE;
    END IF;
    
    -- 2. 查询用户信息
    SELECT 
        username,
        role,
        id_number,
        profile,
        created_at,
        updated_at,
        JSON_UNQUOTE(JSON_EXTRACT(profile, '$.phone')) as phone,
        COUNT(*) OVER() as user_count
    INTO 
        p_username,
        p_role,
        p_id_number,
        p_profile_json,
        p_created_at,
        p_updated_at,
        p_phone,
        v_user_count
    FROM users 
    WHERE id = p_user_id
    LIMIT 1;
    
    -- 3. 检查用户是否存在
    IF p_username IS NULL THEN
        SET p_errcode = 3001;
        SET p_errmsg = '用户不存在';
        ROLLBACK;
        LEAVE;
    END IF;
    
    -- 4. 数据处理（可选的脱敏处理）
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
    
    -- 提交事务
    COMMIT;
    
END$$

DELIMITER ;

-- ==================================================================
-- 扩展存储过程：获取完整用户信息（不脱敏）
-- 功能：用于系统内部调用，返回完整的用户信息
-- ==================================================================

DELIMITER $$

DROP PROCEDURE IF EXISTS sp_user_get_full_info$$

CREATE PROCEDURE sp_user_get_full_info(
    -- 输入参数
    IN p_user_id INT,
    
    -- 输出参数
    OUT p_username VARCHAR(100),
    OUT p_role VARCHAR(32),
    OUT p_phone VARCHAR(20),
    OUT p_id_number VARCHAR(64),
    OUT p_profile_json TEXT,
    OUT p_created_at TIMESTAMP,
    OUT p_updated_at TIMESTAMP,
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
    
    -- 开始事务（只读事务）
    START TRANSACTION READ ONLY;
    
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
        ROLLBACK;
        LEAVE;
    END IF;
    
    -- 查询用户信息（不脱敏）
    SELECT 
        username,
        role,
        id_number,
        profile,
        created_at,
        updated_at,
        JSON_UNQUOTE(JSON_EXTRACT(profile, '$.phone')) as phone
    INTO 
        p_username,
        p_role,
        p_id_number,
        p_profile_json,
        p_created_at,
        p_updated_at,
        p_phone
    FROM users 
    WHERE id = p_user_id
    LIMIT 1;
    
    -- 检查用户是否存在
    IF p_username IS NULL THEN
        SET p_errcode = 3001;
        SET p_errmsg = '用户不存在';
        ROLLBACK;
        LEAVE;
    END IF;
    
    -- 提交事务
    COMMIT;
    
END$$

DELIMITER ;

-- ==================================================================
-- 批量查询存储过程：根据角色查询用户列表
-- 功能：支持分页查询特定角色的用户
-- ==================================================================

DELIMITER $$

DROP PROCEDURE IF EXISTS sp_user_list_by_role$$

CREATE PROCEDURE sp_user_list_by_role(
    -- 输入参数
    IN p_role VARCHAR(32),           -- 用户角色
    IN p_page_size INT,              -- 每页数量
    IN p_page_num INT,               -- 页码（从1开始）
    
    -- 输出参数
    OUT p_total_count INT,           -- 总记录数
    OUT p_errcode INT,
    OUT p_errmsg VARCHAR(255)
)
BEGIN
    -- 声明变量
    DECLARE v_offset INT DEFAULT 0;
    
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
    
    -- 开始事务（只读事务）
    START TRANSACTION READ ONLY;
    
    -- 初始化输出参数
    SET p_total_count = 0;
    SET p_errcode = 0;
    SET p_errmsg = 'SUCCESS';
    
    -- 参数验证
    IF p_page_size IS NULL OR p_page_size <= 0 OR p_page_size > 100 THEN
        SET p_errcode = 9903;
        SET p_errmsg = '无效的页面大小';
        ROLLBACK;
        LEAVE;
    END IF;
    
    IF p_page_num IS NULL OR p_page_num <= 0 THEN
        SET p_errcode = 9903;
        SET p_errmsg = '无效的页码';
        ROLLBACK;
        LEAVE;
    END IF;
    
    -- 计算偏移量
    SET v_offset = (p_page_num - 1) * p_page_size;
    
    -- 获取总记录数
    IF p_role IS NULL OR LENGTH(TRIM(p_role)) = 0 THEN
        SELECT COUNT(*) INTO p_total_count FROM users;
    ELSE
        SELECT COUNT(*) INTO p_total_count FROM users WHERE role = UPPER(TRIM(p_role));
    END IF;
    
    -- 创建临时表存储结果（这里只是示例，实际使用时可能需要返回结果集）
    DROP TEMPORARY TABLE IF EXISTS temp_user_list;
    
    IF p_role IS NULL OR LENGTH(TRIM(p_role)) = 0 THEN
        CREATE TEMPORARY TABLE temp_user_list AS
        SELECT 
            id,
            username,
            role,
            JSON_UNQUOTE(JSON_EXTRACT(profile, '$.phone')) as phone,
            created_at,
            updated_at
        FROM users 
        ORDER BY created_at DESC
        LIMIT p_page_size OFFSET v_offset;
    ELSE
        CREATE TEMPORARY TABLE temp_user_list AS
        SELECT 
            id,
            username,
            role,
            JSON_UNQUOTE(JSON_EXTRACT(profile, '$.phone')) as phone,
            created_at,
            updated_at
        FROM users 
        WHERE role = UPPER(TRIM(p_role))
        ORDER BY created_at DESC
        LIMIT p_page_size OFFSET v_offset;
    END IF;
    
    -- 提交事务
    COMMIT;
    
END$$

DELIMITER ;

-- ==================================================================
-- 使用示例：
-- 
-- 1. 获取用户信息（脱敏）
-- CALL sp_user_get_info(
--     1001,                          -- 用户ID
--     @username,                     -- 输出：用户名
--     @role,                         -- 输出：角色
--     @phone,                        -- 输出：手机号（脱敏）
--     @id_number,                    -- 输出：身份证号（脱敏）
--     @profile_json,                 -- 输出：配置信息
--     @created_at,                   -- 输出：创建时间
--     @updated_at,                   -- 输出：更新时间
--     @errcode,                      -- 输出：错误码
--     @errmsg                        -- 输出：错误信息
-- );
-- 
-- 2. 获取完整用户信息（不脱敏）
-- CALL sp_user_get_full_info(
--     1001,                          -- 用户ID
--     @username,                     -- 输出：用户名
--     @role,                         -- 输出：角色
--     @phone,                        -- 输出：手机号（完整）
--     @id_number,                    -- 输出：身份证号（完整）
--     @profile_json,                 -- 输出：配置信息
--     @created_at,                   -- 输出：创建时间
--     @updated_at,                   -- 输出：更新时间
--     @errcode,                      -- 输出：错误码
--     @errmsg                        -- 输出：错误信息
-- );
-- 
-- 3. 按角色分页查询用户
-- CALL sp_user_list_by_role(
--     'PATIENT',                     -- 角色
--     20,                            -- 每页数量
--     1,                             -- 页码
--     @total_count,                  -- 输出：总记录数
--     @errcode,                      -- 输出：错误码
--     @errmsg                        -- 输出：错误信息
-- );
-- SELECT * FROM temp_user_list;      -- 查看结果
-- 
-- SELECT @username, @role, @phone, @errcode, @errmsg;
-- ==================================================================