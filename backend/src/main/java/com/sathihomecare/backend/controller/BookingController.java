package com.sathihomecare.backend.controller;

import com.sathihomecare.backend.dto.booking.BookingResponse;
import com.sathihomecare.backend.dto.booking.CreateBookingRequest;
import com.sathihomecare.backend.service.BookingService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping("/create")
    public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody CreateBookingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookingService.createGuestBooking(request));
    }

    @PostMapping
    public ResponseEntity<BookingResponse> createPublicBooking(@Valid @RequestBody CreateBookingRequest request) {
        return createBooking(request);
    }

    @GetMapping("/track")
    public BookingResponse trackBooking(
            @RequestParam String bookingId,
            @RequestParam String mobileNumber
    ) {
        return bookingService.trackBooking(bookingId, mobileNumber);
    }

    @GetMapping("/receipt")
    public ResponseEntity<byte[]> downloadReceipt(
            @RequestParam String bookingId,
            @RequestParam String mobileNumber
    ) {
        byte[] pdf = bookingService.generateReceipt(bookingId, mobileNumber);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + bookingId + "-receipt.pdf\"")
                .body(pdf);
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
