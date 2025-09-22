package com.medicalunion.referral.entity;

import com.medicalunion.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * 转诊实体类
 * Referral Entity - 转诊聚合根
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class Referral extends BaseEntity {
    
    /**
     * 患者ID
     */
    @NotNull(message = "患者ID不能为空")
    private Long patientId;
    
    /**
     * 转出医生ID
     */
    @NotNull(message = "转出医生ID不能为空")
    private Long fromDoctorId;
    
    /**
     * 转入医生ID
     */
    private Long toDoctorId;
    
    /**
     * 转出医院ID
     */
    @NotNull(message = "转出医院ID不能为空")
    private Long fromHospitalId;
    
    /**
     * 转入医院ID
     */
    @NotNull(message = "转入医院ID不能为空")
    private Long toHospitalId;
    
    /**
     * 转诊原因
     */
    @NotBlank(message = "转诊原因不能为空")
    private String referralReason;
    
    /**
     * 转诊类型：上转/下转/平转
     */
    private String referralType;
    
    /**
     * 优先级：普通/急诊/特急
     */
    private String priority;
    
    /**
     * 转诊状态：待审批/已审批/已接收/已完成/已拒绝/已取消
     */
    private String status;
    
    /**
     * 转诊申请时间
     */
    @NotNull(message = "转诊申请时间不能为空")
    private LocalDateTime referralDate;
    
    /**
     * 期望转诊时间
     */
    private LocalDateTime expectedDate;
    
    /**
     * 审批时间
     */
    private LocalDateTime approvalDate;
    
    /**
     * 完成时间
     */
    private LocalDateTime completionDate;
    
    /**
     * 备注信息
     */
    private String notes;
    
    /**
     * 患者姓名（关联查询时使用）
     */
    private String patientName;
    
    /**
     * 转出医生姓名（关联查询时使用）
     */
    private String fromDoctorName;
    
    /**
     * 转入医生姓名（关联查询时使用）
     */
    private String toDoctorName;
    
    /**
     * 转出医院名称（关联查询时使用）
     */
    private String fromHospitalName;
    
    /**
     * 转入医院名称（关联查询时使用）
     */
    private String toHospitalName;
}