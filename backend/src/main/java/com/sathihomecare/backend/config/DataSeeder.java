package com.sathihomecare.backend.config;

import com.sathihomecare.backend.entity.ServiceEntity;
import com.sathihomecare.backend.entity.User;
import com.sathihomecare.backend.entity.enums.Role;
import com.sathihomecare.backend.entity.enums.ServiceCategory;
import com.sathihomecare.backend.repository.ServiceRepository;
import com.sathihomecare.backend.repository.UserRepository;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataSeeder {

    private final PasswordEncoder passwordEncoder;
    @Value("${app.bootstrap.admin1.name:}")
    private String adminOneName;
    @Value("${app.bootstrap.admin1.email:}")
    private String adminOneEmail;
    @Value("${app.bootstrap.admin1.phone:}")
    private String adminOnePhone;
    @Value("${app.bootstrap.admin1.password:}")
    private String adminOnePassword;
    @Value("${app.bootstrap.admin2.name:}")
    private String adminTwoName;
    @Value("${app.bootstrap.admin2.email:}")
    private String adminTwoEmail;
    @Value("${app.bootstrap.admin2.phone:}")
    private String adminTwoPhone;
    @Value("${app.bootstrap.admin2.password:}")
    private String adminTwoPassword;

    @Bean
    CommandLineRunner seedData(
            UserRepository userRepository,
            ServiceRepository serviceRepository
    ) {
        return args -> {
            buildAdminSeeds().forEach(adminSeed -> upsertAdmin(userRepository, adminSeed));

            if (serviceRepository.count() == 0) {
                seedService(serviceRepository, "Patient Care at Home", ServiceCategory.NURSING, "Daily bedside support for bedridden patients, hygiene care and comfort monitoring.", new BigDecimal("1500"));
                seedService(serviceRepository, "Elderly Care", ServiceCategory.NURSING, "Senior support including mobility help, medicine reminders and routine assistance.", new BigDecimal("2000"));
                seedService(serviceRepository, "Abhyanga (Full Body Massage)", ServiceCategory.THERAPY, "Traditional warm oil massage for relaxation, circulation and joint comfort.", new BigDecimal("999"));
                seedService(serviceRepository, "Stress & Anxiety Management", ServiceCategory.COUNSELLING, "Supportive counselling session for students and families dealing with stress and anxiety.", new BigDecimal("850"));
            }
        };
    }

    private void seedService(ServiceRepository repository, String name, ServiceCategory category, String description, BigDecimal price) {
        ServiceEntity service = new ServiceEntity();
        service.setName(name);
        service.setCategory(category);
        service.setDescription(description);
        service.setPrice(price);
        repository.save(service);
    }

    private List<AdminSeed> buildAdminSeeds() {
        List<AdminSeed> admins = new ArrayList<>();
        addAdminIfConfigured(admins, adminOneName, adminOneEmail, adminOnePhone, adminOnePassword);
        addAdminIfConfigured(admins, adminTwoName, adminTwoEmail, adminTwoPhone, adminTwoPassword);
        return admins;
    }

    private void addAdminIfConfigured(List<AdminSeed> admins, String name, String email, String phone, String password) {
        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            return;
        }

        admins.add(new AdminSeed(
                name == null || name.isBlank() ? "Sathi Homecare Admin" : name.trim(),
                email.trim(),
                phone == null ? "" : phone.trim(),
                password
        ));
    }

    private void upsertAdmin(UserRepository userRepository, AdminSeed adminSeed) {
        User admin = userRepository.findByEmail(adminSeed.email())
                .orElseGet(User::new);

        admin.setFullName(adminSeed.name());
        admin.setEmail(adminSeed.email());
        admin.setPhone(adminSeed.phone().isBlank() ? null : adminSeed.phone());
        admin.setPassword(passwordEncoder.encode(adminSeed.password()));
        admin.setRole(Role.ADMIN);
        admin.setActive(true);
        userRepository.save(admin);
    }

    private record AdminSeed(String name, String email, String phone, String password) {
    }
}
