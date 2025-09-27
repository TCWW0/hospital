CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_user_login`(
  IN p_login_name VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  IN p_password_hash VARCHAR(255),
  IN p_user_type VARCHAR(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  OUT p_user_id INT,
  OUT p_username VARCHAR(100),
  OUT p_role VARCHAR(32),
  OUT p_phone VARCHAR(20),
  OUT p_profile_json TEXT,
  OUT p_last_login_at TIMESTAMP,
  OUT p_errcode INT,
  OUT p_errmsg TEXT
)
main_block: BEGIN
  -- 声明变量
  DECLARE v_user_count INT DEFAULT 0;
  DECLARE v_is_phone_number TINYINT(1) DEFAULT 0;  -- 0=false, 1=true
  DECLARE v_expected_role VARCHAR(32);
  DECLARE v_db_password_hash VARCHAR(255);

  -- 异常处理
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    GET DIAGNOSTICS CONDITION 1
      @errno = MYSQL_ERRNO,
      @text = MESSAGE_TEXT;
    SET p_errcode = 9999;
    SET p_errmsg = CONCAT('数据库错误[', @errno, ']: ', @text);
    ROLLBACK;
  END;

  -- 开启事务
  START TRANSACTION;

  -- 初始化输出参数
  SET p_user_id = NULL;
  SET p_username = NULL;
  SET p_role = NULL;
  SET p_phone = NULL;
  SET p_profile_json = NULL;
  SET p_last_login_at = NULL;
  SET p_errcode = 0;
  SET p_errmsg = 'SUCCESS';

  -- 1. 参数验证
  IF p_login_name IS NULL OR LENGTH(TRIM(p_login_name)) = 0 THEN
    SET p_errcode = 1105;
    SET p_errmsg = '登录名不能为空';
    ROLLBACK;
    LEAVE main_block;
  END IF;

  IF p_password_hash IS NULL OR LENGTH(TRIM(p_password_hash)) = 0 THEN
    SET p_errcode = 1105;
    SET p_errmsg = '密码不能为空';
    ROLLBACK;
    LEAVE main_block;
  END IF;

  -- 2. 判断登录名类型（手机号/用户名）
  SET v_is_phone_number = (LENGTH(p_login_name) = 11 AND p_login_name REGEXP '^1[0-9]{10}$');
  SET v_expected_role = UPPER(TRIM(p_user_type));

  -- 3. 先检查用户是否存在
  IF v_is_phone_number THEN
    SELECT COUNT(*) INTO v_user_count
    FROM `user`
    WHERE phone = p_login_name;
  ELSE
    SELECT COUNT(*) INTO v_user_count
    FROM `user`
    WHERE username = p_login_name;
  END IF;

  IF v_user_count = 0 THEN
    SET p_errcode = 1101;
    SET p_errmsg = '用户名或密码错误';
    ROLLBACK;
    LEAVE main_block;
  END IF;

  -- 4. 查询用户信息
  IF v_is_phone_number THEN
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

  -- 5. 检查密码是否正确
  IF p_password_hash != v_db_password_hash THEN
    SET p_errcode = 1101;
    SET p_errmsg = '用户名或密码错误';
    ROLLBACK;
    LEAVE main_block;
  END IF;

  -- 6. 检查用户类型匹配（如果指定）
  IF v_expected_role IS NOT NULL AND LENGTH(v_expected_role) > 0 THEN
    IF UPPER(p_role) != v_expected_role THEN
      SET p_errcode = 1102;
      SET p_errmsg = '用户类型不匹配';
      ROLLBACK;
      LEAVE main_block;
    END IF;
  END IF;

  -- 7. 更新最后登录时间
  UPDATE `user` SET updated_at = NOW() WHERE id = p_user_id;

  -- 提交事务
  COMMIT;

END