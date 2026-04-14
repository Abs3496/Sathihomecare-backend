package com.sathihomecare.backend.controller;

import com.sathihomecare.backend.dto.booking.BookingResponse;
import com.sathihomecare.backend.dto.booking.CreateBookingRequest;
import com.sathihomecare.backend.service.BookingService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping("/create")
    public ResponseEntity<BookingResponse> createBooking(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateBookingRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookingService.createBooking(userDetails.getUsername(), request));
    }

    @GetMapping("/my")
    public List<BookingResponse> getMyBookings(@AuthenticationPrincipal UserDetails userDetails) {
        return bookingService.getCustomerBookings(userDetails.getUsername());
    }

    @GetMapping("/{bookingId}")
    public BookingResponse getBookingById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long bookingId
    ) {
        return bookingService.getCustomerBookingById(userDetails.getUsername(), bookingId);
    }

    @PutMapping("/{bookingId}/cancel")
    public BookingResponse cancelBooking(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long bookingId
    ) {
        return bookingService.cancelCustomerBooking(userDetails.getUsername(), bookingId);
    }
}
