package com.medicalunion.common.error;

import com.medicalunion.common.Result;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * 全局异常处理器，统一返回 Result
 */
@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ResponseBody
    public Result<?> handleValidationException(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .findFirst().orElse(ex.getMessage());
        log.warn("参数校验失败: {}", message);
        return Result.error(400, "参数校验失败: " + message);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ResponseBody
    public Result<?> handleIllegalArgument(IllegalArgumentException ex) {
        log.warn("非法参数: {}", ex.getMessage());
        return Result.error(400, ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    @ResponseBody
    public Result<?> handleGenericException(Exception ex) {
        log.error("系统异常: {}", ex.getMessage(), ex);
        return Result.error(500, "系统内部错误: " + ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ResponseBody
    public Result<?> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        String paramName = ex.getName();
        String message = String.format("参数类型不匹配: %s 应为 %s", paramName, ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "");
        log.warn("参数类型错误: {} - value='{}'", paramName, ex.getValue());
        return Result.error(400, message + "; 具体错误: " + ex.getMessage());
    }
}
