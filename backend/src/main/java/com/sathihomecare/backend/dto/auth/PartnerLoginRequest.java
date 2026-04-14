package com.sathihomecare.backend.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PartnerLoginRequest {
    @NotBlank
    private String employeeId;

    @NotBlank
    private String password;
}
