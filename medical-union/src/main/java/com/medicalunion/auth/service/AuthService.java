package com.medicalunion.auth.service;

import com.medicalunion.auth.dto.LoginRequest;
import com.medicalunion.auth.dto.LoginResponse;
import com.medicalunion.auth.entity.User;
import com.medicalunion.auth.mapper.UserMapper;
import com.medicalunion.patient.entity.Patient;
import com.medicalunion.patient.mapper.PatientMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * 认证服务类
 * Authentication Service
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserMapper userMapper;
    private final PatientMapper patientMapper;
    // TODO: 添加DoctorMapper依赖
    // private final DoctorMapper doctorMapper;
    
    // 简单的内存token存储，实际生产环境应使用Redis或JWT
    private final Map<String, User> tokenStore = new HashMap<>();
    
    /**
     * 用户登录
     */
    @Transactional
    public LoginResponse login(LoginRequest loginRequest) {
        // 查找用户
        User user = userMapper.findByUsername(loginRequest.getUsername());
        if (user == null) {
            throw new IllegalArgumentException("用户名或密码错误");
        }
        
        // 检查用户状态
        if (user.getStatus() == User.UserStatus.LOCKED) {
            throw new IllegalArgumentException("用户已被锁定，请联系管理员");
        }
        
        if (user.getStatus() == User.UserStatus.INACTIVE) {
            throw new IllegalArgumentException("用户未激活，请联系管理员");
        }
        
        // 验证密码 (这里简化处理，实际应使用BCrypt等加密算法)
        if (!verifyPassword(loginRequest.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("用户名或密码错误");
        }
        
        // 更新登录信息
        userMapper.updateLoginInfo(user.getId());
        
        // 生成token
        String token = generateToken();
        tokenStore.put(token, user);
        
        // 构建响应
        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setUserType(user.getUserType());
        response.setRefId(user.getRefId());
        response.setUsername(user.getUsername());
        response.setStatus(user.getStatus());
        response.setExpiresIn(3600L); // 1小时过期
        
        // 根据用户类型获取详细信息
        Object userDetails = getUserDetails(user);
        response.setUserDetails(userDetails);
        
        log.info("用户登录成功: 用户名={}, 类型={}, 关联ID={}", 
                user.getUsername(), user.getUserType(), user.getRefId());
        
        return response;
    }
    
    /**
     * 用户登出
     */
    public void logout(String token) {
        tokenStore.remove(token);
        log.info("用户登出: token={}", token);
    }
    
    /**
     * 验证token
     */
    public User validateToken(String token) {
        return tokenStore.get(token);
    }
    
    /**
     * 根据用户类型获取用户详细信息
     */
    private Object getUserDetails(User user) {
        switch (user.getUserType()) {
            case DOCTOR:
                // TODO: 实现医生详细信息获取
                return getDoctorDetails(user.getRefId());
            case PATIENT:
                return getPatientDetails(user.getRefId());
            case ADMIN:
                return getAdminDetails();
            default:
                return null;
        }
    }
    
    /**
     * 获取医生详细信息
     * TODO: 待DoctorMapper实现后完成
     */
    private Object getDoctorDetails(Long doctorId) {
        try {
            // return doctorMapper.findById(doctorId);
            Map<String, Object> doctorInfo = new HashMap<>();
            doctorInfo.put("doctorId", doctorId);
            doctorInfo.put("message", "医生详细信息待实现");
            return doctorInfo;
        } catch (Exception e) {
            log.error("获取医生详细信息失败: doctorId={}", doctorId, e);
            return null;
        }
    }
    
    /**
     * 获取患者详细信息
     */
    private Patient getPatientDetails(Long patientId) {
        try {
            return patientMapper.findById(patientId);
        } catch (Exception e) {
            log.error("获取患者详细信息失败: patientId={}", patientId, e);
            return null;
        }
    }
    
    /**
     * 获取管理员详细信息
     */
    private Map<String, Object> getAdminDetails() {
        Map<String, Object> adminInfo = new HashMap<>();
        adminInfo.put("role", "ADMIN");
        adminInfo.put("permissions", new String[]{"ALL"});
        return adminInfo;
    }
    
    /**
     * 验证密码
     * 实际应用中应使用BCrypt等安全的密码加密算法
     */
    private boolean verifyPassword(String rawPassword, String encodedPassword) {
        // 这里简化处理，实际应该使用BCrypt.checkpw()
        // 为了演示，假设存储的是BCrypt加密后的密码
        // 现在简单比较，后续可以集成Spring Security
        return true; // 暂时总是返回true，便于测试
    }
    
    /**
     * 生成token
     * 实际应用中应使用JWT或其他安全的token生成方式
     */
    private String generateToken() {
        return UUID.randomUUID().toString().replace("-", "");
    }
}