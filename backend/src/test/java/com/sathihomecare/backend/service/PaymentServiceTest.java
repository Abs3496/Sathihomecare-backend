package com.sathihomecare.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.razorpay.Order;
import com.razorpay.OrderClient;
import com.razorpay.RazorpayClient;
import com.sathihomecare.backend.dto.payment.PaymentOrderRequest;
import com.sathihomecare.backend.dto.payment.PaymentVerifyRequest;
import com.sathihomecare.backend.entity.Booking;
import com.sathihomecare.backend.entity.Payment;
import com.sathihomecare.backend.entity.ServiceEntity;
import com.sathihomecare.backend.entity.User;
import com.sathihomecare.backend.entity.enums.PaymentStatus;
import com.sathihomecare.backend.entity.enums.Role;
import com.sathihomecare.backend.repository.BookingRepository;
import com.sathihomecare.backend.repository.PaymentRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private RazorpayClient razorpayClient;

    @InjectMocks
    private PaymentService paymentService;

    private Booking booking;

    @BeforeEach
    void setUp() {
        User customer = new User();
        customer.setEmail("customer@sathi.com");
        customer.setPhone("9876543210");
        customer.setRole(Role.CUSTOMER);

        ServiceEntity service = new ServiceEntity();
        service.setName("Patient Care");

        booking = new Booking();
        booking.setId(10L);
        booking.setCustomer(customer);
        booking.setService(service);
        booking.setTotalAmount(BigDecimal.valueOf(1500));
        booking.setBookingDateTime(LocalDateTime.now().plusDays(1));
        booking.setPaymentStatus(PaymentStatus.PENDING);

        ReflectionTestUtils.setField(paymentService, "razorpayKeySecret", "secret");
    }

    @Test
    void createPaymentOrderReusesExistingPaymentRecord() throws Exception {
        Payment existingPayment = new Payment();
        existingPayment.setBooking(booking);
        existingPayment.setPaymentGateway("RAZORPAY");
        existingPayment.setPaymentStatus(PaymentStatus.PENDING);
        existingPayment.setAmount(BigDecimal.valueOf(1500));

        OrderClient orderClient = mock(OrderClient.class);
        JSONObject json = new JSONObject();
        json.put("id", "order_123");
        json.put("currency", "INR");
        Order order = mock(Order.class);
        when(order.get("id")).thenReturn(json.get("id"));
        when(order.get("currency")).thenReturn(json.get("currency"));

        when(bookingRepository.findById(10L)).thenReturn(Optional.of(booking));
        when(paymentRepository.findByBooking(booking)).thenReturn(Optional.of(existingPayment));
        ReflectionTestUtils.setField(razorpayClient, "orders", orderClient);
        when(orderClient.create(any(JSONObject.class))).thenReturn(order);

        PaymentOrderRequest request = new PaymentOrderRequest();
        request.setBookingId(10L);

        var response = paymentService.createPaymentOrder(request, "customer@sathi.com");

        ArgumentCaptor<Payment> paymentCaptor = ArgumentCaptor.forClass(Payment.class);
        verify(paymentRepository).save(paymentCaptor.capture());
        Payment savedPayment = paymentCaptor.getValue();

        assertThat(savedPayment).isSameAs(existingPayment);
        assertThat(savedPayment.getGatewayOrderId()).isEqualTo("order_123");
        assertThat(savedPayment.getPaymentStatus()).isEqualTo(PaymentStatus.PENDING);
        assertThat(response.getGatewayOrderId()).isEqualTo("order_123");
    }

    @Test
    void verifyPaymentRejectsMismatchedOrderId() {
        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setGatewayOrderId("order_expected");
        payment.setPaymentStatus(PaymentStatus.PENDING);

        when(bookingRepository.findById(10L)).thenReturn(Optional.of(booking));
        when(paymentRepository.findByBooking(booking)).thenReturn(Optional.of(payment));

        PaymentVerifyRequest request = new PaymentVerifyRequest();
        request.setBookingId(10L);
        request.setRazorpayOrderId("order_other");
        request.setRazorpayPaymentId("pay_123");
        request.setRazorpaySignature("signature");

        assertThatThrownBy(() -> paymentService.verifyPayment(request, "customer@sathi.com"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Razorpay order ID does not match the initiated payment");
    }

    @Test
    void verifyPaymentRejectsAlreadyVerifiedPayment() {
        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setGatewayOrderId("order_123");
        payment.setPaymentStatus(PaymentStatus.SUCCESS);

        when(bookingRepository.findById(10L)).thenReturn(Optional.of(booking));
        when(paymentRepository.findByBooking(booking)).thenReturn(Optional.of(payment));

        PaymentVerifyRequest request = new PaymentVerifyRequest();
        request.setBookingId(10L);
        request.setRazorpayOrderId("order_123");
        request.setRazorpayPaymentId("pay_123");
        request.setRazorpaySignature("signature");

        assertThatThrownBy(() -> paymentService.verifyPayment(request, "customer@sathi.com"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Payment has already been verified for this booking");
    }
}
