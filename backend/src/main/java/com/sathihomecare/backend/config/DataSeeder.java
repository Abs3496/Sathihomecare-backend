package com.sathihomecare.backend.config;

import com.sathihomecare.backend.entity.ServiceEntity;
import com.sathihomecare.backend.entity.User;
import com.sathihomecare.backend.entity.enums.Role;
import com.sathihomecare.backend.entity.enums.ServiceCategory;
import com.sathihomecare.backend.repository.ServiceRepository;
import com.sathihomecare.backend.repository.UserRepository;
import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataSeeder {

    private final PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner seedData(
            UserRepository userRepository,
            ServiceRepository serviceRepository
    ) {
        return args -> {
            User admin = userRepository.findAll().stream()
                    .filter(user -> user.getRole() == Role.ADMIN)
                    .findFirst()
                    .orElseGet(User::new);

            admin.setFullName("Abhishek Admin");
            admin.setEmail("Abhishekadmin@sathihomecare.in");
            admin.setPhone("9999999999");
            admin.setPassword(passwordEncoder.encode("adminabhishek@123"));
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);

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
}
