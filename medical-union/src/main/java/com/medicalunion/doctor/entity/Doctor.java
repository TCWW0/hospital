package com.medicalunion.doctor.entity;

import com.medicalunion.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

/**
 * 医生实体类
 * Doctor Entity
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class Doctor extends BaseEntity {
    
    /**
     * 医生姓名
     */
    @NotBlank(message = "医生姓名不能为空")
    private String name;
    
    /**
     * 工号
     */
    private String employeeId;
    
    /**
     * 联系电话
     */
    private String phone;
    
    /**
     * 职称：主任医师/副主任医师/主治医师/住院医师/实习医师
     */
    private String title;
    
    /**
     * 所属科室ID
     */
    @NotNull(message = "所属科室不能为空")
    private Long departmentId;
    
    /**
     * 专长领域
     */
    private String specialties;
    
    /**
     * 科室名称（关联查询时使用）
     */
    private String departmentName;
    
    /**
     * 医院名称（关联查询时使用）
     */
    private String hospitalName;
}