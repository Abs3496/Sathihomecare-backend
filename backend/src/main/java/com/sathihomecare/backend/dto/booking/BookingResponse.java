package com.sathihomecare.backend.dto.booking;

import com.sathihomecare.backend.entity.enums.BookingStatus;
import com.sathihomecare.backend.entity.enums.PaymentStatus;
import com.sathihomecare.backend.entity.enums.ServiceCategory;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BookingResponse {

    private Long id;
    private Long customerId;
    private String customerName;
    private Long serviceId;
    private String serviceName;
    private ServiceCategory serviceCategory;
    private String serviceDescription;
    private BigDecimal totalAmount;
    private BookingStatus bookingStatus;
    private PaymentStatus paymentStatus;
    private LocalDateTime bookingDateTime;
    private Long partnerId;
    private String partnerName;
    private String partnerEmployeeId;
    private String patientName;
    private Integer patientAge;
    private String patientPhone;
    private String patientIssues;
    private String fullAddress;
}
