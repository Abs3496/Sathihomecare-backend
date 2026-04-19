package com.sathihomecare.backend.repository;

import com.sathihomecare.backend.entity.PartnerAttendance;
import com.sathihomecare.backend.entity.PartnerProfile;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PartnerAttendanceRepository extends JpaRepository<PartnerAttendance, Long> {

    Optional<PartnerAttendance> findByPartnerProfileAndAttendanceDate(PartnerProfile partnerProfile, LocalDate attendanceDate);

    List<PartnerAttendance> findTop30ByPartnerProfileOrderByAttendanceDateDesc(PartnerProfile partnerProfile);

    List<PartnerAttendance> findTop100ByOrderByAttendanceDateDescCheckInAtDesc();
}
