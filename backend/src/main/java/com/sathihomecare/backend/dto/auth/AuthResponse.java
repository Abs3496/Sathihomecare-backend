package com.sathihomecare.backend.dto.auth;

import com.sathihomecare.backend.entity.enums.Role;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AuthResponse {
    private String token;
    private Long userId;
    private String fullName;
    private String email;
    private String phone;
    private Role role;
    private String employeeId;
}
