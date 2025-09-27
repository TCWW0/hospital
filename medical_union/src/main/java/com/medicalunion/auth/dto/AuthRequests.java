package com.medicalunion.auth.dto;

import lombok.Data;

public class AuthRequests {

    @Data
    public static class RegisterRequest {
        private String username;
        private String password;
        private String role;
        private String phone;
    }

    @Data
    public static class LoginRequest {
        private String phone;
        private String password;
        private String userType;
    }
}
