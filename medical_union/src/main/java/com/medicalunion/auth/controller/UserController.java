package com.medicalunion.auth.controller;

import com.medicalunion.auth.dto.UserDtos;
import com.medicalunion.auth.dto.AuthResponses;
import com.medicalunion.auth.service.UserService;
import com.medicalunion.auth.util.JwtUtil;
import com.medicalunion.auth.web.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/user")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    private Integer getUserIdFromAuth(String authHeader) {
        String token = jwtUtil.extractTokenFromHeader(authHeader);
        return jwtUtil.getUserIdFromToken(token);
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse> me(@RequestHeader("Authorization") String authorization) {
        Integer userId = getUserIdFromAuth(authorization);
        AuthResponses.UserInfoResponse res = userService.me(userId);
        return ResponseEntity.ok(ApiResponse.success("OK", res));
    }

    @PatchMapping("/me")
    public ResponseEntity<ApiResponse> updateProfile(@RequestHeader("Authorization") String authorization,
                                                     @RequestBody UserDtos.UpdateProfileRequest req) {
        System.out.println("Profile in updateProfile: " + req);
        Integer userId = getUserIdFromAuth(authorization);
        userService.updateProfile(userId, req);
        return ResponseEntity.ok(ApiResponse.success("UPDATED", null));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse> changePassword(@RequestHeader("Authorization") String authorization,
                                                      @RequestBody UserDtos.ChangePasswordRequest req) {
        Integer userId = getUserIdFromAuth(authorization);
        userService.changePassword(userId, req);
        return ResponseEntity.ok(ApiResponse.success("PASSWORD_CHANGED", null));
    }
}
