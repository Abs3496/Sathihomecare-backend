package com.sathihomecare.backend.controller;

import com.sathihomecare.backend.dto.auth.AdminLoginRequest;
import com.sathihomecare.backend.dto.auth.AuthResponse;
import com.sathihomecare.backend.dto.auth.LoginRequest;
import com.sathihomecare.backend.dto.auth.PartnerLoginRequest;
import com.sathihomecare.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login/partner")
    public AuthResponse loginPartner(@Valid @RequestBody PartnerLoginRequest request) {
        return authService.loginPartner(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/login/admin")
    public AuthResponse loginAdmin(@Valid @RequestBody AdminLoginRequest request) {
        return authService.loginAdmin(request);
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw new AuthenticationCredentialsNotFoundException("Authentication required");
        }
        return authService.refresh(userDetails.getUsername());
    }
}
