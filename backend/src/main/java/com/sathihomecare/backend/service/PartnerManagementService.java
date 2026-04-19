package com.sathihomecare.backend.service;

import com.sathihomecare.backend.dto.partner.PartnerCreateRequest;
import com.sathihomecare.backend.dto.partner.PartnerSummaryResponse;
import com.sathihomecare.backend.dto.partner.PartnerUpdateRequest;
import com.sathihomecare.backend.entity.PartnerProfile;
import com.sathihomecare.backend.entity.User;
import com.sathihomecare.backend.entity.enums.Role;
import com.sathihomecare.backend.exception.ResourceNotFoundException;
import com.sathihomecare.backend.repository.PartnerProfileRepository;
import com.sathihomecare.backend.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PartnerManagementService {

    private final UserRepository userRepository;
    private final PartnerProfileRepository partnerProfileRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<PartnerSummaryResponse> getAllPartners() {
        return userRepository.findByRole(Role.PARTNER).stream()
                .map(user -> partnerProfileRepository.findByUser(user)
                        .map(profile -> toSummary(user, profile))
                        .orElse(null))
                .filter(java.util.Objects::nonNull)
                .toList();
    }

    @Transactional
    public PartnerSummaryResponse createPartner(PartnerCreateRequest request) {
        if (userRepository.findByEmailIgnoreCase(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already in use");
        }
        if (userRepository.findByPhone(request.getPhone()).isPresent()) {
            throw new IllegalArgumentException("Phone already in use");
        }
        if (partnerProfileRepository.findByEmployeeId(request.getEmployeeId()).isPresent()) {
            throw new IllegalArgumentException("Employee ID already exists");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.PARTNER);
        User savedUser = userRepository.save(user);

        PartnerProfile profile = new PartnerProfile();
        profile.setUser(savedUser);
        profile.setEmployeeId(request.getEmployeeId());
        profile.setProfessionalRole(request.getProfessionalRole());
        profile.setAddress(request.getAddress());
        profile.setJoiningDate(request.getJoiningDate());
        partnerProfileRepository.save(profile);

        return toSummary(savedUser, profile);
    }

    @Transactional
    public PartnerSummaryResponse updatePartner(Long partnerId, PartnerUpdateRequest request) {
        User user = userRepository.findById(partnerId)
                .orElseThrow(() -> new ResourceNotFoundException("Partner user not found"));
        if (user.getRole() != Role.PARTNER) {
            throw new IllegalArgumentException("User is not a partner");
        }

        PartnerProfile profile = partnerProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Partner profile not found"));

        userRepository.findByEmailIgnoreCase(request.getEmail())
                .filter(found -> !found.getId().equals(user.getId()))
                .ifPresent(found -> {
                    throw new IllegalArgumentException("Email already in use");
                });
        userRepository.findByPhone(request.getPhone())
                .filter(found -> !found.getId().equals(user.getId()))
                .ifPresent(found -> {
                    throw new IllegalArgumentException("Phone already in use");
                });
        partnerProfileRepository.findByEmployeeId(request.getEmployeeId())
                .filter(found -> !found.getId().equals(profile.getId()))
                .ifPresent(found -> {
                    throw new IllegalArgumentException("Employee ID already exists");
                });

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        userRepository.save(user);

        profile.setEmployeeId(request.getEmployeeId());
        profile.setProfessionalRole(request.getProfessionalRole());
        profile.setAddress(request.getAddress());
        profile.setJoiningDate(request.getJoiningDate());
        profile.setStatus(request.getStatus());
        partnerProfileRepository.save(profile);

        return toSummary(user, profile);
    }

    @Transactional
    public void deletePartner(Long partnerId) {
        User user = userRepository.findById(partnerId)
                .orElseThrow(() -> new ResourceNotFoundException("Partner user not found"));
        PartnerProfile profile = partnerProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Partner profile not found"));
        partnerProfileRepository.delete(profile);
        userRepository.delete(user);
    }

    private PartnerSummaryResponse toSummary(User user, PartnerProfile profile) {
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
}
