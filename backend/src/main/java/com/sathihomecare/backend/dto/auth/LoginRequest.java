package com.sathihomecare.backend.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {
    private String email;
    private String emailOrPhone;
    private String username;
    private String employeeId;

    @NotBlank
    private String password;
}
