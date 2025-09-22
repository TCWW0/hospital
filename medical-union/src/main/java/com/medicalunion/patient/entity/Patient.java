package com.medicalunion.patient.entity;

import com.medicalunion.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;
import java.time.LocalDate;

/**
 * 患者实体类
 * Patient Entity - 患者聚合根
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class Patient extends BaseEntity {
    
    /**
     * 患者姓名
     */
    @NotBlank(message = "患者姓名不能为空")
    private String name;
    
    /**
     * 身份证号
     */
    @Pattern(regexp = "^[1-9]\\d{5}(18|19|20)\\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx]$", 
             message = "身份证号格式不正确")
    private String idCard;
    
    /**
     * 性别：男/女/未知
     */
    private String gender;
    
    /**
     * 出生日期
     */
    private LocalDate birthDate;
    
    /**
     * 联系电话
     */
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String phone;
    
    /**
     * 联系地址
     */
    private String address;
    
    /**
     * 医保卡号
     */
    private String medicalCardNo;

    /**
     * 所属医院 ID
     */
    private Long hospitalId;

    /**
     * 所属科室 ID
     */
    private Long departmentId;
    
    /**
     * 紧急联系人
     */
    private String emergencyContact;
    
    /**
     * 紧急联系人电话
     */
    private String emergencyPhone;
    
    /**
     * 病情严重度：轻症/中症/重症/危重症
     */
    private String severityLevel;
}