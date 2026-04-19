package com.sathihomecare.backend.service;

import com.sathihomecare.backend.dto.partner.AttendanceResponse;
import com.sathihomecare.backend.entity.PartnerAttendance;
import com.sathihomecare.backend.entity.PartnerProfile;
import com.sathihomecare.backend.entity.User;
import com.sathihomecare.backend.entity.enums.Role;
import com.sathihomecare.backend.exception.ResourceNotFoundException;
import com.sathihomecare.backend.repository.PartnerAttendanceRepository;
import com.sathihomecare.backend.repository.PartnerProfileRepository;
import com.sathihomecare.backend.repository.UserRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final PartnerAttendanceRepository partnerAttendanceRepository;
    private final PartnerProfileRepository partnerProfileRepository;
    private final UserRepository userRepository;

    @Transactional
    public AttendanceResponse checkIn(String username) {
        PartnerProfile profile = getPartnerProfile(username);
        LocalDate today = LocalDate.now();

        partnerAttendanceRepository.findByPartnerProfileAndAttendanceDate(profile, today)
                .ifPresent(attendance -> {
                    throw new IllegalArgumentException("Attendance already marked for today.");
                });

        PartnerAttendance attendance = new PartnerAttendance();
        attendance.setPartnerProfile(profile);
        attendance.setAttendanceDate(today);
        attendance.setCheckInAt(LocalDateTime.now());
        return toResponse(partnerAttendanceRepository.save(attendance));
    }

    @Transactional
    public AttendanceResponse checkOut(String username) {
        PartnerProfile profile = getPartnerProfile(username);
        PartnerAttendance attendance = partnerAttendanceRepository
                .findByPartnerProfileAndAttendanceDate(profile, LocalDate.now())
                .orElseThrow(() -> new IllegalArgumentException("Please check in before checking out."));

        if (attendance.getCheckOutAt() != null) {
            throw new IllegalArgumentException("Checkout already recorded for today.");
        }

        attendance.setCheckOutAt(LocalDateTime.now());
        return toResponse(partnerAttendanceRepository.save(attendance));
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> getPartnerAttendance(String username) {
        PartnerProfile profile = getPartnerProfile(username);
        return partnerAttendanceRepository.findTop30ByPartnerProfileOrderByAttendanceDateDesc(profile).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> getAllAttendance() {
        return partnerAttendanceRepository.findTop100ByOrderByAttendanceDateDescCheckInAtDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    private PartnerProfile getPartnerProfile(String username) {
        User user = userRepository.findByEmailIgnoreCase(username)
                .or(() -> userRepository.findByPhone(username))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() != Role.PARTNER) {
            throw new IllegalArgumentException("Only partners can access attendance.");
        }

        return partnerProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Partner profile not found"));
    }

    private AttendanceResponse toResponse(PartnerAttendance attendance) {
        return AttendanceResponse.builder()
                .attendanceId(attendance.getId())
                .partnerUserId(attendance.getPartnerProfile().getUser().getId())
                .employeeId(attendance.getPartnerProfile().getEmployeeId())
                .partnerName(attendance.getPartnerProfile().getUser().getFullName())
                .attendanceDate(attendance.getAttendanceDate())
                .checkInAt(attendance.getCheckInAt())
                .checkOutAt(attendance.getCheckOutAt())
                .checkedIn(attendance.getCheckInAt() != null)
                .checkedOut(attendance.getCheckOutAt() != null)
                .build();
    }
}
