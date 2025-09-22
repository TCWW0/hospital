package com.medicalunion.hospital.mapper;

import com.medicalunion.hospital.entity.Department;
import org.apache.ibatis.annotations.*;

import java.util.List;

/**
 * 科室数据访问接口
 * Department Mapper Interface
 */
@Mapper
public interface DepartmentMapper {
    
    /**
     * 查询所有科室（包含医院信息）
     */
    List<Department> findAll();
    
    /**
     * 根据ID查询科室
     */
    Department findById(@Param("id") Long id);
    
    /**
     * 根据医院ID查询科室
     */
    List<Department> findByHospitalId(@Param("hospitalId") Long hospitalId);
    
    /**
     * 根据科室类型查询
     */
    List<Department> findByType(@Param("departmentType") String departmentType);
    
    /**
     * 插入科室
     */
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Department department);
    
    /**
     * 更新科室信息
     */
    int update(Department department);
    
    /**
     * 删除科室
     */
    int deleteById(@Param("id") Long id);
}