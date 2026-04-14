package com.sathihomecare.backend.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
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
import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final RazorpayClient razorpayClient;

    @Value("${razorpay.key-id}")
    private String razorpayKeyId;

    @Value("${razorpay.key-secret}")
    private String razorpayKeySecret;

    @Transactional
    public PaymentResponse createPaymentOrder(PaymentOrderRequest request, String username) throws RazorpayException {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getCustomer().getEmail().equals(username) && !booking.getCustomer().getPhone().equals(username)) {
            throw new IllegalArgumentException("Booking does not belong to the authenticated customer");
        }

        if (booking.getPaymentStatus() != PaymentStatus.PENDING) {
            throw new IllegalArgumentException("Payment has already been initiated for this booking");
        }

        BigDecimal amountInPaise = booking.getTotalAmount().multiply(BigDecimal.valueOf(100));
        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amountInPaise.longValue());
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "booking_" + booking.getId());
        orderRequest.put("payment_capture", 1);

        Payment payment = paymentRepository.findByBooking(booking).orElse(null);
        if (payment != null && payment.getPaymentStatus() == PaymentStatus.SUCCESS) {
            throw new IllegalArgumentException("Payment has already been completed for this booking");
        }

        Order order = razorpayClient.orders.create(orderRequest);

        if (payment == null) {
            payment = new Payment();
            payment.setBooking(booking);
            payment.setPaymentGateway("RAZORPAY");
        }
        payment.setGatewayOrderId(order.get("id"));
        payment.setGatewayPaymentId(null);
        payment.setSignature(null);
        payment.setAmount(booking.getTotalAmount());
        payment.setPaymentStatus(PaymentStatus.PENDING);
        paymentRepository.save(payment);

        return PaymentResponse.builder()
                .bookingId(booking.getId())
                .gatewayOrderId(order.get("id"))
                .currency(order.get("currency"))
                .amount(booking.getTotalAmount())
                .status(PaymentStatus.PENDING.name())
                .message("Razorpay order created")
                .build();
    }

    @Transactional
    public PaymentResponse verifyPayment(PaymentVerifyRequest request, String username) throws RazorpayException {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getCustomer().getEmail().equals(username) && !booking.getCustomer().getPhone().equals(username)) {
            throw new IllegalArgumentException("Booking does not belong to the authenticated customer");
        }

        JSONObject params = new JSONObject();
        params.put("razorpay_order_id", request.getRazorpayOrderId());
        params.put("razorpay_payment_id", request.getRazorpayPaymentId());
        params.put("razorpay_signature", request.getRazorpaySignature());

        Utils.verifyPaymentSignature(params, razorpayKeySecret);

        Payment payment = paymentRepository.findByBooking(booking)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found for booking"));

        if (!request.getRazorpayOrderId().equals(payment.getGatewayOrderId())) {
            throw new IllegalArgumentException("Razorpay order ID does not match the initiated payment");
        }

        if (payment.getPaymentStatus() == PaymentStatus.SUCCESS) {
            throw new IllegalArgumentException("Payment has already been verified for this booking");
        }

        payment.setGatewayPaymentId(request.getRazorpayPaymentId());
        payment.setSignature(request.getRazorpaySignature());
        payment.setPaymentStatus(PaymentStatus.SUCCESS);
        paymentRepository.save(payment);

        booking.setPaymentStatus(PaymentStatus.SUCCESS);
        booking.setBookingStatus(booking.getAssignedPartner() != null ? BookingStatus.ASSIGNED : BookingStatus.PENDING_ASSIGNMENT);
        bookingRepository.save(booking);

        return PaymentResponse.builder()
                .bookingId(booking.getId())
                .gatewayOrderId(payment.getGatewayOrderId())
                .gatewayPaymentId(payment.getGatewayPaymentId())
                .currency("INR")
                .amount(payment.getAmount())
                .status(PaymentStatus.SUCCESS.name())
                .message("Payment verified successfully")
                .build();
    }
}
