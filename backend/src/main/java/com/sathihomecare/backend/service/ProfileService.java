package com.sathihomecare.backend.service;

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
        return userRepository.findByEmailIgnoreCase(username)
                .or(() -> userRepository.findByPhone(username))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
