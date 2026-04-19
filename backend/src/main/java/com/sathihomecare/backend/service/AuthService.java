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
        String email = normalizeEmail(request.getEmail());
        String phone = normalizePhone(request.getPhone());

        validateRequestedRole(request.getRole());

        userRepository.findByEmailIgnoreCase(email).ifPresent(user -> {
            throw new IllegalArgumentException("Email already registered");
        });
        userRepository.findByPhone(phone).ifPresent(user -> {
            throw new IllegalArgumentException("Phone already registered");
        });

        User user = new User();
        user.setFullName(request.getFullName().trim());
        user.setEmail(email);
        user.setPhone(phone);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.CUSTOMER);

        User savedUser = userRepository.save(user);

        return buildResponse(savedUser, null);
    }

    public AuthResponse loginCustomer(CustomerLoginRequest request) {
        String identifier = normalizeIdentifier(request.getEmailOrPhone());
        User user = userRepository.findByEmailIgnoreCase(identifier)
                .or(() -> userRepository.findByPhone(identifier))
                .filter(found -> found.getRole() == Role.CUSTOMER)
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        validatePassword(request.getPassword(), user.getPassword());
        validateUserIsActive(user);
        return buildResponse(user, null);
    }

    public AuthResponse loginPartner(PartnerLoginRequest request) {
        PartnerProfile profile = partnerProfileRepository.findByEmployeeId(request.getEmployeeId().trim())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        validatePassword(request.getPassword(), profile.getUser().getPassword());
        validateUserIsActive(profile.getUser());
        return buildResponse(profile.getUser(), profile.getEmployeeId());
    }

    public AuthResponse loginAdmin(AdminLoginRequest request) {
        String identifier = normalizeIdentifier(request.getEmailOrPhone());
        User user = userRepository.findByEmailIgnoreCase(identifier)
                .or(() -> userRepository.findByPhone(identifier))
                .filter(found -> found.getRole() == Role.ADMIN)
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        validatePassword(request.getPassword(), user.getPassword());
        validateUserIsActive(user);
        return buildResponse(user, null);
    }

    public AuthResponse login(LoginRequest request) {
        if (request.getEmployeeId() != null && !request.getEmployeeId().isBlank()) {
            PartnerLoginRequest partnerRequest = new PartnerLoginRequest();
            partnerRequest.setEmployeeId(request.getEmployeeId());
            partnerRequest.setPassword(request.getPassword());
            return loginPartner(partnerRequest);
        }

        String emailOrPhone = firstNonBlank(request.getEmail(), request.getEmailOrPhone(), request.getUsername());
        if (emailOrPhone != null && !emailOrPhone.isBlank()) {
            return loginByEmailOrPhone(emailOrPhone, request.getPassword());
        }

        throw new IllegalArgumentException("Either email or employeeId must be provided");
    }

    private AuthResponse loginByEmailOrPhone(String emailOrPhone, String password) {
        String identifier = normalizeIdentifier(emailOrPhone);
        return userRepository.findByEmailIgnoreCase(identifier)
                .or(() -> userRepository.findByPhone(identifier))
                .map(user -> {
                    if (user.getRole() == Role.ADMIN) {
                        AdminLoginRequest adminRequest = new AdminLoginRequest();
                        adminRequest.setEmailOrPhone(identifier);
                        adminRequest.setPassword(password);
                        return loginAdmin(adminRequest);
                    }

                    CustomerLoginRequest customerRequest = new CustomerLoginRequest();
                    customerRequest.setEmailOrPhone(identifier);
                    customerRequest.setPassword(password);
                    return loginCustomer(customerRequest);
                })
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
    }

    private static String firstNonBlank(String... values) {
        if (values == null) {
            return null;
        }
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
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

    private void validateRequestedRole(String requestedRole) {
        if (requestedRole == null || requestedRole.isBlank()) {
            return;
        }

        String normalized = requestedRole.trim().toUpperCase();
        if ("USER".equals(normalized) || "CUSTOMER".equals(normalized)) {
            return;
        }

        throw new IllegalArgumentException("Invalid role");
    }

    private void validateUserIsActive(User user) {
        if (!user.isActive()) {
            throw new IllegalArgumentException("Account is inactive");
        }
    }

    private String normalizeIdentifier(String value) {
        String trimmed = value == null ? "" : value.trim();
        return trimmed.contains("@") ? trimmed.toLowerCase() : trimmed;
    }

    private String normalizeEmail(String value) {
        return normalizeIdentifier(value);
    }

    private String normalizePhone(String value) {
        return value == null ? "" : value.trim();
    }
}
