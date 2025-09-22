package com.medicalunion.common;

import lombok.Data;

/**
 * 统一返回结果类
 * 
 * @param <T> 返回数据类型
 */
@Data
public class Result<T> {
    
    /**
     * 状态码
     */
    private Integer code;
    
    /**
     * 消息
     */
    private String message;
    
    /**
     * 返回数据
     */
    private T data;
    
    /**
     * 成功状态码
     */
    public static final Integer SUCCESS_CODE = 200;
    
    /**
     * 失败状态码
     */
    public static final Integer ERROR_CODE = 500;
    
    public Result() {}
    
    public Result(Integer code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }
    
    /**
     * 成功返回
     */
    public static <T> Result<T> success(T data) {
        return new Result<>(SUCCESS_CODE, "操作成功", data);
    }
    
    /**
     * 成功返回（无数据）
     */
    public static <T> Result<T> success() {
        return new Result<>(SUCCESS_CODE, "操作成功", null);
    }
    
    /**
     * 成功返回（自定义消息）
     */
    public static <T> Result<T> success(String message, T data) {
        return new Result<>(SUCCESS_CODE, message, data);
    }
    
    /**
     * 失败返回
     */
    public static <T> Result<T> error(String message) {
        return new Result<>(ERROR_CODE, message, null);
    }
    
    /**
     * 失败返回（自定义状态码）
     */
    public static <T> Result<T> error(Integer code, String message) {
        return new Result<>(code, message, null);
    }
}