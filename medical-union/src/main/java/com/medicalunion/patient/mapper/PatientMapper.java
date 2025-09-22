package com.medicalunion.patient.mapper;

import com.medicalunion.patient.entity.Patient;
import org.apache.ibatis.annotations.*;

import java.util.List;
import java.util.Map;

/**
 * 患者数据访问接口
 * Patient Mapper Interface
 */
@Mapper
public interface PatientMapper {
    
    /**
     * 查询所有患者
     */
    List<Patient> findAll();
    
    /**
     * 根据ID查询患者
     */
    Patient findById(@Param("id") Long id);
    
    /**
     * 根据身份证号查询患者
     */
    Patient findByIdCard(@Param("idCard") String idCard);
    
    /**
     * 分页查询患者
     */
    List<Patient> findByPage(@Param("offset") int offset, @Param("limit") int limit);
    
    /**
     * 根据姓名模糊查询患者
     */
    List<Patient> findByNameLike(@Param("name") String name);
    
    /**
     * 插入患者
     */
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Patient patient);

    /**
     * 调用存储过程安全创建患者
     * params should contain IN parameters and OUT parameters: newId, resultCode, resultMessage
     */
    void safeCreatePatient(Map<String, Object> params);
    
    /**
     * 调用存储过程安全更新患者信息
     */
    void safeUpdatePatient(Map<String, Object> params);
    
    /**
     * 调用存储过程安全删除患者
     */
    void safeDeletePatient(Map<String, Object> params);
    
    /**
     * 统计患者总数
     */
    @Select("SELECT COUNT(*) FROM patients")
    long count();
}