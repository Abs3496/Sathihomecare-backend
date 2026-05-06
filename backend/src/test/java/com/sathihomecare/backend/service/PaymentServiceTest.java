package com.sathihomecare.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.sathihomecare.backend.dto.payment.PaymentOrderRequest;
import com.sathihomecare.backend.dto.payment.PaymentVerifyRequest;
import com.sathihomecare.backend.entity.Booking;
import com.sathihomecare.backend.entity.PatientDetails;
import com.sathihomecare.backend.entity.Payment;
import com.sathihomecare.backend.entity.ServiceEntity;
import com.sathihomecare.backend.entity.User;
import com.sathihomecare.backend.entity.enums.BookingStatus;
import com.sathihomecare.backend.entity.enums.PaymentStatus;
import com.sathihomecare.backend.entity.enums.Role;
import com.sathihomecare.backend.repository.BookingRepository;
import com.sathihomecare.backend.repository.PaymentRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
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
    private BookingEmailService bookingEmailService;

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

        PatientDetails patientDetails = new PatientDetails();
        patientDetails.setPatientName("Asha");

        booking = new Booking();
        booking.setId(10L);
        booking.setCustomer(customer);
        booking.setService(service);
        booking.setPatientDetails(patientDetails);
        booking.setTotalAmount(BigDecimal.valueOf(1500));
        booking.setBookingDateTime(LocalDateTime.now().plusDays(1));
        booking.setPaymentStatus(PaymentStatus.PENDING);

        ReflectionTestUtils.setField(paymentService, "upiId", "8090806731@ybl");
        ReflectionTestUtils.setField(paymentService, "merchantName", "SATHIHOMECARE");
        ReflectionTestUtils.setField(paymentService, "proofUploadDir", "target/test-payment-proofs");
    }

    @Test
    void createPaymentOrderCreatesUpiIntent() {
        when(bookingRepository.findById(10L)).thenReturn(Optional.of(booking));
        when(paymentRepository.findByBooking(booking)).thenReturn(Optional.empty());

        PaymentOrderRequest request = new PaymentOrderRequest();
        request.setBookingId(10L);

        var response = paymentService.createPaymentOrder(request, "customer@sathi.com");

        ArgumentCaptor<Payment> paymentCaptor = ArgumentCaptor.forClass(Payment.class);
        verify(paymentRepository).save(paymentCaptor.capture());
        Payment savedPayment = paymentCaptor.getValue();

        assertThat(savedPayment.getPaymentGateway()).isEqualTo("UPI");
        assertThat(savedPayment.getGatewayOrderId()).startsWith("SHC10");
        assertThat(savedPayment.getPaymentStatus()).isEqualTo(PaymentStatus.PENDING);
        assertThat(response.getUpiId()).isEqualTo("8090806731@ybl");
        assertThat(response.getUpiUri()).contains("upi://pay");
        assertThat(response.getUpiUri()).contains("pa=8090806731%40ybl");
    }

    @Test
    void verifyPaymentStoresUtrAndConfirmsBooking() {
        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setPaymentGateway("UPI");
        payment.setGatewayOrderId("SHC10ABC");
        payment.setPaymentStatus(PaymentStatus.PENDING);
        payment.setAmount(BigDecimal.valueOf(1500));
        payment.setTransactionNote("SATHIHOMECARE booking #10 - Patient Care");

        when(bookingRepository.findById(10L)).thenReturn(Optional.of(booking));
        when(paymentRepository.findByBooking(booking)).thenReturn(Optional.of(payment));

        PaymentVerifyRequest request = new PaymentVerifyRequest();
        request.setBookingId(10L);
        request.setGatewayOrderId("SHC10ABC");
        request.setUtrNumber("412345678901");
        request.setPaymentApp("Google Pay");

        var response = paymentService.verifyPayment(request, "customer@sathi.com", null);

        assertThat(payment.getPaymentStatus()).isEqualTo(PaymentStatus.SUCCESS);
        assertThat(payment.getUtrNumber()).isEqualTo("412345678901");
        assertThat(payment.getPaymentApp()).isEqualTo("Google Pay");
        assertThat(booking.getPaymentStatus()).isEqualTo(PaymentStatus.SUCCESS);
        assertThat(booking.getBookingStatus()).isEqualTo(BookingStatus.PENDING_ASSIGNMENT);
        assertThat(response.getStatus()).isEqualTo("SUCCESS");
        verify(bookingEmailService).sendPaymentConfirmation(booking, payment);
    }

    @Test
    void verifyPaymentRejectsInvalidUtr() {
        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setPaymentGateway("UPI");
        payment.setGatewayOrderId("SHC10ABC");
        payment.setPaymentStatus(PaymentStatus.PENDING);
        payment.setAmount(BigDecimal.valueOf(1500));
        payment.setTransactionNote("SATHIHOMECARE booking #10 - Patient Care");

        when(bookingRepository.findById(10L)).thenReturn(Optional.of(booking));
        when(paymentRepository.findByBooking(booking)).thenReturn(Optional.of(payment));

        PaymentVerifyRequest request = new PaymentVerifyRequest();
        request.setBookingId(10L);
        request.setUtrNumber("bad");

        assertThatThrownBy(() -> paymentService.verifyPayment(request, "customer@sathi.com", null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Enter a valid UPI transaction ID or UTR");
        verifyNoInteractions(bookingEmailService);
    }
}
