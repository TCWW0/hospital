package com.medicalunion.hospital.entity;

import com.medicalunion.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.validation.constraints.NotBlank;

/**
 * 医院实体类
 * Hospital Entity - 医疗机构聚合根
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class Hospital extends BaseEntity {
    
    /**
     * 医院名称
     */
    @NotBlank(message = "医院名称不能为空")
    private String name;
    
    /**
     * 医院地址
     */
    private String address;
    
    /**
     * 联系电话
     */
    private String phone;
    
    /**
     * 医院等级：三甲/三乙/二甲/二乙/一甲/一乙/社区卫生中心
     */
    private String hospitalLevel;
    
    /**
     * 医院类型：综合医院/专科医院/中医医院/社区卫生中心/诊所
     */
    private String hospitalType;
}