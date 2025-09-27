package com.medicalunion.auth.service.impl;
import com.medicalunion.auth.dto.AuthResponses;
import com.medicalunion.auth.dto.UserDtos;
import com.medicalunion.auth.exception.BizException;
import com.medicalunion.auth.exception.ErrorCode;
import com.medicalunion.auth.mapper.UserAuthMapper;
import com.medicalunion.auth.model.User;
import com.medicalunion.auth.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserAuthMapper userAuthMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // no-op

    @Override
    public AuthResponses.UserInfoResponse me(Integer userId) {
        Map<String, Object> params = new HashMap<>();
        params.put("userId", userId);
        params.put("username", null);
        params.put("role", null);
        params.put("phone", null);
        params.put("idNumber", null);
        params.put("profileJson", null);
        params.put("createdAt", null);
        params.put("updatedAt", null);
        params.put("errcode", null);
        params.put("errmsg", null);

        userAuthMapper.callUserGetInfo(params);
        Integer errcode = (Integer) params.get("errcode");
        String errmsg = (String) params.get("errmsg");
        if (errcode == null) throw new BizException(ErrorCode.DB_ERROR, "No errcode returned");
        if (errcode != 0) throw new BizException(ErrorCode.fromCode(errcode), errmsg);

        AuthResponses.UserInfoResponse res = new AuthResponses.UserInfoResponse();
        res.setUserId(userId);
        res.setUsername((String) params.get("username"));
        res.setRole((String) params.get("role"));
        res.setIdNumber((String) params.get("idNumber"));
        res.setPhone((String) params.get("phone"));
        res.setProfileJson((String) params.get("profileJson"));
        return res;
    }

    @Override
    public void updateProfile(Integer userId, UserDtos.UpdateProfileRequest req) {
        User u = userAuthMapper.selectUserById(userId);
        if (u == null) throw new BizException(ErrorCode.USER_NOT_FOUND, "用户不存在");

        Map<String, Object> params = new HashMap<>();
        params.put("userId", userId);
        params.put("name", req.getName());
        params.put("idNumber", req.getIdNumber());
        params.put("phone", req.getPhone());
        params.put("errcode", null);
        params.put("errmsg", null);

        userAuthMapper.callUserUpdateProfile(params);
        Integer err = (Integer) params.get("errcode");
        String msg = (String) params.get("errmsg");
        if (err == null) throw new BizException(ErrorCode.DB_ERROR, "No errcode returned");
        if (err != 0) throw new BizException(ErrorCode.fromCode(err), msg);
    }

    @Override
    public void changePassword(Integer userId, UserDtos.ChangePasswordRequest req) {
        User u = userAuthMapper.selectUserById(userId);
        if (u == null) throw new BizException(ErrorCode.USER_NOT_FOUND, "用户不存在");

        if (!passwordEncoder.matches(req.getOldPassword(), u.getPasswordHash()))
            throw new BizException(ErrorCode.INVALID_PASSWORD, "旧密码不正确");

        String newHash = passwordEncoder.encode(req.getNewPassword());

        Map<String, Object> params = new HashMap<>();
        params.put("userId", userId);
        params.put("newPasswordHash", newHash);
        params.put("errcode", null);
        params.put("errmsg", null);

        userAuthMapper.callUserChangePassword(params);
        Integer err = (Integer) params.get("errcode");
        String msg = (String) params.get("errmsg");
        if (err == null) throw new BizException(ErrorCode.DB_ERROR, "No errcode returned");
        if (err != 0) throw new BizException(ErrorCode.fromCode(err), msg);
    }
}
