package com.medicalunion.patient.controller;

import com.medicalunion.common.Result;
import com.medicalunion.common.StoredProcedureResult;
import com.medicalunion.patient.entity.Patient;
import com.medicalunion.patient.service.PatientService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import com.medicalunion.patient.dto.UpdatePatientRequest;
import java.util.List;

/**
 * 患者控制器
 * Patient Controller - 提供患者管理的REST API
 */
@Slf4j
@RestController
@RequestMapping("/patients")
@RequiredArgsConstructor
@Validated
public class PatientController {
    
    private final PatientService patientService;
    
    /**
     * 查询所有患者
     * GET /api/patients
     */
    @GetMapping
    public Result<List<Patient>> getAllPatients() {
        try {
            List<Patient> patients = patientService.findAll();
            return Result.success("查询患者列表成功", patients);
        } catch (Exception e) {
            log.error("查询患者列表失败", e);
            return Result.error("查询患者列表失败: " + e.getMessage());
        }
    }
    
    /**
     * 根据ID查询患者
     * GET /api/patients/{id}
     */
    @GetMapping("/{id}")
    public Result<Patient> getPatientById(@PathVariable @NotNull Long id) {
        try {
            Patient patient = patientService.findById(id);
            if (patient != null) {
                return Result.success("查询患者信息成功", patient);
            } else {
                return Result.error(404, "患者不存在");
            }
        } catch (Exception e) {
            log.error("查询患者信息失败, ID: {}", id, e);
            return Result.error("查询患者信息失败: " + e.getMessage());
        }
    }
    
    /**
     * 根据身份证号查询患者
     * GET /api/patients/idcard/{idCard}
     */
    @GetMapping("/idcard/{idCard}")
    public Result<Patient> getPatientByIdCard(@PathVariable @NotBlank String idCard) {
        try {
            Patient patient = patientService.findByIdCard(idCard);
            if (patient != null) {
                return Result.success("根据身份证号查询患者成功", patient);
            } else {
                return Result.error(404, "未找到该身份证号对应的患者");
            }
        } catch (Exception e) {
            log.error("根据身份证号查询患者失败, 身份证号: {}", idCard, e);
            return Result.error("查询失败: " + e.getMessage());
        }
    }
    
    /**
     * 分页查询患者
     * GET /api/patients/page?pageNum=1&pageSize=10
     */
    @GetMapping("/page")
    public Result<List<Patient>> getPatientsByPage(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize) {
        try {
            if (pageNum < 1 || pageSize < 1) {
                return Result.error("页码和页面大小必须大于0");
            }
            
            List<Patient> patients = patientService.findByPage(pageNum, pageSize);
            return Result.success("分页查询患者成功", patients);
        } catch (Exception e) {
            log.error("分页查询患者失败", e);
            return Result.error("分页查询失败: " + e.getMessage());
        }
    }
    
    /**
     * 根据姓名模糊查询患者
     * GET /api/patients/search?name=张
     */
    @GetMapping("/search")
    public Result<List<Patient>> searchPatientsByName(@RequestParam @NotBlank String name) {
        try {
            List<Patient> patients = patientService.findByNameLike(name);
            return Result.success("根据姓名查询患者成功", patients);
        } catch (Exception e) {
            log.error("根据姓名查询患者失败, 姓名: {}", name, e);
            return Result.error("查询失败: " + e.getMessage());
        }
    }
    
    /**
     * 创建患者
     * POST /api/patients
     */
    @PostMapping
    public Result<Patient> createPatient(@RequestBody @Valid Patient patient) {
        try {
            Patient createdPatient = patientService.createPatient(patient);
            return Result.success("创建患者成功", createdPatient);
        } catch (IllegalArgumentException e) {
            log.warn("创建患者失败: {}", e.getMessage());
            return Result.error(400, e.getMessage());
        } catch (Exception e) {
            log.error("创建患者失败", e);
            return Result.error("创建患者失败: " + e.getMessage());
        }
    }
    
    /**
     * 更新患者信息（调用存储过程）
     * PUT /api/patients/{id}
     */
    @PutMapping("/{id}")
    public Result<String> updatePatient(
            @PathVariable @NotNull Long id,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) String address) {
        try {
            StoredProcedureResult result = patientService.updatePatient(id, name, phone, address);
            
            if (result.isSuccess()) {
                return Result.success(result.getResultMessage());
            } else {
                return Result.error(400, result.getResultMessage());
            }
        } catch (Exception e) {
            log.error("更新患者信息失败, ID: {}", id, e);
            return Result.error("更新患者信息失败: " + e.getMessage());
        }
    }

    /**
     * 更新患者（接受 JSON body，便于前端使用 PUT + JSON）
     */
    @PutMapping(value = "/{id}", consumes = "application/json")
    public Result<String> updatePatientJson(@PathVariable @NotNull Long id,
                                            @RequestBody @Valid UpdatePatientRequest body) {
        try {
            StoredProcedureResult result = patientService.updatePatient(id, body.getName(), body.getPhone(), body.getAddress());

            if (result.isSuccess()) {
                return Result.success(result.getResultMessage());
            } else {
                return Result.error(400, result.getResultMessage());
            }
        } catch (Exception e) {
            log.error("更新患者信息失败, ID: {}", id, e);
            return Result.error("更新患者信息失败: " + e.getMessage());
        }
    }
    
    /**
     * 删除患者（调用存储过程）
     * DELETE /api/patients/{id}
     */
    @DeleteMapping("/{id}")
    public Result<String> deletePatient(@PathVariable @NotNull Long id) {
        try {
            StoredProcedureResult result = patientService.deletePatient(id);
            
            if (result.isSuccess()) {
                return Result.success(result.getResultMessage());
            } else {
                return Result.error(400, result.getResultMessage());
            }
        } catch (Exception e) {
            log.error("删除患者失败, ID: {}", id, e);
            return Result.error("删除患者失败: " + e.getMessage());
        }
    }
    
    /**
     * 统计患者总数
     * GET /api/patients/count
     */
    @GetMapping("/count")
    public Result<Long> getPatientCount() {
        try {
            long count = patientService.count();
            return Result.success("查询患者总数成功", count);
        } catch (Exception e) {
            log.error("查询患者总数失败", e);
            return Result.error("查询患者总数失败: " + e.getMessage());
        }
    }
}