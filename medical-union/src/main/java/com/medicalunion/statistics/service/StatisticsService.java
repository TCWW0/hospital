package com.medicalunion.statistics.service;

import com.medicalunion.patient.mapper.PatientMapper;
import com.medicalunion.referral.mapper.ReferralMapper;
import com.medicalunion.statistics.dto.DoctorDashboardDTO;
import com.medicalunion.statistics.dto.PatientDashboardDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 统计服务类
 * Statistics Service
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StatisticsService {
    
    private final PatientMapper patientMapper;
    private final ReferralMapper referralMapper;
    // TODO: 添加VisitMapper和DoctorMapper依赖
    
    /**
     * 获取医生工作台数据
     */
    public DoctorDashboardDTO getDoctorDashboard(Long doctorId) {
        try {
            DoctorDashboardDTO dashboard = new DoctorDashboardDTO();
            
            // 医生基本信息
            dashboard.setDoctorInfo(getDoctorInfo(doctorId));
            
            // 患者统计信息
            dashboard.setPatientStatistics(getPatientStatistics(doctorId));
            
            // 转诊统计信息
            dashboard.setReferralStatistics(getReferralStatistics(doctorId));
            
            // 今日就诊统计
            dashboard.setTodayVisitStatistics(getTodayVisitStatistics(doctorId));
            
            return dashboard;
        } catch (Exception e) {
            log.error("获取医生工作台数据失败, doctorId: {}", doctorId, e);
            throw new RuntimeException("获取工作台数据失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取患者个人中心数据
     */
    public PatientDashboardDTO getPatientDashboard(Long patientId) {
        try {
            PatientDashboardDTO dashboard = new PatientDashboardDTO();
            
            // 患者基本信息
            dashboard.setPatientInfo(getPatientInfo(patientId));
            
            // 就诊历史统计
            dashboard.setVisitHistory(getVisitHistory(patientId));
            
            // 转诊记录
            dashboard.setReferralHistory(getReferralHistory(patientId));
            
            // 健康提醒
            dashboard.setHealthReminders(getHealthReminders(patientId));
            
            return dashboard;
        } catch (Exception e) {
            log.error("获取患者个人中心数据失败, patientId: {}", patientId, e);
            throw new RuntimeException("获取个人中心数据失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取医生基本信息
     */
    private DoctorDashboardDTO.DoctorInfo getDoctorInfo(Long doctorId) {
        // TODO: 实现医生信息获取
        DoctorDashboardDTO.DoctorInfo doctorInfo = new DoctorDashboardDTO.DoctorInfo();
        doctorInfo.setDoctorId(doctorId);
        doctorInfo.setName("待实现");
        doctorInfo.setTitle("待实现");
        doctorInfo.setDepartmentName("待实现");
        doctorInfo.setHospitalName("待实现");
        doctorInfo.setSpecialties("待实现");
        return doctorInfo;
    }
    
    /**
     * 获取患者统计信息
     */
    private DoctorDashboardDTO.PatientStatistics getPatientStatistics(Long doctorId) {
        DoctorDashboardDTO.PatientStatistics stats = new DoctorDashboardDTO.PatientStatistics();
        
        // 总患者数 - 这里简化处理，实际应该根据医生查询其负责的患者
        stats.setTotalPatients(patientMapper.count());
        
        // 病情严重度分布 - 模拟数据
        Map<String, Long> severityDistribution = new HashMap<>();
        severityDistribution.put("轻症", 50L);
        severityDistribution.put("中症", 30L);
        severityDistribution.put("重症", 15L);
        severityDistribution.put("危重症", 5L);
        stats.setSeverityDistribution(severityDistribution);
        
        // 本月新患者数 - 模拟数据
        stats.setNewPatientsThisMonth(10L);
        
        // 本周活跃患者数 - 模拟数据
        stats.setActivePatientsThisWeek(25L);
        
        return stats;
    }
    
    /**
     * 获取转诊统计信息
     */
    private DoctorDashboardDTO.ReferralStatistics getReferralStatistics(Long doctorId) {
        DoctorDashboardDTO.ReferralStatistics stats = new DoctorDashboardDTO.ReferralStatistics();
        
        // 待处理转诊
        stats.setPendingReferrals(referralMapper.countByStatus("待审批"));
        
        // 转出转诊
        stats.setOutgoingReferrals((long) referralMapper.findByFromDoctorId(doctorId).size());
        
        // 转入转诊
        stats.setIncomingReferrals((long) referralMapper.findByToDoctorId(doctorId).size());
        
        // 本月完成转诊 - 模拟数据
        stats.setCompletedReferralsThisMonth(8L);
        
        return stats;
    }
    
    /**
     * 获取今日就诊统计
     */
    private DoctorDashboardDTO.TodayVisitStatistics getTodayVisitStatistics(Long doctorId) {
        // TODO: 实现基于VisitMapper的统计
        DoctorDashboardDTO.TodayVisitStatistics stats = new DoctorDashboardDTO.TodayVisitStatistics();
        stats.setTodayVisits(12L);
        stats.setScheduledVisits(8L);
        stats.setEmergencyVisits(4L);
        return stats;
    }
    
    /**
     * 获取患者基本信息
     */
    private PatientDashboardDTO.PatientInfo getPatientInfo(Long patientId) {
        var patient = patientMapper.findById(patientId);
        if (patient == null) {
            throw new IllegalArgumentException("患者不存在");
        }
        
        PatientDashboardDTO.PatientInfo patientInfo = new PatientDashboardDTO.PatientInfo();
        patientInfo.setPatientId(patient.getId());
        patientInfo.setName(patient.getName());
        patientInfo.setGender(patient.getGender());
        patientInfo.setBirthDate(patient.getBirthDate().toString());
        patientInfo.setPhone(patient.getPhone());
        patientInfo.setSeverityLevel(patient.getSeverityLevel());
        patientInfo.setMedicalCardNo(patient.getMedicalCardNo());
        
        return patientInfo;
    }
    
    /**
     * 获取就诊历史统计
     */
    private PatientDashboardDTO.VisitHistory getVisitHistory(Long patientId) {
        // TODO: 实现基于VisitMapper的统计
        PatientDashboardDTO.VisitHistory visitHistory = new PatientDashboardDTO.VisitHistory();
        visitHistory.setTotalVisits(15L);
        visitHistory.setVisitsThisYear(8L);
        visitHistory.setLastVisitDate("2024-01-20");
        visitHistory.setLastDiagnosis("高血压病");
        visitHistory.setLastHospitalName("北京协和医院");
        return visitHistory;
    }
    
    /**
     * 获取转诊历史统计
     */
    private PatientDashboardDTO.ReferralHistory getReferralHistory(Long patientId) {
        List<com.medicalunion.referral.entity.Referral> referrals = referralMapper.findByPatientId(patientId);
        
        PatientDashboardDTO.ReferralHistory referralHistory = new PatientDashboardDTO.ReferralHistory();
        referralHistory.setTotalReferrals((long) referrals.size());
        
        long pendingCount = referrals.stream()
                .filter(r -> "待审批".equals(r.getStatus()))
                .count();
        referralHistory.setPendingReferrals(pendingCount);
        
        if (!referrals.isEmpty()) {
            var lastReferral = referrals.get(0);
            referralHistory.setLastReferralDate(lastReferral.getReferralDate().toString());
            referralHistory.setLastReferralStatus(lastReferral.getStatus());
        }
        
        return referralHistory;
    }
    
    /**
     * 获取健康提醒
     */
    private List<PatientDashboardDTO.HealthReminder> getHealthReminders(Long patientId) {
        // TODO: 实现健康提醒逻辑
        return List.of(
            createHealthReminder("复诊提醒", "您的下次复诊时间为2024-02-15", "2024-02-15", "高"),
            createHealthReminder("用药提醒", "请按时服用降压药", "每日", "中"),
            createHealthReminder("检查提醒", "建议进行血压监测", "每周", "中")
        );
    }
    
    private PatientDashboardDTO.HealthReminder createHealthReminder(String type, String message, String date, String priority) {
        PatientDashboardDTO.HealthReminder reminder = new PatientDashboardDTO.HealthReminder();
        reminder.setType(type);
        reminder.setMessage(message);
        reminder.setDate(date);
        reminder.setPriority(priority);
        return reminder;
    }
}