package com.medicalunion.hospital.entity;

import com.medicalunion.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

/**
 * 科室实体类
 * Department Entity
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class Department extends BaseEntity {
    
    /**
     * 科室名称
     */
    @NotBlank(message = "科室名称不能为空")
    private String name;
    
    /**
     * 所属医院ID
     */
    @NotNull(message = "所属医院不能为空")
    private Long hospitalId;
    
    /**
     * 科室类型：内科/外科/妇科/儿科/眼科/耳鼻喉科/皮肤科/精神科/急诊科/其他
     */
    private String departmentType;
    
    /**
     * 科室描述
     */
    private String description;
    
    /**
     * 医院名称（关联查询时使用）
     */
    private String hospitalName;
}