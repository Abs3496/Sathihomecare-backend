package com.sathihomecare.backend.service;

import com.sathihomecare.backend.dto.auth.AdminLoginRequest;
import com.sathihomecare.backend.dto.auth.AuthResponse;
import com.sathihomecare.backend.dto.auth.CustomerLoginRequest;
import com.sathihomecare.backend.dto.auth.CustomerRegisterRequest;
import com.sathihomecare.backend.dto.auth.PartnerLoginRequest;
import com.sathihomecare.backend.entity.PartnerProfile;
import com.sathihomecare.backend.entity.User;
import com.sathihomecare.backend.entity.enums.Role;
import com.sathihomecare.backend.exception.ResourceNotFoundException;
import com.sathihomecare.backend.repository.PartnerProfileRepository;
import com.sathihomecare.backend.repository.UserRepository;
import com.sathihomecare.backend.security.CustomUserDetails;
import com.sathihomecare.backend.security.JwtService;
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
        user.setRole(Role.CUSTOMER);
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
                .build();
    }

    private void validatePassword(String rawPassword, String encodedPassword) {
        if (!passwordEncoder.matches(rawPassword, encodedPassword)) {
            throw new IllegalArgumentException("Invalid credentials");
        }
    }
}
