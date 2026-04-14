package com.sathihomecare.backend.controller;

import com.sathihomecare.backend.dto.partner.PartnerSummaryResponse;
import com.sathihomecare.backend.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/partner")
@RequiredArgsConstructor
public class PartnerController {

    private final ProfileService profileService;

    @GetMapping("/me")
    public PartnerSummaryResponse getCurrentPartner(@AuthenticationPrincipal UserDetails userDetails) {
        return profileService.getCurrentPartner(userDetails.getUsername());
    }
}
