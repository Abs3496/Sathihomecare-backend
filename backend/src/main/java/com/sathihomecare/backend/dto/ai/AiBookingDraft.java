package com.sathihomecare.backend.dto.ai;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AiBookingDraft {
    private String patientName;
    private Integer age;
    private String location;
    private String serviceType;
    private String preferredDate;
    private String timeSlot;
    private String mobileNumber;
}
