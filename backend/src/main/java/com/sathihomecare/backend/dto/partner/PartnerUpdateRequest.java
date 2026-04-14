package com.sathihomecare.backend.dto.partner;

import com.sathihomecare.backend.entity.enums.PartnerStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PartnerUpdateRequest {
    @NotBlank
    private String employeeId;

    @NotBlank
    private String fullName;

    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String phone;

    @NotBlank
    private String professionalRole;

    @NotBlank
    private String address;

    @NotNull
    private LocalDate joiningDate;

    @NotNull
    private PartnerStatus status;
}
