package com.sathihomecare.backend.controller;

import com.sathihomecare.backend.dto.auth.AdminLoginRequest;
import com.sathihomecare.backend.dto.auth.AuthResponse;
import com.sathihomecare.backend.dto.auth.CustomerLoginRequest;
import com.sathihomecare.backend.dto.auth.CustomerRegisterRequest;
import com.sathihomecare.backend.dto.auth.PartnerLoginRequest;
import com.sathihomecare.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register/customer")
    public ResponseEntity<AuthResponse> registerCustomer(@Valid @RequestBody CustomerRegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.registerCustomer(request));
    }

    @PostMapping("/login/customer")
    public ResponseEntity<AuthResponse> loginCustomer(@Valid @RequestBody CustomerLoginRequest request) {
        return ResponseEntity.ok(authService.loginCustomer(request));
    }

    @PostMapping("/login/partner")
    public ResponseEntity<AuthResponse> loginPartner(@Valid @RequestBody PartnerLoginRequest request) {
        return ResponseEntity.ok(authService.loginPartner(request));
    }

    @PostMapping("/login/admin")
    public ResponseEntity<AuthResponse> loginAdmin(@Valid @RequestBody AdminLoginRequest request) {
        return ResponseEntity.ok(authService.loginAdmin(request));
    }
}
