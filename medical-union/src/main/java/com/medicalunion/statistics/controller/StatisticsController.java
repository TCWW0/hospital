package com.medicalunion.statistics.controller;

import com.medicalunion.common.Result;
import com.medicalunion.statistics.dto.DoctorDashboardDTO;
import com.medicalunion.statistics.dto.PatientDashboardDTO;
import com.medicalunion.statistics.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.constraints.NotNull;

/**
 * 统计控制器
 * Statistics Controller - 提供数据统计和分析功能
 */
@Slf4j
@RestController
@RequestMapping("/statistics")
@RequiredArgsConstructor
@Validated
public class StatisticsController {
    
    private final StatisticsService statisticsService;
    
    /**
     * 获取医生工作台数据
     * GET /api/statistics/doctor/dashboard/{doctorId}
     */
    @GetMapping("/doctor/dashboard/{doctorId}")
    public Result<DoctorDashboardDTO> getDoctorDashboard(@PathVariable @NotNull Long doctorId) {
        try {
            DoctorDashboardDTO dashboard = statisticsService.getDoctorDashboard(doctorId);
            return Result.success("获取医生工作台数据成功", dashboard);
        } catch (Exception e) {
            log.error("获取医生工作台数据失败, doctorId: {}", doctorId, e);
            return Result.error("获取工作台数据失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取患者个人中心数据
     * GET /api/statistics/patient/dashboard/{patientId}
     */
    @GetMapping("/patient/dashboard/{patientId}")
    public Result<PatientDashboardDTO> getPatientDashboard(@PathVariable @NotNull Long patientId) {
        try {
            PatientDashboardDTO dashboard = statisticsService.getPatientDashboard(patientId);
            return Result.success("获取患者个人中心数据成功", dashboard);
        } catch (IllegalArgumentException e) {
            log.warn("获取患者个人中心数据失败: {}", e.getMessage());
            return Result.error(404, e.getMessage());
        } catch (Exception e) {
            log.error("获取患者个人中心数据失败, patientId: {}", patientId, e);
            return Result.error("获取个人中心数据失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取患者病情严重度分布统计
     * GET /api/statistics/patients/severity-distribution
     */
    @GetMapping("/patients/severity-distribution")
    public Result<Object> getPatientSeverityDistribution() {
        try {
            // TODO: 实现基于SQL的统计查询
            // 这里提供一个模拟的返回值
            java.util.Map<String, Object> distribution = new java.util.HashMap<>();
            distribution.put("轻症", 120);
            distribution.put("中症", 80);
            distribution.put("重症", 45);
            distribution.put("危重症", 15);
            distribution.put("total", 260);
            
            return Result.success("获取患者病情分布成功", distribution);
        } catch (Exception e) {
            log.error("获取患者病情分布失败", e);
            return Result.error("获取患者病情分布失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取转诊状态统计
     * GET /api/statistics/referrals/status-distribution
     */
    @GetMapping("/referrals/status-distribution")
    public Result<Object> getReferralStatusDistribution() {
        try {
            // TODO: 实现基于SQL的统计查询
            java.util.Map<String, Object> distribution = new java.util.HashMap<>();
            distribution.put("待审批", 25);
            distribution.put("已审批", 40);
            distribution.put("已接收", 30);
            distribution.put("已完成", 85);
            distribution.put("已拒绝", 8);
            distribution.put("已取消", 5);
            distribution.put("total", 193);
            
            return Result.success("获取转诊状态分布成功", distribution);
        } catch (Exception e) {
            log.error("获取转诊状态分布失败", e);
            return Result.error("获取转诊状态分布失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取医院患者统计
     * GET /api/statistics/hospitals/{hospitalId}/patients
     */
    @GetMapping("/hospitals/{hospitalId}/patients")
    public Result<Object> getHospitalPatientStatistics(@PathVariable @NotNull Long hospitalId) {
        try {
            // TODO: 实现基于医院的患者统计
            java.util.Map<String, Object> statistics = new java.util.HashMap<>();
            statistics.put("hospitalId", hospitalId);
            statistics.put("totalPatients", 180);
            statistics.put("newPatientsThisMonth", 25);
            statistics.put("activePatientsThisWeek", 65);
            statistics.put("severityDistribution", java.util.Map.of(
                "轻症", 90,
                "中症", 60,
                "重症", 25,
                "危重症", 5
            ));
            
            return Result.success("获取医院患者统计成功", statistics);
        } catch (Exception e) {
            log.error("获取医院患者统计失败, hospitalId: {}", hospitalId, e);
            return Result.error("获取医院患者统计失败: " + e.getMessage());
        }
    }
}