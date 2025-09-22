package com.medicalunion.statistics.dto;

import lombok.Data;

import java.util.List;

/**
 * 患者个人中心数据DTO
 * Patient Dashboard Data Transfer Object
 */
@Data
public class PatientDashboardDTO {
    
    /**
     * 患者基本信息
     */
    private PatientInfo patientInfo;
    
    /**
     * 就诊历史统计
     */
    private VisitHistory visitHistory;
    
    /**
     * 转诊记录
     */
    private ReferralHistory referralHistory;
    
    /**
     * 健康提醒
     */
    private List<HealthReminder> healthReminders;
    
    @Data
    public static class PatientInfo {
        private Long patientId;
        private String name;
        private String gender;
        private String birthDate;
        private String phone;
        private String severityLevel;
        private String medicalCardNo;
    }
    
    @Data
    public static class VisitHistory {
        private Long totalVisits;
        private Long visitsThisYear;
        private String lastVisitDate;
        private String lastDiagnosis;
        private String lastHospitalName;
    }
    
    @Data
    public static class ReferralHistory {
        private Long totalReferrals;
        private Long pendingReferrals;
        private String lastReferralDate;
        private String lastReferralStatus;
    }
    
    @Data
    public static class HealthReminder {
        private String type; // 提醒类型：复诊、用药、检查等
        private String message;
        private String date;
        private String priority; // 优先级：高、中、低
    }
}