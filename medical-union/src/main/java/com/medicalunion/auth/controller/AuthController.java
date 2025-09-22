package com.medicalunion.auth.controller;

import com.medicalunion.auth.dto.LoginRequest;
import com.medicalunion.auth.dto.LoginResponse;
import com.medicalunion.auth.entity.User;
import com.medicalunion.auth.service.AuthService;
import com.medicalunion.common.Result;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

/**
 * 认证控制器
 * Authentication Controller - 提供用户登录登出等认证功能
 */
@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Validated
public class AuthController {
    
    private final AuthService authService;
    
    /**
     * 用户登录
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public Result<LoginResponse> login(@RequestBody @Valid LoginRequest loginRequest) {
        try {
            LoginResponse response = authService.login(loginRequest);
            return Result.success("登录成功", response);
        } catch (IllegalArgumentException e) {
            log.warn("登录失败: {}", e.getMessage());
            return Result.error(401, e.getMessage());
        } catch (Exception e) {
            log.error("登录异常", e);
            return Result.error("登录失败: " + e.getMessage());
        }
    }
    
    /**
     * 用户登出
     * POST /api/auth/logout
     */
    @PostMapping("/logout")
    public Result<String> logout(@RequestHeader("Authorization") String authorization) {
        try {
            // 提取token (假设格式为 "Bearer token")
            String token = extractToken(authorization);
            if (token != null) {
                authService.logout(token);
                return Result.success("登出成功");
            } else {
                return Result.error(400, "无效的Authorization header");
            }
        } catch (Exception e) {
            log.error("登出异常", e);
            return Result.error("登出失败: " + e.getMessage());
        }
    }
    
    /**
     * 验证token
     * GET /api/auth/validate
     */
    @GetMapping("/validate")
    public Result<User> validateToken(@RequestHeader("Authorization") String authorization) {
        try {
            String token = extractToken(authorization);
            if (token != null) {
                User user = authService.validateToken(token);
                if (user != null) {
                    // 不返回密码信息
                    user.setPassword(null);
                    return Result.success("token有效", user);
                } else {
                    return Result.error(401, "token无效或已过期");
                }
            } else {
                return Result.error(400, "无效的Authorization header");
            }
        } catch (Exception e) {
            log.error("验证token异常", e);
            return Result.error("验证token失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取当前用户信息
     * GET /api/auth/me
     */
    @GetMapping("/me")
    public Result<Object> getCurrentUser(@RequestHeader("Authorization") String authorization) {
        try {
            String token = extractToken(authorization);
            if (token != null) {
                User user = authService.validateToken(token);
                if (user != null) {
                    // 构建用户信息响应
                    LoginResponse userInfo = new LoginResponse();
                    userInfo.setUserType(user.getUserType());
                    userInfo.setRefId(user.getRefId());
                    userInfo.setUsername(user.getUsername());
                    userInfo.setStatus(user.getStatus());
                    
                    return Result.success("获取用户信息成功", userInfo);
                } else {
                    return Result.error(401, "token无效或已过期");
                }
            } else {
                return Result.error(400, "无效的Authorization header");
            }
        } catch (Exception e) {
            log.error("获取用户信息异常", e);
            return Result.error("获取用户信息失败: " + e.getMessage());
        }
    }
    
    /**
     * 从Authorization header中提取token
     */
    private String extractToken(String authorization) {
        if (authorization != null && authorization.startsWith("Bearer ")) {
            return authorization.substring(7);
        }
        return null;
    }
}