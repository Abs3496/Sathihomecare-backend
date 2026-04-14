package com.sathihomecare.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "patient_details")
public class PatientDetails extends BaseEntity {

    @Column(nullable = false)
    private String patientName;

    @Column(nullable = false)
    private String patientPhone;

    @Column(nullable = false)
    private Integer patientAge;

    @Column(nullable = false, length = 1000)
    private String patientAddress;

    @Column(nullable = false, length = 2000)
    private String patientIssues;
}
