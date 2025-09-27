package com.medicalunion.auth.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import com.medicalunion.auth.model.User;
import java.util.Map;

@Mapper
public interface UserAuthMapper {
    void callUserRegister(Map<String, Object> params);
    void callUserLogin(Map<String, Object> params);
    void callUserLoginSimple(Map<String, Object> params);
    void callUserGetInfo(Map<String, Object> params);
    // 从 doctors 表按工号查询 password_hash
    String selectDoctorPasswordByCode(@Param("doctorCode") String doctorCode);
    User selectUserByUsername(@Param("username") String username);
    User selectUserByPhone(@Param("phone") String phone);
    User selectUserById(@Param("id") Integer id);
    int updateUserProfile(@Param("id") Integer id, @Param("profileJson") String profileJson);
    int updateUserPassword(@Param("id") Integer id, @Param("passwordHash") String passwordHash);

    // SP callables for Phase 1
    void callUserUpdateProfile(Map<String, Object> params);
    void callUserChangePassword(Map<String, Object> params);
}
