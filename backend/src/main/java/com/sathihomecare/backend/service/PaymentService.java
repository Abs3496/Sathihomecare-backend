package com.sathihomecare.backend.service;

import com.sathihomecare.backend.dto.payment.PaymentFailureRequest;
import com.sathihomecare.backend.dto.payment.PaymentOrderRequest;
import com.sathihomecare.backend.dto.payment.PaymentResponse;
import com.sathihomecare.backend.dto.payment.PaymentVerifyRequest;
import com.sathihomecare.backend.entity.Booking;
import com.sathihomecare.backend.entity.Payment;
import com.sathihomecare.backend.entity.enums.BookingStatus;
import com.sathihomecare.backend.entity.enums.PaymentStatus;
import com.sathihomecare.backend.exception.ResourceNotFoundException;
import com.sathihomecare.backend.repository.BookingRepository;
import com.sathihomecare.backend.repository.PaymentRepository;
import java.io.IOException;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private static final Set<String> ALLOWED_PROOF_TYPES = Set.of("image/jpeg", "image/png", "image/webp", "application/pdf");
    private static final long MAX_PROOF_BYTES = 5L * 1024L * 1024L;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final BookingEmailService bookingEmailService;

    @Value("${app.payment.upi-id:8090806731@ybl}")
    private String upiId;

    @Value("${app.payment.merchant-name:SATHIHOMECARE}")
    private String merchantName;

    @Value("${app.payment.proof-upload-dir:uploads/payment-proofs}")
    private String proofUploadDir;

    @Transactional
    public PaymentResponse createPaymentOrder(PaymentOrderRequest request, String username) {
        Booking booking = getOwnedBooking(request.getBookingId(), username);

        if (booking.getPaymentStatus() == PaymentStatus.SUCCESS) {
            throw new IllegalArgumentException("Payment has already been completed for this booking");
        }

        Payment payment = paymentRepository.findByBooking(booking).orElse(null);
        if (payment == null) {
            payment = new Payment();
            payment.setBooking(booking);
            payment.setPaymentGateway("UPI");
            payment.setGatewayOrderId(buildReference(booking));
        }

        payment.setGatewayPaymentId(null);
        payment.setSignature(null);
        payment.setAmount(booking.getTotalAmount());
        payment.setPaymentStatus(PaymentStatus.PENDING);
        payment.setTransactionNote(buildTransactionNote(booking));
        paymentRepository.save(payment);

        booking.setPaymentStatus(PaymentStatus.PENDING);
        booking.setBookingStatus(BookingStatus.PENDING_PAYMENT);
        bookingRepository.save(booking);

        return buildResponse(payment, "UPI payment intent created");
    }

    @Transactional
    public PaymentResponse verifyPayment(PaymentVerifyRequest request, String username, MultipartFile screenshot) {
        Booking booking = getOwnedBooking(request.getBookingId(), username);
        Payment payment = paymentRepository.findByBooking(booking)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found for booking"));

        if (StringUtils.hasText(request.getGatewayOrderId())
                && !request.getGatewayOrderId().equals(payment.getGatewayOrderId())) {
            throw new IllegalArgumentException("Payment reference does not match the initiated UPI payment");
        }

        if (payment.getPaymentStatus() == PaymentStatus.SUCCESS) {
            throw new IllegalArgumentException("Payment has already been verified for this booking");
        }

        String utrNumber = sanitizeUtr(request.getUtrNumber());
        payment.setGatewayPaymentId(utrNumber);
        payment.setUtrNumber(utrNumber);
        payment.setPaymentApp(StringUtils.hasText(request.getPaymentApp()) ? request.getPaymentApp().trim() : "UPI");

        if (screenshot != null && !screenshot.isEmpty()) {
            storeProof(payment, screenshot);
        }

        payment.setPaymentGateway("UPI");
        payment.setPaymentStatus(PaymentStatus.SUCCESS);
        payment.setVerifiedAt(LocalDateTime.now());
        paymentRepository.save(payment);

        booking.setPaymentStatus(PaymentStatus.SUCCESS);
        booking.setBookingStatus(booking.getAssignedPartner() != null ? BookingStatus.ASSIGNED : BookingStatus.PENDING_ASSIGNMENT);
        bookingRepository.save(booking);

        bookingEmailService.sendPaymentConfirmation(booking, payment);
        return buildResponse(payment, "Payment proof submitted successfully");
    }

    @Transactional
    public PaymentResponse markPaymentFailed(PaymentFailureRequest request, String username) {
        Booking booking = getOwnedBooking(request.getBookingId(), username);
        Payment payment = paymentRepository.findByBooking(booking)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found for booking"));

        if (payment.getPaymentStatus() != PaymentStatus.SUCCESS) {
            payment.setGatewayPaymentId(request.getPaymentReference());
            payment.setPaymentStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            booking.setPaymentStatus(PaymentStatus.FAILED);
            booking.setBookingStatus(BookingStatus.PENDING_PAYMENT);
            bookingRepository.save(booking);
        }

        return buildResponse(payment, request.getFailureReason());
    }

    private Booking getOwnedBooking(Long bookingId, String username) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getCustomer().getEmail().equals(username) && !booking.getCustomer().getPhone().equals(username)) {
            throw new IllegalArgumentException("Booking does not belong to the authenticated customer");
        }

        return booking;
    }

    private String buildReference(Booking booking) {
        return "SHC" + booking.getId() + Long.toString(System.currentTimeMillis(), 36).toUpperCase();
    }

    private String buildTransactionNote(Booking booking) {
        return "SATHIHOMECARE booking #" + booking.getId() + " - " + booking.getService().getName();
    }

    private String buildUpiUri(Payment payment) {
        return "upi://pay"
                + "?pa=" + encode(upiId)
                + "&pn=" + encode(merchantName)
                + "&am=" + encode(formatAmount(payment.getAmount()))
                + "&cu=INR"
                + "&tr=" + encode(payment.getGatewayOrderId())
                + "&tn=" + encode(payment.getTransactionNote());
    }

    private PaymentResponse buildResponse(Payment payment, String message) {
        String upiUri = buildUpiUri(payment);
        return PaymentResponse.builder()
                .bookingId(payment.getBooking().getId())
                .gatewayOrderId(payment.getGatewayOrderId())
                .gatewayPaymentId(payment.getGatewayPaymentId())
                .currency("INR")
                .amount(payment.getAmount())
                .status(payment.getPaymentStatus().name())
                .message(message)
                .upiId(upiId)
                .merchantName(merchantName)
                .upiUri(upiUri)
                .qrCodeUrl("https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=" + encode(upiUri))
                .transactionNote(payment.getTransactionNote())
                .paymentApp(payment.getPaymentApp())
                .utrNumber(payment.getUtrNumber())
                .proofUploaded(StringUtils.hasText(payment.getProofFilePath()))
                .build();
    }

    private String sanitizeUtr(String value) {
        String utr = String.valueOf(value == null ? "" : value).trim().replaceAll("\\s+", "");
        if (!utr.matches("[A-Za-z0-9]{8,24}")) {
            throw new IllegalArgumentException("Enter a valid UPI transaction ID or UTR");
        }
        return utr.toUpperCase();
    }

    private void storeProof(Payment payment, MultipartFile screenshot) {
        String contentType = screenshot.getContentType();
        if (!ALLOWED_PROOF_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Upload a PNG, JPG, WEBP, or PDF payment proof");
        }
        if (screenshot.getSize() > MAX_PROOF_BYTES) {
            throw new IllegalArgumentException("Payment proof must be 5 MB or smaller");
        }

        try {
            Path uploadRoot = Path.of(proofUploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadRoot);

            String extension = extensionFor(contentType);
            byte[] randomBytes = new byte[12];
            RANDOM.nextBytes(randomBytes);
            String fileName = "booking-" + payment.getBooking().getId() + "-" + HexFormat.of().formatHex(randomBytes) + extension;
            Path target = uploadRoot.resolve(fileName).normalize();
            if (!target.startsWith(uploadRoot)) {
                throw new IllegalArgumentException("Invalid upload path");
            }

            screenshot.transferTo(target);
            payment.setProofFileName(fileName);
            payment.setProofContentType(contentType);
            payment.setProofFilePath(target.toString());
        } catch (IOException error) {
            throw new IllegalStateException("Unable to store payment proof. Please try again.");
        }
    }

    private String extensionFor(String contentType) {
        return switch (contentType) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "application/pdf" -> ".pdf";
            default -> "";
        };
    }

    private String formatAmount(BigDecimal amount) {
        return amount.stripTrailingZeros().toPlainString();
    }

    private String encode(String value) {
        return URLEncoder.encode(String.valueOf(value == null ? "" : value), StandardCharsets.UTF_8);
    }
}
