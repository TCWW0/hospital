package com.medicalunion.common;

import lombok.Data;

/**
 * 存储过程执行结果
 * Stored Procedure Result
 */
@Data
public class StoredProcedureResult {
    
    /**
     * 结果代码
     * 0: 成功
     * 负数: 失败（具体错误码由存储过程定义）
     */
    private Integer resultCode;
    
    /**
     * 结果消息
     */
    private String resultMessage;
    
    /**
     * 是否执行成功
     */
    public boolean isSuccess() {
        return resultCode != null && resultCode == 0;
    }
    
    /**
     * 创建成功结果
     */
    public static StoredProcedureResult success(String message) {
        StoredProcedureResult result = new StoredProcedureResult();
        result.setResultCode(0);
        result.setResultMessage(message);
        return result;
    }
    
    /**
     * 创建失败结果
     */
    public static StoredProcedureResult error(Integer code, String message) {
        StoredProcedureResult result = new StoredProcedureResult();
        result.setResultCode(code);
        result.setResultMessage(message);
        return result;
    }
}