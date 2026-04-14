package com.sathihomecare.backend.repository;

import com.sathihomecare.backend.entity.Booking;
import com.sathihomecare.backend.entity.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByCustomer(User customer);

    List<Booking> findByAssignedPartner(User assignedPartner);
}
