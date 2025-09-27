package com.medicalunion.auth.controller;

import com.medicalunion.auth.dto.AuthRequests;
import com.medicalunion.auth.dto.AuthResponses;
import com.medicalunion.auth.service.impl.AuthServiceImpl;
import com.medicalunion.auth.web.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @Autowired
    private AuthServiceImpl authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@RequestBody AuthRequests.RegisterRequest req) {
        AuthResponses.RegisterResponse res = authService.register(req);
        return ResponseEntity.status(201).body(ApiResponse.success("用户注册成功", res));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@RequestBody AuthRequests.LoginRequest req) {
        System.out.println("Login in login: " + req);
        AuthResponses.LoginResponse res = authService.login(req);
        System.out.println(res);
        return ResponseEntity.ok(ApiResponse.success("登录成功", res));
    }

    @GetMapping("/user/info")
    public ResponseEntity<ApiResponse> getUserInfo(HttpServletRequest request) {
        // 从请求属性中获取用户信息（由JWT拦截器设置）
        Integer userId = (Integer) request.getAttribute("userId");
        
        AuthResponses.UserInfoResponse res = authService.getUserInfo(userId);
        return ResponseEntity.ok(ApiResponse.success("获取用户信息成功", res));
    }
}
