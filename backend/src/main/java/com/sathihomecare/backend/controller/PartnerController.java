package com.sathihomecare.backend.controller;

import com.sathihomecare.backend.dto.partner.AttendanceResponse;
import com.sathihomecare.backend.dto.partner.PartnerSummaryResponse;
import com.sathihomecare.backend.service.AttendanceService;
import com.sathihomecare.backend.service.ProfileService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/partner")
@RequiredArgsConstructor
public class PartnerController {

    private final ProfileService profileService;
    private final AttendanceService attendanceService;

    @GetMapping("/me")
    public PartnerSummaryResponse getCurrentPartner(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw new AuthenticationCredentialsNotFoundException("Authentication required");
        }
        return profileService.getCurrentPartner(userDetails.getUsername());
    }

    @GetMapping("/attendance")
    public List<AttendanceResponse> getAttendance(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw new AuthenticationCredentialsNotFoundException("Authentication required");
        }
        return attendanceService.getPartnerAttendance(userDetails.getUsername());
    }

    @PostMapping("/attendance/check-in")
    public AttendanceResponse checkIn(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw new AuthenticationCredentialsNotFoundException("Authentication required");
        }
        return attendanceService.checkIn(userDetails.getUsername());
    }

    @PostMapping("/attendance/check-out")
    public AttendanceResponse checkOut(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw new AuthenticationCredentialsNotFoundException("Authentication required");
        }
        return attendanceService.checkOut(userDetails.getUsername());
    }
}
