package com.medicalunion.referral.controller;

import com.medicalunion.common.Result;
import com.medicalunion.common.StoredProcedureResult;
import com.medicalunion.referral.entity.Referral;
import com.medicalunion.referral.service.ReferralService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.List;

/**
 * 转诊控制器
 * Referral Controller - 提供转诊管理的REST API
 */
@Slf4j
@RestController
@RequestMapping("/referrals")
@RequiredArgsConstructor
@Validated
public class ReferralController {
    
    private final ReferralService referralService;
    
    /**
     * 查询所有转诊记录
     * GET /api/referrals
     */
    @GetMapping
    public Result<List<Referral>> getAllReferrals() {
        try {
            List<Referral> referrals = referralService.findAll();
            return Result.success("查询转诊记录列表成功", referrals);
        } catch (Exception e) {
            log.error("查询转诊记录列表失败", e);
            return Result.error("查询转诊记录列表失败: " + e.getMessage());
        }
    }
    
    /**
     * 根据ID查询转诊记录
     * GET /api/referrals/{id}
     */
    @GetMapping("/{id}")
    public Result<Referral> getReferralById(@PathVariable @NotNull Long id) {
        try {
            Referral referral = referralService.findById(id);
            if (referral != null) {
                return Result.success("查询转诊记录成功", referral);
            } else {
                return Result.error(404, "转诊记录不存在");
            }
        } catch (Exception e) {
            log.error("查询转诊记录失败, ID: {}", id, e);
            return Result.error("查询转诊记录失败: " + e.getMessage());
        }
    }
    
    /**
     * 根据患者ID查询转诊记录
     * GET /api/referrals/patient/{patientId}
     */
    @GetMapping("/patient/{patientId}")
    public Result<List<Referral>> getReferralsByPatientId(@PathVariable @NotNull Long patientId) {
        try {
            List<Referral> referrals = referralService.findByPatientId(patientId);
            return Result.success("根据患者ID查询转诊记录成功", referrals);
        } catch (Exception e) {
            log.error("根据患者ID查询转诊记录失败, 患者ID: {}", patientId, e);
            return Result.error("查询失败: " + e.getMessage());
        }
    }
    
    /**
     * 根据医生ID查询转诊记录（转出）
     * GET /api/referrals/from-doctor/{doctorId}
     */
    @GetMapping("/from-doctor/{doctorId}")
    public Result<List<Referral>> getReferralsByFromDoctorId(@PathVariable @NotNull Long doctorId) {
        try {
            List<Referral> referrals = referralService.findByFromDoctorId(doctorId);
            return Result.success("根据转出医生ID查询转诊记录成功", referrals);
        } catch (Exception e) {
            log.error("根据转出医生ID查询转诊记录失败, 医生ID: {}", doctorId, e);
            return Result.error("查询失败: " + e.getMessage());
        }
    }
    
    /**
     * 根据医生ID查询转诊记录（转入）
     * GET /api/referrals/to-doctor/{doctorId}
     */
    @GetMapping("/to-doctor/{doctorId}")
    public Result<List<Referral>> getReferralsByToDoctorId(@PathVariable @NotNull Long doctorId) {
        try {
            List<Referral> referrals = referralService.findByToDoctorId(doctorId);
            return Result.success("根据转入医生ID查询转诊记录成功", referrals);
        } catch (Exception e) {
            log.error("根据转入医生ID查询转诊记录失败, 医生ID: {}", doctorId, e);
            return Result.error("查询失败: " + e.getMessage());
        }
    }
    
    /**
     * 根据状态查询转诊记录
     * GET /api/referrals/status/{status}
     */
    @GetMapping("/status/{status}")
    public Result<List<Referral>> getReferralsByStatus(@PathVariable @NotBlank String status) {
        try {
            List<Referral> referrals = referralService.findByStatus(status);
            return Result.success("根据状态查询转诊记录成功", referrals);
        } catch (Exception e) {
            log.error("根据状态查询转诊记录失败, 状态: {}", status, e);
            return Result.error("查询失败: " + e.getMessage());
        }
    }
    
    /**
     * 根据医院ID查询转诊记录
     * GET /api/referrals/hospital/{hospitalId}
     */
    @GetMapping("/hospital/{hospitalId}")
    public Result<List<Referral>> getReferralsByHospitalId(@PathVariable @NotNull Long hospitalId) {
        try {
            List<Referral> referrals = referralService.findByHospitalId(hospitalId);
            return Result.success("根据医院ID查询转诊记录成功", referrals);
        } catch (Exception e) {
            log.error("根据医院ID查询转诊记录失败, 医院ID: {}", hospitalId, e);
            return Result.error("查询失败: " + e.getMessage());
        }
    }
    
    /**
     * 创建转诊申请
     * POST /api/referrals
     */
    @PostMapping
    public Result<Referral> createReferral(@RequestBody @Valid Referral referral) {
        try {
            Referral createdReferral = referralService.createReferral(referral);
            return Result.success("创建转诊申请成功", createdReferral);
        } catch (IllegalArgumentException e) {
            log.warn("创建转诊申请失败: {}", e.getMessage());
            return Result.error(400, e.getMessage());
        } catch (Exception e) {
            log.error("创建转诊申请失败", e);
            return Result.error("创建转诊申请失败: " + e.getMessage());
        }
    }
    
    /**
     * 审批转诊申请
     * PUT /api/referrals/{id}/approve
     */
    @PutMapping("/{id}/approve")
    public Result<String> approveReferral(
            @PathVariable @NotNull Long id,
            @RequestParam(required = false) Long toDoctorId,
            @RequestParam(required = false) String notes) {
        try {
            StoredProcedureResult result = referralService.approveReferral(id, toDoctorId, notes);
            
            if (result.isSuccess()) {
                return Result.success(result.getResultMessage());
            } else {
                return Result.error(400, result.getResultMessage());
            }
        } catch (Exception e) {
            log.error("审批转诊申请失败, ID: {}", id, e);
            return Result.error("审批转诊申请失败: " + e.getMessage());
        }
    }
    
    /**
     * 拒绝转诊申请
     * PUT /api/referrals/{id}/reject
     */
    @PutMapping("/{id}/reject")
    public Result<String> rejectReferral(
            @PathVariable @NotNull Long id,
            @RequestParam(required = false) String notes) {
        try {
            StoredProcedureResult result = referralService.rejectReferral(id, notes);
            
            if (result.isSuccess()) {
                return Result.success(result.getResultMessage());
            } else {
                return Result.error(400, result.getResultMessage());
            }
        } catch (Exception e) {
            log.error("拒绝转诊申请失败, ID: {}", id, e);
            return Result.error("拒绝转诊申请失败: " + e.getMessage());
        }
    }
    
    /**
     * 完成转诊
     * PUT /api/referrals/{id}/complete
     */
    @PutMapping("/{id}/complete")
    public Result<String> completeReferral(
            @PathVariable @NotNull Long id,
            @RequestParam(required = false) String notes) {
        try {
            StoredProcedureResult result = referralService.completeReferral(id, notes);
            
            if (result.isSuccess()) {
                return Result.success(result.getResultMessage());
            } else {
                return Result.error(400, result.getResultMessage());
            }
        } catch (Exception e) {
            log.error("完成转诊失败, ID: {}", id, e);
            return Result.error("完成转诊失败: " + e.getMessage());
        }
    }
    
    /**
     * 统计转诊记录总数
     * GET /api/referrals/count
     */
    @GetMapping("/count")
    public Result<Long> getReferralCount() {
        try {
            long count = referralService.count();
            return Result.success("查询转诊记录总数成功", count);
        } catch (Exception e) {
            log.error("查询转诊记录总数失败", e);
            return Result.error("查询转诊记录总数失败: " + e.getMessage());
        }
    }
    
    /**
     * 按状态统计转诊记录
     * GET /api/referrals/count/status/{status}
     */
    @GetMapping("/count/status/{status}")
    public Result<Long> getReferralCountByStatus(@PathVariable @NotBlank String status) {
        try {
            long count = referralService.countByStatus(status);
            return Result.success("按状态统计转诊记录成功", count);
        } catch (Exception e) {
            log.error("按状态统计转诊记录失败, 状态: {}", status, e);
            return Result.error("统计失败: " + e.getMessage());
        }
    }
}