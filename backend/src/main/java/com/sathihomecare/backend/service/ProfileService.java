package com.sathihomecare.backend.service;

import com.sathihomecare.backend.dto.auth.AuthResponse;
import com.sathihomecare.backend.dto.auth.CustomerProfileUpdateRequest;
import com.sathihomecare.backend.dto.partner.PartnerSummaryResponse;
import com.sathihomecare.backend.entity.PartnerProfile;
import com.sathihomecare.backend.entity.User;
import com.sathihomecare.backend.exception.ResourceNotFoundException;
import com.sathihomecare.backend.repository.PartnerProfileRepository;
import com.sathihomecare.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final PartnerProfileRepository partnerProfileRepository;

    @Transactional(readOnly = true)
    public AuthResponse getCurrentCustomer(String username) {
        User user = findUser(username);
        return AuthResponse.builder()
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .build();
    }

    @Transactional
    public AuthResponse updateCurrentCustomer(String username, CustomerProfileUpdateRequest request) {
        User user = findUser(username);
        validateUniqueCustomerContact(user, request.getEmail(), request.getPhone());

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        User savedUser = userRepository.save(user);

        return AuthResponse.builder()
                .userId(savedUser.getId())
                .fullName(savedUser.getFullName())
                .email(savedUser.getEmail())
                .phone(savedUser.getPhone())
                .role(savedUser.getRole())
                .build();
    }

    @Transactional(readOnly = true)
    public PartnerSummaryResponse getCurrentPartner(String username) {
        User user = findUser(username);
        PartnerProfile profile = partnerProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Partner profile not found"));

        return PartnerSummaryResponse.builder()
                .userId(user.getId())
                .profileId(profile.getId())
                .employeeId(profile.getEmployeeId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .professionalRole(profile.getProfessionalRole())
                .address(profile.getAddress())
                .joiningDate(profile.getJoiningDate().toString())
                .status(profile.getStatus())
                .build();
    }

    private User findUser(String username) {
        return userRepository.findByEmail(username)
                .or(() -> userRepository.findByPhone(username))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private void validateUniqueCustomerContact(User currentUser, String email, String phone) {
        userRepository.findByEmail(email)
                .filter(found -> !found.getId().equals(currentUser.getId()))
                .ifPresent(found -> {
                    throw new IllegalArgumentException("Email already registered");
                });

        userRepository.findByPhone(phone)
                .filter(found -> !found.getId().equals(currentUser.getId()))
                .ifPresent(found -> {
                    throw new IllegalArgumentException("Phone already registered");
                });
    }
}
