package com.medicalunion.auth.dto;

import com.medicalunion.auth.entity.User;
import lombok.Data;

/**
 * 登录响应DTO
 * Login Response Data Transfer Object
 */
@Data
public class LoginResponse {
    
    /**
     * 访问令牌
     */
    private String token;
    
    /**
     * 用户类型
     */
    private User.UserType userType;
    
    /**
     * 关联ID
     */
    private Long refId;
    
    /**
     * 用户名
     */
    private String username;
    
    /**
     * 用户状态
     */
    private User.UserStatus status;
    
    /**
     * 用户详细信息（根据用户类型动态填充）
     */
    private Object userDetails;
    
    /**
     * 令牌过期时间(秒)
     */
    private Long expiresIn;
}