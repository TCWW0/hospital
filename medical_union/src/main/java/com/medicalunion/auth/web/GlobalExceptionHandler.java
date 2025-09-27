package com.medicalunion.auth.web;

import com.medicalunion.auth.exception.BizException;
import com.medicalunion.auth.exception.ErrorCode;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BizException.class)
    public ResponseEntity<ApiResponse> handleBiz(BizException ex) {
        ErrorCode code = ex.getErrorCode();
        int httpStatus = switch (code) {
            case USERNAME_ALREADY_EXISTS, WEAK_PASSWORD, INVALID_INPUT -> HttpStatus.BAD_REQUEST.value();
            case INVALID_CREDENTIALS, USER_NOT_FOUND -> HttpStatus.UNAUTHORIZED.value();
            default -> HttpStatus.INTERNAL_SERVER_ERROR.value();
        };
        ApiResponse r = new ApiResponse(code.code(), ex.getMessage(), null);
        return ResponseEntity.status(httpStatus).body(r);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse> handleAll(Exception ex) {
        ApiResponse r = new ApiResponse(ErrorCode.DB_ERROR.code(), ex.getMessage(), null);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(r);
    }
}
