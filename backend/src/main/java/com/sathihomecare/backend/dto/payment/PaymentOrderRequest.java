package com.sathihomecare.backend.dto.payment;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentOrderRequest {
    @NotNull
    private Long bookingId;
}
