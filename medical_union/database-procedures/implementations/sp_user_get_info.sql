CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_user_get_info`(
    IN p_user_id INT,
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