package com.sathihomecare.backend.controller;

import com.sathihomecare.backend.dto.partner.AttendanceResponse;
import com.sathihomecare.backend.dto.booking.BookingResponse;
import com.sathihomecare.backend.dto.partner.PartnerCreateRequest;
import com.sathihomecare.backend.dto.partner.PartnerSummaryResponse;
import com.sathihomecare.backend.dto.partner.PartnerUpdateRequest;
import com.sathihomecare.backend.dto.service.ServiceRequest;
import com.sathihomecare.backend.dto.service.ServiceResponse;
import com.sathihomecare.backend.entity.enums.BookingStatus;
import com.sathihomecare.backend.service.AttendanceService;
import com.sathihomecare.backend.service.BookingService;
import com.sathihomecare.backend.service.PartnerManagementService;
import com.sathihomecare.backend.service.ServiceCatalogService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final BookingService bookingService;
    private final PartnerManagementService partnerManagementService;
    private final ServiceCatalogService serviceCatalogService;
    private final AttendanceService attendanceService;

    @GetMapping("/bookings")
    public List<BookingResponse> getAllBookings() {
        return bookingService.getAllBookings();
    }

    @PatchMapping("/bookings/{bookingId}/assign/{partnerUserId}")
    public BookingResponse assignPartner(
            @PathVariable Long bookingId,
            @PathVariable Long partnerUserId
    ) {
        return bookingService.assignPartner(bookingId, partnerUserId);
    }

    @PatchMapping("/bookings/{bookingId}/status/{status}")
    public BookingResponse updateBookingStatus(
            @PathVariable Long bookingId,
            @PathVariable BookingStatus status
    ) {
        return bookingService.adminUpdateBookingStatus(bookingId, status);
    }

    @GetMapping("/partners")
    public List<PartnerSummaryResponse> getPartners() {
        return partnerManagementService.getAllPartners();
    }

    @GetMapping("/attendance")
    public List<AttendanceResponse> getAttendance() {
        return attendanceService.getAllAttendance();
    }

    @PostMapping("/partners")
    public ResponseEntity<PartnerSummaryResponse> createPartner(
            @Valid @RequestBody PartnerCreateRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(partnerManagementService.createPartner(request));
    }

    @PutMapping("/partners/{partnerId}")
    public PartnerSummaryResponse updatePartner(
            @PathVariable Long partnerId,
            @Valid @RequestBody PartnerUpdateRequest request
    ) {
        return partnerManagementService.updatePartner(partnerId, request);
    }

    @DeleteMapping("/partners/{partnerId}")
    public ResponseEntity<Void> deletePartner(@PathVariable Long partnerId) {
        partnerManagementService.deletePartner(partnerId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/services")
    public ResponseEntity<ServiceResponse> createService(@Valid @RequestBody ServiceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(serviceCatalogService.createService(request));
    }

    @PutMapping("/services/{serviceId}")
    public ServiceResponse updateService(
            @PathVariable Long serviceId,
            @Valid @RequestBody ServiceRequest request
    ) {
        return serviceCatalogService.updateService(serviceId, request);
    }

    @DeleteMapping("/services/{serviceId}")
    public ResponseEntity<Void> deleteService(@PathVariable Long serviceId) {
        serviceCatalogService.deactivateService(serviceId);
        return ResponseEntity.noContent().build();
    }
}
