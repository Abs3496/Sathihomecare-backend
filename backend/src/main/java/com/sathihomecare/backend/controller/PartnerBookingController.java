package com.sathihomecare.backend.controller;

import com.sathihomecare.backend.dto.booking.BookingResponse;
import com.sathihomecare.backend.entity.enums.BookingStatus;
import com.sathihomecare.backend.service.BookingService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/partner/bookings")
@RequiredArgsConstructor
public class PartnerBookingController {

    private final BookingService bookingService;

    @GetMapping
    public List<BookingResponse> getAssignedBookings(@AuthenticationPrincipal UserDetails userDetails) {
        return bookingService.getAssignedPartnerBookings(userDetails.getUsername());
    }

    @PatchMapping("/{bookingId}/accept")
    public BookingResponse acceptBooking(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long bookingId
    ) {
        return bookingService.partnerUpdateBookingStatus(userDetails.getUsername(), bookingId, BookingStatus.ACCEPTED);
    }

    @PatchMapping("/{bookingId}/reject")
    public BookingResponse rejectBooking(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long bookingId
    ) {
        return bookingService.partnerUpdateBookingStatus(userDetails.getUsername(), bookingId, BookingStatus.REJECTED);
    }

    @PatchMapping("/{bookingId}/complete")
    public BookingResponse completeBooking(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long bookingId
    ) {
        return bookingService.partnerUpdateBookingStatus(userDetails.getUsername(), bookingId, BookingStatus.COMPLETED);
    }
}
