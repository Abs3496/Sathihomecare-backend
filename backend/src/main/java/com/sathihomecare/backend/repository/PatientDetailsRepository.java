package com.sathihomecare.backend.repository;

import com.sathihomecare.backend.entity.PatientDetails;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PatientDetailsRepository extends JpaRepository<PatientDetails, Long> {
}
