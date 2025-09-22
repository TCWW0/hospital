package com.medicalunion.referral.mapper;

import com.medicalunion.referral.entity.Referral;
import org.apache.ibatis.annotations.*;
import org.apache.ibatis.mapping.StatementType;

import java.util.List;
import java.util.Map;

/**
 * 转诊数据访问接口
 * Referral Mapper Interface
 */
@Mapper
public interface ReferralMapper {
    
    /**
     * 查询所有转诊记录（包含关联信息）
     */
    List<Referral> findAll();
    
    /**
     * 根据ID查询转诊记录
     */
    Referral findById(@Param("id") Long id);
    
    /**
     * 根据患者ID查询转诊记录
     */
    List<Referral> findByPatientId(@Param("patientId") Long patientId);
    
    /**
     * 根据转出医生ID查询转诊记录
     */
    List<Referral> findByFromDoctorId(@Param("fromDoctorId") Long fromDoctorId);
    
    /**
     * 根据转入医生ID查询转诊记录
     */
    List<Referral> findByToDoctorId(@Param("toDoctorId") Long toDoctorId);
    
    /**
     * 根据状态查询转诊记录
     */
    List<Referral> findByStatus(@Param("status") String status);
    
    /**
     * 根据医院查询转诊记录（转出或转入）
     */
    List<Referral> findByHospitalId(@Param("hospitalId") Long hospitalId);
    
    /**
     * 插入转诊记录
     */
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Referral referral);
    
    /**
     * 调用存储过程更新转诊状态
     */
    @Select("{CALL sp_update_referral_status(#{referralId,mode=IN}, #{status,mode=IN}, #{toDoctorId,mode=IN}, #{notes,mode=IN}, #{resultCode,mode=OUT,jdbcType=INTEGER}, #{resultMessage,mode=OUT,jdbcType=VARCHAR})}")
    @Options(statementType = StatementType.CALLABLE)
    void updateReferralStatus(Map<String, Object> params);
    
    /**
     * 统计转诊记录总数
     */
    @Select("SELECT COUNT(*) FROM referrals")
    long count();
    
    /**
     * 按状态统计转诊记录
     */
    @Select("SELECT COUNT(*) FROM referrals WHERE status = #{status}")
    long countByStatus(@Param("status") String status);
}