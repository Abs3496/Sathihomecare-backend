package com.sathihomecare.backend.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CustomerRegisterRequest {
    @NotBlank
    private String fullName;

    @Email
    @NotBlank
    private String email;

    @NotBlank
    @Pattern(regexp = "^[0-9]{10}$", message = "must be a valid 10 digit phone number")
    private String phone;

    @NotBlank
    @Size(min = 8, max = 72, message = "must be between 8 and 72 characters")
    private String password;
}
