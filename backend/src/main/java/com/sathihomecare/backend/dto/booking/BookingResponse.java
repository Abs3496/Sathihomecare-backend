package com.sathihomecare.backend.dto.booking;

import com.sathihomecare.backend.entity.enums.BookingStatus;
import com.sathihomecare.backend.entity.enums.ServiceCategory;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BookingResponse {

    private Long id;
    private String bookingCode;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private String customerMobile;
    private Long serviceId;
    private String serviceName;
    private ServiceCategory serviceCategory;
    private String serviceDescription;
    private BigDecimal totalAmount;
    private BookingStatus bookingStatus;
    private LocalDateTime bookingDateTime;
    private LocalDate preferredDate;
    private String preferredTimeSlot;
    private String additionalNotes;
    private Long partnerId;
    private String partnerName;
    private String partnerEmployeeId;
    private String patientName;
    private Integer patientAge;
    private String patientGender;
    private String patientPhone;
    private String patientIssues;
    private String fullAddress;
}
