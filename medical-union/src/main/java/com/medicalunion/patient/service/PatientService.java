package com.medicalunion.patient.service;

import com.medicalunion.common.StoredProcedureResult;
import com.medicalunion.patient.entity.Patient;
import com.medicalunion.patient.mapper.PatientMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 患者服务类
 * Patient Service
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PatientService {
    
    private final PatientMapper patientMapper;
    
    /**
     * 查询所有患者
     */
    public List<Patient> findAll() {
        return patientMapper.findAll();
    }
    
    /**
     * 根据ID查询患者
     */
    public Patient findById(Long id) {
        return patientMapper.findById(id);
    }
    
    /**
     * 根据身份证号查询患者
     */
    public Patient findByIdCard(String idCard) {
        return patientMapper.findByIdCard(idCard);
    }
    
    /**
     * 分页查询患者
     */
    public List<Patient> findByPage(int pageNum, int pageSize) {
        int offset = (pageNum - 1) * pageSize;
        return patientMapper.findByPage(offset, pageSize);
    }
    
    /**
     * 根据姓名模糊查询患者
     */
    public List<Patient> findByNameLike(String name) {
        return patientMapper.findByNameLike(name);
    }
    
    /**
     * 创建患者
     */
    @Transactional
    public Patient createPatient(Patient patient) {
        // 使用存储过程创建患者，确保数据一致性与审计
        Map<String, Object> params = new java.util.HashMap<>();
        params.put("name", patient.getName());
        params.put("idCard", patient.getIdCard());
        params.put("gender", patient.getGender());
        params.put("birthDate", patient.getBirthDate());
        params.put("phone", patient.getPhone());
        params.put("address", patient.getAddress());
        params.put("medicalCardNo", patient.getMedicalCardNo());
        params.put("emergencyContact", patient.getEmergencyContact());
        params.put("emergencyPhone", patient.getEmergencyPhone());
        params.put("severityLevel", patient.getSeverityLevel());
        params.put("hospitalId", patient.getHospitalId());
        params.put("departmentId", patient.getDepartmentId());

        // OUT params
        params.put("newId", null);
        params.put("resultCode", null);
        params.put("resultMessage", null);

        try {
            patientMapper.safeCreatePatient(params);

            Integer resultCode = (Integer) params.get("resultCode");
            String resultMessage = (String) params.get("resultMessage");
            Long newId = null;
            Object newIdObj = params.get("newId");
            if (newIdObj != null) {
                if (newIdObj instanceof Number) {
                    newId = ((Number) newIdObj).longValue();
                } else {
                    newId = Long.valueOf(newIdObj.toString());
                }
            }

            if (resultCode != null && resultCode == 0) {
                // 成功，设置返回实体的ID并返回
                if (newId != null) {
                    patient.setId(newId);
                }
                log.info("创建患者成功，ID: {}, 姓名: {}", patient.getId(), patient.getName());
                return patient;
            } else {
                String msg = resultMessage == null ? "创建患者失败" : resultMessage;
                log.warn("存储过程创建患者失败: code={}, msg={}", resultCode, msg);
                throw new IllegalArgumentException(msg);
            }
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            log.error("执行存储过程创建患者时异常", e);
            throw new RuntimeException("创建患者发生异常: " + e.getMessage(), e);
        }
    }
    
    /**
     * 安全更新患者信息（调用存储过程）
     */
    @Transactional
    public StoredProcedureResult updatePatient(Long patientId, String name, String phone, String address) {
        Map<String, Object> params = new HashMap<>();
        params.put("patientId", patientId);
        params.put("name", name);
        params.put("phone", phone);
        params.put("address", address);
        
        try {
            patientMapper.safeUpdatePatient(params);
            
            Integer resultCode = (Integer) params.get("resultCode");
            String resultMessage = (String) params.get("resultMessage");
            
            StoredProcedureResult result = new StoredProcedureResult();
            result.setResultCode(resultCode);
            result.setResultMessage(resultMessage);
            
            log.info("更新患者信息 - ID: {}, 结果: {}, 消息: {}", patientId, resultCode, resultMessage);
            return result;
            
        } catch (Exception e) {
            log.error("更新患者信息异常 - ID: {}, 错误: {}", patientId, e.getMessage());
            return StoredProcedureResult.error(-1, "更新患者信息异常: " + e.getMessage());
        }
    }
    
    /**
     * 安全删除患者（调用存储过程）
     */
    @Transactional
    public StoredProcedureResult deletePatient(Long patientId) {
        Map<String, Object> params = new HashMap<>();
        params.put("patientId", patientId);
        
        try {
            patientMapper.safeDeletePatient(params);
            
            Integer resultCode = (Integer) params.get("resultCode");
            String resultMessage = (String) params.get("resultMessage");
            
            StoredProcedureResult result = new StoredProcedureResult();
            result.setResultCode(resultCode);
            result.setResultMessage(resultMessage);
            
            log.info("删除患者 - ID: {}, 结果: {}, 消息: {}", patientId, resultCode, resultMessage);
            return result;
            
        } catch (Exception e) {
            log.error("删除患者异常 - ID: {}, 错误: {}", patientId, e.getMessage());
            return StoredProcedureResult.error(-1, "删除患者异常: " + e.getMessage());
        }
    }
    
    /**
     * 统计患者总数
     */
    public long count() {
        return patientMapper.count();
    }
}