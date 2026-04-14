package com.sathihomecare.backend.repository;

import com.sathihomecare.backend.entity.PartnerProfile;
import com.sathihomecare.backend.entity.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PartnerProfileRepository extends JpaRepository<PartnerProfile, Long> {

    Optional<PartnerProfile> findByEmployeeId(String employeeId);

    Optional<PartnerProfile> findByUser(User user);
}
