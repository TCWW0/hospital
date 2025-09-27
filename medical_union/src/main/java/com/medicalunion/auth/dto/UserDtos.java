package com.medicalunion.auth.dto;

import lombok.Data;

public class UserDtos {
    @Data
    public static class UpdateProfileRequest {
        private String name;       // 姓名（映射到 username 或后续 real_name）
        private String idNumber;   // 证件号（映射到 id_number）
        private String phone;      // 联系电话（映射到 phone）
    }

    @Data
    public static class ChangePasswordRequest {
        private String oldPassword;
        private String newPassword;
    }
}
