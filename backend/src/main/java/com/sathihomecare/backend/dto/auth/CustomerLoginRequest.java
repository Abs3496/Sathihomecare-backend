package com.sathihomecare.backend.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CustomerLoginRequest {
    @NotBlank
    private String emailOrPhone;

    @NotBlank
    private String password;
}
