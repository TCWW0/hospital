package com.medicalunion.auth.service;

import com.medicalunion.auth.dto.UserDtos;
import com.medicalunion.auth.dto.AuthResponses;

public interface UserService {
    AuthResponses.UserInfoResponse me(Integer userId);
    void updateProfile(Integer userId, UserDtos.UpdateProfileRequest req);
    void changePassword(Integer userId, UserDtos.ChangePasswordRequest req);
}
