package com.sathihomecare.backend.repository;

import com.sathihomecare.backend.entity.Booking;
import com.sathihomecare.backend.entity.Payment;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByBooking(Booking booking);
}
