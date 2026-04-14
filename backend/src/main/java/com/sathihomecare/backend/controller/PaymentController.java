package com.sathihomecare.backend.controller;

import com.sathihomecare.backend.dto.payment.PaymentOrderRequest;
import com.sathihomecare.backend.dto.payment.PaymentResponse;
import com.sathihomecare.backend.dto.payment.PaymentVerifyRequest;
import com.sathihomecare.backend.service.PaymentService;
import com.razorpay.RazorpayException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-order")
    public ResponseEntity<PaymentResponse> createOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody PaymentOrderRequest request
    ) throws RazorpayException {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(paymentService.createPaymentOrder(request, userDetails.getUsername()));
    }

    @PostMapping("/verify")
    public ResponseEntity<PaymentResponse> verifyPayment(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody PaymentVerifyRequest request
    ) throws RazorpayException {
        return ResponseEntity.ok(paymentService.verifyPayment(request, userDetails.getUsername()));
    }
}
