package com.medicalunion.referral.service;

import com.medicalunion.common.StoredProcedureResult;
import com.medicalunion.referral.entity.Referral;
import com.medicalunion.referral.mapper.ReferralMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 转诊服务类
 * Referral Service
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ReferralService {
    
    private final ReferralMapper referralMapper;
    
    /**
     * 查询所有转诊记录
     */
    public List<Referral> findAll() {
        return referralMapper.findAll();
    }
    
    /**
     * 根据ID查询转诊记录
     */
    public Referral findById(Long id) {
        return referralMapper.findById(id);
    }
    
    /**
     * 根据患者ID查询转诊记录
     */
    public List<Referral> findByPatientId(Long patientId) {
        return referralMapper.findByPatientId(patientId);
    }
    
    /**
     * 根据医生ID查询转诊记录（转出）
     */
    public List<Referral> findByFromDoctorId(Long fromDoctorId) {
        return referralMapper.findByFromDoctorId(fromDoctorId);
    }
    
    /**
     * 根据医生ID查询转诊记录（转入）
     */
    public List<Referral> findByToDoctorId(Long toDoctorId) {
        return referralMapper.findByToDoctorId(toDoctorId);
    }
    
    /**
     * 根据状态查询转诊记录
     */
    public List<Referral> findByStatus(String status) {
        return referralMapper.findByStatus(status);
    }
    
    /**
     * 根据医院ID查询转诊记录
     */
    public List<Referral> findByHospitalId(Long hospitalId) {
        return referralMapper.findByHospitalId(hospitalId);
    }
    
    /**
     * 创建转诊申请
     */
    @Transactional
    public Referral createReferral(Referral referral) {
        // 设置默认值
        if (referral.getReferralDate() == null) {
            referral.setReferralDate(LocalDateTime.now());
        }
        if (referral.getStatus() == null) {
            referral.setStatus("待审批");
        }
        if (referral.getPriority() == null) {
            referral.setPriority("普通");
        }
        
        // 业务验证
        validateReferral(referral);
        
        int result = referralMapper.insert(referral);
        if (result > 0) {
            log.info("创建转诊申请成功，ID: {}, 患者ID: {}, 转出医生ID: {}", 
                    referral.getId(), referral.getPatientId(), referral.getFromDoctorId());
            return referral;
        } else {
            throw new RuntimeException("创建转诊申请失败");
        }
    }
    
    /**
     * 更新转诊状态（调用存储过程）
     */
    @Transactional
    public StoredProcedureResult updateReferralStatus(Long referralId, String status, Long toDoctorId, String notes) {
        Map<String, Object> params = new HashMap<>();
        params.put("referralId", referralId);
        params.put("status", status);
        params.put("toDoctorId", toDoctorId);
        params.put("notes", notes);
        
        try {
            referralMapper.updateReferralStatus(params);
            
            Integer resultCode = (Integer) params.get("resultCode");
            String resultMessage = (String) params.get("resultMessage");
            
            StoredProcedureResult result = new StoredProcedureResult();
            result.setResultCode(resultCode);
            result.setResultMessage(resultMessage);
            
            log.info("更新转诊状态 - ID: {}, 状态: {}, 结果: {}, 消息: {}", 
                    referralId, status, resultCode, resultMessage);
            return result;
            
        } catch (Exception e) {
            log.error("更新转诊状态异常 - ID: {}, 错误: {}", referralId, e.getMessage());
            return StoredProcedureResult.error(-1, "更新转诊状态异常: " + e.getMessage());
        }
    }
    
    /**
     * 审批转诊申请
     */
    @Transactional
    public StoredProcedureResult approveReferral(Long referralId, Long toDoctorId, String notes) {
        return updateReferralStatus(referralId, "已审批", toDoctorId, notes);
    }
    
    /**
     * 拒绝转诊申请
     */
    @Transactional
    public StoredProcedureResult rejectReferral(Long referralId, String notes) {
        return updateReferralStatus(referralId, "已拒绝", null, notes);
    }
    
    /**
     * 完成转诊
     */
    @Transactional
    public StoredProcedureResult completeReferral(Long referralId, String notes) {
        return updateReferralStatus(referralId, "已完成", null, notes);
    }
    
    /**
     * 统计转诊记录总数
     */
    public long count() {
        return referralMapper.count();
    }
    
    /**
     * 按状态统计转诊记录
     */
    public long countByStatus(String status) {
        return referralMapper.countByStatus(status);
    }
    
    /**
     * 转诊业务验证
     */
    private void validateReferral(Referral referral) {
        if (referral.getFromHospitalId().equals(referral.getToHospitalId())) {
            throw new IllegalArgumentException("转出医院和转入医院不能相同");
        }
        
        if (referral.getFromDoctorId().equals(referral.getToDoctorId())) {
            throw new IllegalArgumentException("转出医生和转入医生不能相同");
        }
        
        // 可以添加更多业务验证逻辑
        // 例如：检查医生是否属于对应医院、检查医院等级转诊规则等
    }
}