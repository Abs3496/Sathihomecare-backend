package com.sathihomecare.backend.controller;

import com.sathihomecare.backend.dto.payment.PaymentOrderRequest;
import com.sathihomecare.backend.dto.payment.PaymentFailureRequest;
import com.sathihomecare.backend.dto.payment.PaymentResponse;
import com.sathihomecare.backend.dto.payment.PaymentVerifyRequest;
import com.sathihomecare.backend.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-order")
    public ResponseEntity<PaymentResponse> createOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody PaymentOrderRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(paymentService.createPaymentOrder(request, userDetails.getUsername()));
    }

    @PostMapping(value = "/verify", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PaymentResponse> verifyPayment(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @ModelAttribute PaymentVerifyRequest request,
            @RequestPart(value = "screenshot", required = false) MultipartFile screenshot
    ) {
        return ResponseEntity.ok(paymentService.verifyPayment(request, userDetails.getUsername(), screenshot));
    }

    @PostMapping("/fail")
    public ResponseEntity<PaymentResponse> markPaymentFailed(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody PaymentFailureRequest request
    ) {
        return ResponseEntity.ok(paymentService.markPaymentFailed(request, userDetails.getUsername()));
    }
}
