package com.sathihomecare.backend.dto.payment;

import java.math.BigDecimal;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PaymentResponse {
    private Long bookingId;
    private String gatewayOrderId;
    private String gatewayPaymentId;
    private String currency;
    private BigDecimal amount;
    private String status;
    private String message;
    private String upiId;
    private String merchantName;
    private String upiUri;
    private String qrCodeUrl;
    private String transactionNote;
    private String paymentApp;
    private String utrNumber;
    private boolean proofUploaded;
}
