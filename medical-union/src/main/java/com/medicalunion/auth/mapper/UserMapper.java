package com.medicalunion.auth.mapper;

import com.medicalunion.auth.entity.User;
import org.apache.ibatis.annotations.*;

/**
 * 用户数据访问接口
 * User Mapper Interface
 */
@Mapper
public interface UserMapper {
    
    /**
     * 根据用户名查询用户
     */
    @Select("SELECT id, username, password, user_type, ref_id, status, last_login_time, login_count, created_at, updated_at FROM users WHERE username = #{username}")
    User findByUsername(@Param("username") String username);
    
    /**
     * 根据用户类型和关联ID查询用户
     */
    @Select("SELECT id, username, password, user_type, ref_id, status, last_login_time, login_count, created_at, updated_at FROM users WHERE user_type = #{userType} AND ref_id = #{refId}")
    User findByUserTypeAndRefId(@Param("userType") String userType, @Param("refId") Long refId);
    
    /**
     * 更新最后登录时间和登录次数
     */
    @Update("UPDATE users SET last_login_time = NOW(), login_count = login_count + 1 WHERE id = #{id}")
    int updateLoginInfo(@Param("id") Long id);
    
    /**
     * 更新用户状态
     */
    @Update("UPDATE users SET status = #{status}, updated_at = NOW() WHERE id = #{id}")
    int updateStatus(@Param("id") Long id, @Param("status") String status);
    
    /**
     * 插入用户
     */
    @Insert("INSERT INTO users (username, password, user_type, ref_id, status) VALUES (#{username}, #{password}, #{userType}, #{refId}, #{status})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(User user);
    
    /**
     * 根据ID查询用户
     */
    @Select("SELECT id, username, password, user_type, ref_id, status, last_login_time, login_count, created_at, updated_at FROM users WHERE id = #{id}")
    User findById(@Param("id") Long id);
}