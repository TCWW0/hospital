package com.medicalunion.statistics.dto;

import lombok.Data;

import java.util.Map;

/**
 * 医生工作台数据DTO
 * Doctor Dashboard Data Transfer Object
 */
@Data
public class DoctorDashboardDTO {
    
    /**
     * 医生基本信息
     */
    private DoctorInfo doctorInfo;
    
    /**
     * 患者统计信息
     */
    private PatientStatistics patientStatistics;
    
    /**
     * 转诊统计信息
     */
    private ReferralStatistics referralStatistics;
    
    /**
     * 今日就诊统计
     */
    private TodayVisitStatistics todayVisitStatistics;
    
    @Data
    public static class DoctorInfo {
        private Long doctorId;
        private String name;
        private String title;
        private String departmentName;
        private String hospitalName;
        private String specialties;
    }
    
    @Data
    public static class PatientStatistics {
        private Long totalPatients;
        private Map<String, Long> severityDistribution; // 病情严重度分布
        private Long newPatientsThisMonth;
        private Long activePatientsThisWeek;
    }
    
    @Data
    public static class ReferralStatistics {
        private Long pendingReferrals; // 待处理转诊
        private Long outgoingReferrals; // 转出转诊
        private Long incomingReferrals; // 转入转诊
        private Long completedReferralsThisMonth; // 本月完成转诊
    }
    
    @Data
    public static class TodayVisitStatistics {
        private Long todayVisits; // 今日就诊数
        private Long scheduledVisits; // 预约就诊数
        private Long emergencyVisits; // 急诊数
    }
}