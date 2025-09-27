package com.medicalunion.auth.web;

public class ApiResponse {
    private boolean success;
    private int code;
    private String message;
    private Object data;

    public ApiResponse() {}
    public ApiResponse(int code, String message, Object data) { 
        this.success = (code == 0);
        this.code = code; 
        this.message = message; 
        this.data = data; 
    }
    
    public static ApiResponse success(String message, Object data) {
        return new ApiResponse(0, message, data);
    }
    
    public static ApiResponse error(int code, String message) {
        return new ApiResponse(code, message, null);
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public int getCode() { return code; }
    public void setCode(int code) { this.code = code; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Object getData() { return data; }
    public void setData(Object data) { this.data = data; }
}
