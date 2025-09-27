package com.medicalunion.auth.service.impl;

import com.medicalunion.auth.dto.AuthRequests;
import com.medicalunion.auth.dto.AuthResponses;
import com.medicalunion.auth.mapper.UserAuthMapper;
import com.medicalunion.auth.model.User;
import com.medicalunion.auth.exception.BizException;
import com.medicalunion.auth.exception.ErrorCode;
import com.medicalunion.auth.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthServiceImpl {

    @Autowired
    private UserAuthMapper userAuthMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    // 注册（调用存储过程）
    public AuthResponses.RegisterResponse register(AuthRequests.RegisterRequest req) {
        Map<String, Object> params = new HashMap<>();
        params.put("username", req.getUsername());
        // 使用 BCrypt 进行哈希；存储过程期望接收 password_hash
        String passwordHash = passwordEncoder.encode(req.getPassword());
        params.put("passwordHash", passwordHash);
        params.put("role", req.getRole() == null ? "PATIENT" : req.getRole().toUpperCase());
        params.put("phone", req.getPhone());

        // 预留输出参数
        params.put("userId", null);
        params.put("errcode", null);
        params.put("errmsg", null);

        userAuthMapper.callUserRegister(params);

        Integer errcode = (Integer) params.get("errcode");
        String errmsg = (String) params.get("errmsg");
        Integer userId = (Integer) params.get("userId");

        if (errcode == null) throw new BizException(ErrorCode.DB_ERROR, "No errcode returned");
        if (errcode != 0) {
            // 根据错误码找到对应的ErrorCode，如果没找到就用通用错误码
            ErrorCode errorCode = null;
            for (ErrorCode e : ErrorCode.values()) {
                if (e.code() == errcode) {
                    errorCode = e;
                    break;
                }
            }
            throw new BizException(errorCode != null ? errorCode : ErrorCode.DB_ERROR, errmsg);
        }

        return new AuthResponses.RegisterResponse(userId);
    }

    // 登录（先查用户再验证密码）
    public AuthResponses.LoginResponse login(AuthRequests.LoginRequest req) {
        // 使用数据库存储过程进行登录认证，存储过程负责验证密码并返回用户信息
        Map<String, Object> params = new HashMap<>();
        String loginName = req.getPhone();
        params.put("loginName", loginName);
        // 先从数据库读取存储的 hash 并用 PasswordEncoder.matches 验证明文
        String storedHash = null;
        if (req.getUserType() != null && "DOCTOR".equalsIgnoreCase(req.getUserType())) {
            storedHash = userAuthMapper.selectDoctorPasswordByCode(loginName);
        } else {
            // 对于普通用户，按手机号或用户名查找（复用已有 mapper）
            if (loginName != null && loginName.length() == 11 && loginName.matches("^1[0-9]{10}$")) {
                User u = userAuthMapper.selectUserByPhone(loginName);
                if (u != null) storedHash = u.getPasswordHash();
            } else {
                User u = userAuthMapper.selectUserByUsername(loginName);
                if (u != null) storedHash = u.getPasswordHash();
            }
        }

        if (storedHash == null) {
            // 直接调用存储过程也会返回用户名或密码错误，但提前返回能减少 DB 调用复杂性
            throw new BizException(ErrorCode.INVALID_CREDENTIALS, "用户名或密码错误");
        }

        if (!passwordEncoder.matches(req.getPassword(), storedHash)) {
            throw new BizException(ErrorCode.INVALID_CREDENTIALS, "用户名或密码错误");
        }

    // 验证通过后，调用不再比较密码的存储过程以获取用户信息并更新登录时间
    params.put("userType", req.getUserType() == null ? null : req.getUserType().toUpperCase());

        // 输出参数预设
        params.put("userId", null);
        params.put("username", null);
        params.put("role", null);
        params.put("phone", null);
        params.put("profileJson", null);
        params.put("lastLoginAt", null);
        params.put("errcode", null);
        params.put("errmsg", null);

        userAuthMapper.callUserLoginSimple(params);

        Integer errcode = (Integer) params.get("errcode");
        String errmsg = (String) params.get("errmsg");
        Integer userId = (Integer) params.get("userId");
        String username = (String) params.get("username");
        String role = (String) params.get("role");
        String profileJson = (String) params.get("profileJson");

        if (errcode == null) throw new BizException(ErrorCode.DB_ERROR, "No errcode returned from login SP");
        if (errcode != 0) {
            ErrorCode errorCode = null;
            for (ErrorCode e : ErrorCode.values()) {
                if (e.code() == errcode) {
                    errorCode = e;
                    break;
                }
            }
            throw new BizException(errorCode != null ? errorCode : ErrorCode.DB_ERROR, errmsg);
        }

        if (userId == null) {
            throw new BizException(ErrorCode.INVALID_CREDENTIALS, "登录失败：未返回用户信息");
        }

        // 生成 JWT
        String token = jwtUtil.generateToken(userId, username, role);

        AuthResponses.LoginResponse res = new AuthResponses.LoginResponse();
        res.setUserId(userId);
        res.setUsername(username);
        res.setRole(role);
        res.setProfileJson(profileJson);
        res.setToken(token);
        return res;
    }

    // 获取用户信息（调用存储过程）
    public AuthResponses.UserInfoResponse getUserInfo(Integer userId) {
        Map<String, Object> params = new HashMap<>();
        params.put("userId", userId);
        
        // 输出参数
        params.put("username", null);
        params.put("role", null);
        params.put("phone", null);
        params.put("idNumber", null);
        params.put("profileJson", null);
        params.put("createdAt", null);
        params.put("updatedAt", null);
        params.put("errcode", null);
        params.put("errmsg", null);

        userAuthMapper.callUserGetInfo(params);

        Integer errcode = (Integer) params.get("errcode");
        String errmsg = (String) params.get("errmsg");
        String username = (String) params.get("username");
        String role = (String) params.get("role");
        String profileJson = (String) params.get("profileJson");

        if (errcode == null) throw new BizException(ErrorCode.DB_ERROR, "No errcode returned");
        if (errcode != 0) {
            ErrorCode errorCode = null;
            for (ErrorCode e : ErrorCode.values()) {
                if (e.code() == errcode) {
                    errorCode = e;
                    break;
                }
            }
            throw new BizException(errorCode != null ? errorCode : ErrorCode.DB_ERROR, errmsg);
        }
        
        AuthResponses.UserInfoResponse res = new AuthResponses.UserInfoResponse();
        res.setUserId(userId);
        res.setUsername(username);
        res.setRole(role);
        res.setProfileJson(profileJson);
        return res;
    }
}
