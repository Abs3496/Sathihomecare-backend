package com.sathihomecare.backend.dto.payment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentVerifyRequest {
    @NotNull
    private Long bookingId;

    private String gatewayOrderId;

    @NotBlank
    private String utrNumber;

    private String paymentApp;
}
