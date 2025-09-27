-- 储存过程定义如下
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_user_register`(
    IN p_username VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
    IN p_password_hash VARCHAR(255),
    IN p_role VARCHAR(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,		
    IN p_phone VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
    
    OUT p_user_id INT,
    OUT p_errcode INT,
    OUT p_errmsg TEXT
)
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
