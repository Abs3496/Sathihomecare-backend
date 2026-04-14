package com.sathihomecare.backend;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sathihomecare.backend.entity.PartnerProfile;
import com.sathihomecare.backend.entity.User;
import com.sathihomecare.backend.entity.enums.PartnerStatus;
import com.sathihomecare.backend.entity.enums.Role;
import com.sathihomecare.backend.repository.PartnerProfileRepository;
import com.sathihomecare.backend.repository.UserRepository;
import java.time.LocalDate;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class BackendIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PartnerProfileRepository partnerProfileRepository;

    @Test
    void registerRejectsDuplicatePhone() throws Exception {
        registerCustomerAndReturnToken("first-customer@sathi.com", "9123456789");

        mockMvc.perform(post("/api/auth/register/customer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "fullName", "Duplicate Phone User",
                                "email", "dup-phone@sathi.com",
                                "phone", "9123456789",
                                "password", "secret123"
                        ))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Phone already registered"));
    }

    @Test
    void customerCanUpdateOwnProfile() throws Exception {
        String token = registerCustomerAndReturnToken("profile-user@sathi.com", "9000000011");

        mockMvc.perform(put("/api/customer/me")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "fullName", "Updated Profile User",
                                "email", "profile-user-updated@sathi.com",
                                "phone", "9000000022"
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Updated Profile User"))
                .andExpect(jsonPath("$.email").value("profile-user-updated@sathi.com"))
                .andExpect(jsonPath("$.phone").value("9000000022"));

        User updatedUser = userRepository.findByEmail("profile-user-updated@sathi.com").orElseThrow();
        assertThat(updatedUser.getFullName()).isEqualTo("Updated Profile User");
        assertThat(updatedUser.getPhone()).isEqualTo("9000000022");
    }

    @Test
    void adminCannotUpdatePartnerWithDuplicateEmail() throws Exception {
        String adminToken = loginAdminAndReturnToken();
        User partnerUser = createPartnerUser();

        mockMvc.perform(put("/api/admin/partners/{partnerId}", partnerUser.getId())
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "employeeId", "EMP123",
                                "fullName", "Ravi Kumar",
                                "email", "Abhishekadmin@sathihomecare.in",
                                "phone", "9876543210",
                                "professionalRole", "Nurse",
                                "address", "Gonda, UP",
                                "joiningDate", LocalDate.of(2024, 1, 1),
                                "status", PartnerStatus.ONLINE
                        ))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Email already in use"));
    }

    private String registerCustomerAndReturnToken(String email, String phone) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/register/customer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "fullName", "Profile User",
                                "email", email,
                                "phone", phone,
                                "password", "secret123"
                        ))))
                .andExpect(status().isCreated())
                .andReturn();

        return readToken(result);
    }

    private String loginAdminAndReturnToken() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login/admin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "emailOrPhone", "Abhishekadmin@sathihomecare.in",
                                "password", "adminabhishek@123"
                        ))))
                .andExpect(status().isOk())
                .andReturn();

        return readToken(result);
    }

    private String readToken(MvcResult result) throws Exception {
        JsonNode jsonNode = objectMapper.readTree(result.getResponse().getContentAsString());
        return jsonNode.get("token").asText();
    }

    private User createPartnerUser() {
        User partnerUser = new User();
        partnerUser.setFullName("Ravi Kumar");
        partnerUser.setEmail("ravi@sathi.com");
        partnerUser.setPhone("9876543210");
        partnerUser.setPassword("encoded-password");
        partnerUser.setRole(Role.PARTNER);
        User savedPartner = userRepository.save(partnerUser);

        PartnerProfile profile = new PartnerProfile();
        profile.setUser(savedPartner);
        profile.setEmployeeId("EMP123");
        profile.setProfessionalRole("Nurse");
        profile.setAddress("Gonda, UP");
        profile.setJoiningDate(LocalDate.of(2024, 1, 1));
        profile.setStatus(PartnerStatus.ONLINE);
        partnerProfileRepository.save(profile);

        return savedPartner;
    }
}
