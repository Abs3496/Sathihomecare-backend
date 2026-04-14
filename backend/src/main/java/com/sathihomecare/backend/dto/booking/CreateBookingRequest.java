package com.sathihomecare.backend.dto.booking;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateBookingRequest {

    @NotNull
    private Long serviceId;

    @NotNull
    @Future
    private LocalDateTime bookingDateTime;

    @NotBlank
    private String addressLineOne;

    private String addressLineTwo;

    @NotBlank
    private String city;

    @NotBlank
    private String state;

    @NotBlank
    private String pincode;

    private String landmark;

    @NotBlank
    private String patientName;

    @NotBlank
    private String patientPhone;

    @NotNull
    @Min(1)
    private Integer patientAge;

    @NotBlank
    private String patientAddress;

    @NotBlank
    private String patientIssues;
}
