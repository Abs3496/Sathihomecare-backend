package com.sathihomecare.backend.dto.booking;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateBookingRequest {

    @NotNull
    private Long serviceId;

    @NotNull
    private LocalDate preferredDate;

    @NotBlank
    private String preferredTimeSlot;

    @NotBlank
    private String patientName;

    @NotNull
    @Min(1)
    private Integer patientAge;

    @NotBlank
    private String gender;

    @NotBlank
    @Pattern(regexp = "^[0-9]{10}$", message = "must be a valid 10 digit mobile number")
    private String mobileNumber;

    @NotBlank
    private String email;

    @NotBlank
    private String address;

    private String additionalNotes;

    private String serviceType;

    private String addressLineOne;

    private String addressLineTwo;

    private String city;

    private String state;

    private String pincode;

    private String landmark;

    private String patientPhone;

    private String patientAddress;

    private String patientIssues;
}
