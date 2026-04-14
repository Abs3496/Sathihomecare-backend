package com.sathihomecare.backend.repository;

import com.sathihomecare.backend.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AddressRepository extends JpaRepository<Address, Long> {
}
