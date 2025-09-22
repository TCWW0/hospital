package com.medicalunion.hospital.mapper;

import com.medicalunion.hospital.entity.Hospital;
import com.medicalunion.hospital.entity.Department;
import org.apache.ibatis.annotations.*;

import java.util.List;

/**
 * 医院数据访问接口
 * Hospital Mapper Interface
 */
@Mapper
public interface HospitalMapper {
    
    /**
     * 查询所有医院
     */
    List<Hospital> findAll();
    
    /**
     * 根据ID查询医院
     */
    Hospital findById(@Param("id") Long id);
    
    /**
     * 根据医院名称模糊查询
     */
    List<Hospital> findByNameLike(@Param("name") String name);
    
    /**
     * 根据医院等级查询
     */
    List<Hospital> findByLevel(@Param("hospitalLevel") String hospitalLevel);
    
    /**
     * 插入医院
     */
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Hospital hospital);
    
    /**
     * 更新医院信息
     */
    int update(Hospital hospital);
    
    /**
     * 查询医院的所有科室
     */
    List<Department> findDepartmentsByHospitalId(@Param("hospitalId") Long hospitalId);
}