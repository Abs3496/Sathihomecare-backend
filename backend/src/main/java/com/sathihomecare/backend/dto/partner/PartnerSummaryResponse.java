package com.sathihomecare.backend.dto.partner;

import com.sathihomecare.backend.entity.enums.PartnerStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PartnerSummaryResponse {

    private Long userId;
    private Long profileId;
    private String employeeId;
    private String fullName;
    private String email;
    private String phone;
    private String professionalRole;
    private String address;
    private String joiningDate;
    private PartnerStatus status;
}
