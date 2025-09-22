package com.medicalunion.auth.entity;

import com.medicalunion.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * 用户实体类
 * User Entity - 支持多种用户类型登录
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class User extends BaseEntity {
    
    /**
     * 用户名
     */
    @NotBlank(message = "用户名不能为空")
    private String username;
    
    /**
     * 密码(加密后)
     */
    @NotBlank(message = "密码不能为空")
    private String password;
    
    /**
     * 用户类型：DOCTOR(医生)、PATIENT(患者)、ADMIN(管理员)
     */
    @NotNull(message = "用户类型不能为空")
    private UserType userType;
    
    /**
     * 关联ID(医生ID或患者ID)
     */
    @NotNull(message = "关联ID不能为空")
    private Long refId;
    
    /**
     * 用户状态：ACTIVE(激活)、INACTIVE(未激活)、LOCKED(锁定)
     */
    private UserStatus status;
    
    /**
     * 最后登录时间
     */
    private LocalDateTime lastLoginTime;
    
    /**
     * 登录次数
     */
    private Integer loginCount;
    
    /**
     * 用户类型枚举
     */
    public enum UserType {
        DOCTOR,   // 医生
        PATIENT,  // 患者
        ADMIN     // 管理员
    }
    
    /**
     * 用户状态枚举
     */
    public enum UserStatus {
        ACTIVE,   // 激活
        INACTIVE, // 未激活
        LOCKED    // 锁定
    }
}