package com.sathihomecare.backend.entity;

import com.sathihomecare.backend.entity.enums.BookingStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "bookings")
public class Booking extends BaseEntity {

    @Column(nullable = false, unique = true, length = 20)
    private String bookingCode;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private User customer;

    @Column(nullable = false)
    private String customerName;

    @Column(nullable = false)
    private String customerMobile;

    @Column(nullable = false)
    private String customerEmail;

    @ManyToOne
    @JoinColumn(name = "partner_id")
    private User assignedPartner;

    @ManyToOne(optional = false)
    @JoinColumn(name = "service_id", nullable = false)
    private ServiceEntity service;

    @OneToOne(optional = false)
    @JoinColumn(name = "patient_details_id", nullable = false)
    private PatientDetails patientDetails;

    @ManyToOne(optional = false)
    @JoinColumn(name = "address_id", nullable = false)
    private Address serviceAddress;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus bookingStatus = BookingStatus.PENDING;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(nullable = false)
    private LocalDateTime bookingDateTime;

    @Column(nullable = false)
    private LocalDate preferredDate;

    @Column(nullable = false)
    private String preferredTimeSlot;

    @Column(length = 2000)
    private String additionalNotes;
}
