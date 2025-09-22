package com.medicalunion.patient.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;

@Data
public class UpdatePatientRequest {
    @NotBlank(message = "name 不能为空")
    private String name;

    private String phone;

    private String address;
}
