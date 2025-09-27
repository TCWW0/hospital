package com.medicalunion.auth.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class User {
    private Integer id;
    private String username;
    private String passwordHash;
    private String role;
    private String idNumber;
    private String phone;
    private String profileJson;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
