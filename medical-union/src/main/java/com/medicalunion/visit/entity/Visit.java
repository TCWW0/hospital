package com.medicalunion.visit.entity;

import com.medicalunion.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * 就诊记录实体类
 * Visit Entity
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class Visit extends BaseEntity {
    
    /**
     * 患者ID
     */
    @NotNull(message = "患者ID不能为空")
    private Long patientId;
    
    /**
     * 医生ID
     */
    @NotNull(message = "医生ID不能为空")
    private Long doctorId;
    
    /**
     * 医院ID
     */
    @NotNull(message = "医院ID不能为空")
    private Long hospitalId;
    
    /**
     * 就诊时间
     */
    @NotNull(message = "就诊时间不能为空")
    private LocalDateTime visitDate;
    
    /**
     * 主诉
     */
    private String chiefComplaint;
    
    /**
     * 诊断
     */
    private String diagnosis;
    
    /**
     * 治疗建议
     */
    private String treatmentAdvice;
    
    /**
     * 处方
     */
    private String prescription;
    
    /**
     * 就诊类型：门诊/急诊/住院/复诊
     */
    private String visitType;
    
    /**
     * 就诊状态：就诊中/已完成/已取消
     */
    private String status;
    
    /**
     * 患者姓名（关联查询时使用）
     */
    private String patientName;
    
    /**
     * 医生姓名（关联查询时使用）
     */
    private String doctorName;
    
    /**
     * 医院名称（关联查询时使用）
     */
    private String hospitalName;
}