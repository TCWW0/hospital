package com.medicalunion.auth.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

public class AuthResponses {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegisterResponse {
        private Integer userId;
    }

    @Data
    @NoArgsConstructor
    public static class LoginResponse {
        private Integer userId;
        private String username;
        private String role;
        private String profileJson;
        private String token;
    }

    @Data
    @NoArgsConstructor
    public static class UserInfoResponse {
        private Integer userId;
        private String username;
        private String role;
        private String idNumber;
        private String phone;
        private String profileJson;
    }
}
