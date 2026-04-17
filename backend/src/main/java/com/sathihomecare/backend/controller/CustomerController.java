package com.sathihomecare.backend.controller;

import com.sathihomecare.backend.dto.auth.AuthResponse;
import com.sathihomecare.backend.dto.auth.CustomerProfileUpdateRequest;
import com.sathihomecare.backend.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
public class CustomerController {

    private final ProfileService profileService;

    @GetMapping("/me")
    public AuthResponse getCurrentCustomer(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw new AuthenticationCredentialsNotFoundException("Authentication required");
        }
        return profileService.getCurrentCustomer(userDetails.getUsername());
    }

    @PutMapping("/me")
    public AuthResponse updateCurrentCustomer(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CustomerProfileUpdateRequest request
    ) {
        if (userDetails == null) {
            throw new AuthenticationCredentialsNotFoundException("Authentication required");
        }
        return profileService.updateCurrentCustomer(userDetails.getUsername(), request);
    }
}
