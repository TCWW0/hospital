package com.medicalunion.auth.exception;

public enum ErrorCode {
    SUCCESS(0, "OK"),
    USERNAME_ALREADY_EXISTS(1001, "Username already exists"),
    INVALID_CREDENTIALS(1002, "Invalid credentials"),
    INVALID_PASSWORD(1002, "Invalid password"),  // 使用相同的错误码
    USER_NOT_FOUND(1003, "User not found"),
    WEAK_PASSWORD(1004, "Weak password"),
    INVALID_INPUT(1005, "Invalid input"),
    UNAUTHORIZED(1006, "Unauthorized"),
    DB_ERROR(2001, "Database error");

    private final int code;
    private final String message;
    ErrorCode(int code, String message) { this.code = code; this.message = message; }
    public int code() { return code; }
    public String message() { return message; }

    public static ErrorCode fromCode(int code) {
        for (ErrorCode e : values()) if (e.code == code) return e;
        return DB_ERROR;
    }
}
