package com.medicalunion.auth.interceptor;

import com.medicalunion.auth.util.JwtUtil;
import com.medicalunion.auth.exception.BizException;
import com.medicalunion.auth.exception.ErrorCode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthInterceptor implements HandlerInterceptor {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 跳过OPTIONS请求
        if ("OPTIONS".equals(request.getMethod())) {
            return true;
        }

        // 从请求头中获取token
        String authHeader = request.getHeader("Authorization");
        String token = jwtUtil.extractTokenFromHeader(authHeader);
        
        if (token == null) {
            throw new BizException(ErrorCode.UNAUTHORIZED, "缺少认证token");
        }

        // 验证token
        if (!jwtUtil.isTokenValid(token)) {
            throw new BizException(ErrorCode.UNAUTHORIZED, "Token无效或已过期");
        }

        // 将用户信息存储到请求属性中，供Controller使用
        try {
            Integer userId = jwtUtil.getUserIdFromToken(token);
            String role = jwtUtil.getRoleFromToken(token);
            
            request.setAttribute("userId", userId);
            request.setAttribute("userRole", role);
        } catch (Exception e) {
            throw new BizException(ErrorCode.UNAUTHORIZED, "Token解析失败");
        }

        return true;
    }
}