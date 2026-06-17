package com.sathihomecare.backend.repository;

import com.sathihomecare.backend.entity.Booking;
import com.sathihomecare.backend.entity.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByAssignedPartner(User assignedPartner);

    Optional<Booking> findByBookingCodeIgnoreCase(String bookingCode);

    boolean existsByBookingCode(String bookingCode);
}
