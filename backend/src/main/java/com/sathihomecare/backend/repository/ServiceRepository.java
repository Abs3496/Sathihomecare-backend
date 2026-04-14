package com.sathihomecare.backend.repository;

import com.sathihomecare.backend.entity.ServiceEntity;
import com.sathihomecare.backend.entity.enums.ServiceCategory;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceRepository extends JpaRepository<ServiceEntity, Long> {

    List<ServiceEntity> findByCategoryAndActiveTrue(ServiceCategory category);

    List<ServiceEntity> findByActiveTrue();
}
