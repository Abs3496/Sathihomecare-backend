package com.sathihomecare.backend.service;

import com.sathihomecare.backend.dto.auth.AdminLoginRequest;
import com.sathihomecare.backend.dto.auth.AuthResponse;
import com.sathihomecare.backend.dto.auth.CustomerLoginRequest;
import com.sathihomecare.backend.dto.auth.CustomerRegisterRequest;
import com.sathihomecare.backend.dto.auth.LoginRequest;
import com.sathihomecare.backend.dto.auth.PartnerLoginRequest;
import com.sathihomecare.backend.entity.PartnerProfile;
import com.sathihomecare.backend.entity.User;
import com.sathihomecare.backend.entity.enums.Role;
import com.sathihomecare.backend.exception.ResourceNotFoundException;
import com.sathihomecare.backend.repository.PartnerProfileRepository;
import com.sathihomecare.backend.repository.UserRepository;
import com.sathihomecare.backend.security.CustomUserDetails;
import com.sathihomecare.backend.security.JwtService;
import java.time.Instant;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PartnerProfileRepository partnerProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponse registerCustomer(CustomerRegisterRequest request) {
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            throw new IllegalArgumentException("Email already registered");
        });
        userRepository.findByPhone(request.getPhone()).ifPresent(user -> {
            throw new IllegalArgumentException("Phone already registered");
        });

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        if (request.getRole() == null) {
            user.setRole(Role.PARTNER);
        } else {
            try {
                user.setRole(Role.valueOf(request.getRole().toUpperCase()));
            } catch (Exception e) {
                throw new RuntimeException("Invalid role");
            }
        }

        User savedUser = userRepository.save(user);

        return buildResponse(savedUser, null);
    }

    public AuthResponse loginCustomer(CustomerLoginRequest request) {
        User user = userRepository.findByEmail(request.getEmailOrPhone())
                .or(() -> userRepository.findByPhone(request.getEmailOrPhone()))
                .filter(found -> found.getRole() == Role.CUSTOMER)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        validatePassword(request.getPassword(), user.getPassword());
        return buildResponse(user, null);
    }

    public AuthResponse loginPartner(PartnerLoginRequest request) {
        PartnerProfile profile = partnerProfileRepository.findByEmployeeId(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Partner not found"));

        validatePassword(request.getPassword(), profile.getUser().getPassword());
        return buildResponse(profile.getUser(), profile.getEmployeeId());
    }

    public AuthResponse loginAdmin(AdminLoginRequest request) {
        User user = userRepository.findByEmail(request.getEmailOrPhone())
                .or(() -> userRepository.findByPhone(request.getEmailOrPhone()))
                .filter(found -> found.getRole() == Role.ADMIN)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        validatePassword(request.getPassword(), user.getPassword());
        return buildResponse(user, null);
    }

    public AuthResponse login(LoginRequest request) {
        if (request.getEmployeeId() != null && !request.getEmployeeId().isBlank()) {
            PartnerLoginRequest partnerRequest = new PartnerLoginRequest();
            partnerRequest.setEmployeeId(request.getEmployeeId());
            partnerRequest.setPassword(request.getPassword());
            return loginPartner(partnerRequest);
        }

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            CustomerLoginRequest customerRequest = new CustomerLoginRequest();
            customerRequest.setEmailOrPhone(request.getEmail());
            customerRequest.setPassword(request.getPassword());
            return loginCustomer(customerRequest);
        }

        throw new IllegalArgumentException("Either email or employeeId must be provided");
    }

    private AuthResponse buildResponse(User user, String employeeId) {
        String token = jwtService.generateToken(
                new CustomUserDetails(user),
                Map.of("role", user.getRole().name())
        );

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .employeeId(employeeId)
                .expiresAt(Instant.ofEpochMilli(jwtService.getExpirationTimestamp(token)))
                .build();
    }

    private void validatePassword(String rawPassword, String encodedPassword) {
        if (!passwordEncoder.matches(rawPassword, encodedPassword)) {
            throw new IllegalArgumentException("Invalid credentials");
        }
    }
}
