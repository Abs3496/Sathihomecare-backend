package com.sathihomecare.backend;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sathihomecare.backend.entity.Booking;
import com.sathihomecare.backend.entity.PartnerProfile;
import com.sathihomecare.backend.entity.ServiceEntity;
import com.sathihomecare.backend.entity.User;
import com.sathihomecare.backend.entity.enums.BookingStatus;
import com.sathihomecare.backend.entity.enums.PartnerStatus;
import com.sathihomecare.backend.entity.enums.PaymentStatus;
import com.sathihomecare.backend.entity.enums.Role;
import com.sathihomecare.backend.entity.enums.ServiceCategory;
import com.sathihomecare.backend.repository.BookingRepository;
import com.sathihomecare.backend.repository.PartnerProfileRepository;
import com.sathihomecare.backend.repository.ServiceRepository;
import com.sathihomecare.backend.repository.UserRepository;
import java.math.BigDecimal;
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
    private ServiceRepository serviceRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PartnerProfileRepository partnerProfileRepository;

    @Test
    void publicBookingCreatesPendingGuestBookingWithGeneratedCode() throws Exception {
        ServiceEntity service = createService("Nursing Care");

        MvcResult result = mockMvc.perform(post("/api/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "serviceId", service.getId(),
                                "patientName", "Asha Kumari",
                                "patientAge", 68,
                                "gender", "Female",
                                "mobileNumber", "9876543210",
                                "email", "asha@example.com",
                                "address", "221 Care Street, Patna",
                                "preferredDate", "2026-06-20",
                                "preferredTimeSlot", "10:00 AM - 12:00 PM",
                                "additionalNotes", "Post surgery care"
                        ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.bookingStatus").value("PENDING"))
                .andExpect(jsonPath("$.paymentStatus").value("NOT_REQUIRED"))
                .andExpect(jsonPath("$.customerName").value("Asha Kumari"))
                .andExpect(jsonPath("$.customerMobile").value("9876543210"))
                .andExpect(jsonPath("$.serviceName").value("Nursing Care"))
                .andReturn();

        JsonNode response = objectMapper.readTree(result.getResponse().getContentAsString());
        String bookingCode = response.get("bookingCode").asText();
        assertThat(bookingCode).matches("SHC-2026-\\d{5}");

        Booking saved = bookingRepository.findByBookingCodeIgnoreCase(bookingCode).orElseThrow();
        assertThat(saved.getCustomer()).isNull();
        assertThat(saved.getBookingStatus()).isEqualTo(BookingStatus.PENDING);
        assertThat(saved.getPaymentStatus()).isEqualTo(PaymentStatus.NOT_REQUIRED);
    }

    @Test
    void publicBookingCanBeTrackedAndReceiptDownloaded() throws Exception {
        ServiceEntity service = createService("Physiotherapy");
        String bookingCode = createGuestBooking(service, "9123456780");

        mockMvc.perform(get("/api/bookings/track")
                        .param("bookingId", bookingCode)
                        .param("mobileNumber", "9123456780"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bookingCode").value(bookingCode))
                .andExpect(jsonPath("$.bookingStatus").value("PENDING"));

        MvcResult receipt = mockMvc.perform(get("/api/bookings/receipt")
                        .param("bookingId", bookingCode)
                        .param("mobileNumber", "9123456780"))
                .andExpect(status().isOk())
                .andReturn();

        assertThat(receipt.getResponse().getContentType()).isEqualTo("application/pdf");
        assertThat(receipt.getResponse().getContentAsByteArray()).isNotEmpty();
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

    private String createGuestBooking(ServiceEntity service, String mobileNumber) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "serviceId", service.getId(),
                                "patientName", "Track Patient",
                                "patientAge", 72,
                                "gender", "Male",
                                "mobileNumber", mobileNumber,
                                "email", "track@example.com",
                                "address", "Track Address, Patna",
                                "preferredDate", "2026-07-01",
                                "preferredTimeSlot", "08:00 AM - 10:00 AM",
                                "additionalNotes", "Track test"
                        ))))
                .andExpect(status().isCreated())
                .andReturn();

        return objectMapper.readTree(result.getResponse().getContentAsString()).get("bookingCode").asText();
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

    private ServiceEntity createService(String name) {
        ServiceEntity service = new ServiceEntity();
        service.setName(name);
        service.setCategory(ServiceCategory.NURSING);
        service.setDescription(name + " service");
        service.setPrice(BigDecimal.valueOf(1500));
        service.setActive(true);
        return serviceRepository.save(service);
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
