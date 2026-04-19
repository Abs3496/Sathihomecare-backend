package com.sathihomecare.backend.repository;

import com.sathihomecare.backend.entity.User;
import com.sathihomecare.backend.entity.enums.Role;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailIgnoreCase(String email);

    Optional<User> findByPhone(String phone);

    List<User> findByRole(Role role);
}
