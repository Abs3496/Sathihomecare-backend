package com.sathihomecare.backend.dto.payment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentFailureRequest {
    @NotNull
    private Long bookingId;

    @NotBlank
    private String razorpayOrderId;

    private String razorpayPaymentId;

    @NotBlank
    private String failureReason;
}
