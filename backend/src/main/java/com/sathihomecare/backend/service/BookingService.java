package com.sathihomecare.backend.service;

import com.sathihomecare.backend.dto.booking.BookingResponse;
import com.sathihomecare.backend.dto.booking.CreateBookingRequest;
import com.sathihomecare.backend.entity.Address;
import com.sathihomecare.backend.entity.Booking;
import com.sathihomecare.backend.entity.PartnerProfile;
import com.sathihomecare.backend.entity.PatientDetails;
import com.sathihomecare.backend.entity.ServiceEntity;
import com.sathihomecare.backend.entity.User;
import com.sathihomecare.backend.entity.enums.BookingStatus;
import com.sathihomecare.backend.entity.enums.PaymentStatus;
import com.sathihomecare.backend.entity.enums.Role;
import com.sathihomecare.backend.exception.ResourceNotFoundException;
import com.sathihomecare.backend.repository.AddressRepository;
import com.sathihomecare.backend.repository.BookingRepository;
import com.sathihomecare.backend.repository.PartnerProfileRepository;
import com.sathihomecare.backend.repository.PatientDetailsRepository;
import com.sathihomecare.backend.repository.ServiceRepository;
import com.sathihomecare.backend.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ServiceRepository serviceRepository;
    private final AddressRepository addressRepository;
    private final PatientDetailsRepository patientDetailsRepository;
    private final PartnerProfileRepository partnerProfileRepository;

    @Transactional
    public BookingResponse createBooking(String username, CreateBookingRequest request) {
        User customer = getUserByUsername(username);
        if (customer.getRole() != Role.CUSTOMER) {
            throw new IllegalArgumentException("Only customers can create bookings");
        }

        ServiceEntity service = serviceRepository.findById(request.getServiceId())
                .filter(ServiceEntity::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));

        Address address = new Address();
        address.setLineOne(request.getAddressLineOne());
        address.setLineTwo(request.getAddressLineTwo());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setPincode(request.getPincode());
        address.setLandmark(request.getLandmark());
        Address savedAddress = addressRepository.save(address);

        PatientDetails patientDetails = new PatientDetails();
        patientDetails.setPatientName(request.getPatientName());
        patientDetails.setPatientPhone(request.getPatientPhone());
        patientDetails.setPatientAge(request.getPatientAge());
        patientDetails.setPatientAddress(request.getPatientAddress());
        patientDetails.setPatientIssues(request.getPatientIssues());
        PatientDetails savedPatientDetails = patientDetailsRepository.save(patientDetails);

        Booking booking = new Booking();
        booking.setCustomer(customer);
        booking.setService(service);
        booking.setServiceAddress(savedAddress);
        booking.setPatientDetails(savedPatientDetails);
        booking.setBookingDateTime(request.getBookingDateTime());
        booking.setTotalAmount(service.getPrice());
        booking.setBookingStatus(BookingStatus.PENDING_PAYMENT);
        booking.setPaymentStatus(PaymentStatus.PENDING);

        return toResponse(bookingRepository.save(booking));
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getCustomerBookings(String username) {
        User customer = getUserByUsername(username);
        return bookingRepository.findByCustomer(customer).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public BookingResponse getCustomerBookingById(String username, Long bookingId) {
        User customer = getUserByUsername(username);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getCustomer().getId().equals(customer.getId())) {
            throw new IllegalArgumentException("Booking does not belong to this customer");
        }

        return toResponse(booking);
    }

    @Transactional
    public BookingResponse cancelCustomerBooking(String username, Long bookingId) {
        User customer = getUserByUsername(username);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getCustomer().getId().equals(customer.getId())) {
            throw new IllegalArgumentException("You can only cancel your own bookings");
        }

        if (booking.getBookingStatus() == BookingStatus.COMPLETED) {
            throw new IllegalArgumentException("Completed booking cannot be cancelled");
        }

        booking.setBookingStatus(BookingStatus.CANCELLED);
        if (booking.getPaymentStatus() == PaymentStatus.PENDING) {
            booking.setPaymentStatus(PaymentStatus.FAILED);
        }
        return toResponse(bookingRepository.save(booking));
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getAssignedPartnerBookings(String username) {
        User partner = getUserByUsername(username);
        return bookingRepository.findByAssignedPartner(partner).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public BookingResponse partnerUpdateBookingStatus(String username, Long bookingId, BookingStatus targetStatus) {
        User partner = getUserByUsername(username);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (booking.getAssignedPartner() == null || !booking.getAssignedPartner().getId().equals(partner.getId())) {
            throw new IllegalArgumentException("Booking is not assigned to this partner");
        }

        BookingStatus currentStatus = booking.getBookingStatus();
        boolean validTransition =
                (targetStatus == BookingStatus.ACCEPTED && currentStatus == BookingStatus.ASSIGNED)
                        || (targetStatus == BookingStatus.REJECTED && currentStatus == BookingStatus.ASSIGNED)
                        || (targetStatus == BookingStatus.COMPLETED && currentStatus == BookingStatus.ACCEPTED);

        if (!validTransition) {
            throw new IllegalArgumentException("Invalid booking status transition");
        }

        booking.setBookingStatus(targetStatus);
        return toResponse(bookingRepository.save(booking));
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public BookingResponse assignPartner(Long bookingId, Long partnerUserId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        User partner = userRepository.findById(partnerUserId)
                .filter(user -> user.getRole() == Role.PARTNER)
                .orElseThrow(() -> new ResourceNotFoundException("Partner not found"));

        booking.setAssignedPartner(partner);
        if (booking.getPaymentStatus() != PaymentStatus.SUCCESS) {
            throw new IllegalArgumentException("Booking must be paid before assigning a partner");
        }
        booking.setBookingStatus(BookingStatus.ASSIGNED);
        return toResponse(bookingRepository.save(booking));
    }

    @Transactional
    public BookingResponse adminUpdateBookingStatus(Long bookingId, BookingStatus targetStatus) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        booking.setBookingStatus(targetStatus);
        return toResponse(bookingRepository.save(booking));
    }

    private User getUserByUsername(String username) {
        return userRepository.findByEmail(username)
                .or(() -> userRepository.findByPhone(username))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private BookingResponse toResponse(Booking booking) {
        PartnerProfile partnerProfile = booking.getAssignedPartner() == null
                ? null
                : partnerProfileRepository.findByUser(booking.getAssignedPartner()).orElse(null);

        return BookingResponse.builder()
                .id(booking.getId())
                .customerId(booking.getCustomer().getId())
                .customerName(booking.getCustomer().getFullName())
                .serviceId(booking.getService().getId())
                .serviceName(booking.getService().getName())
                .serviceCategory(booking.getService().getCategory())
                .serviceDescription(booking.getService().getDescription())
                .totalAmount(booking.getTotalAmount())
                .bookingStatus(booking.getBookingStatus())
                .paymentStatus(booking.getPaymentStatus())
                .bookingDateTime(booking.getBookingDateTime())
                .partnerId(booking.getAssignedPartner() != null ? booking.getAssignedPartner().getId() : null)
                .partnerName(booking.getAssignedPartner() != null ? booking.getAssignedPartner().getFullName() : null)
                .partnerEmployeeId(partnerProfile != null ? partnerProfile.getEmployeeId() : null)
                .patientName(booking.getPatientDetails().getPatientName())
                .patientAge(booking.getPatientDetails().getPatientAge())
                .patientPhone(booking.getPatientDetails().getPatientPhone())
                .patientIssues(booking.getPatientDetails().getPatientIssues())
                .fullAddress(formatAddress(booking.getServiceAddress()))
                .build();
    }

    private String formatAddress(Address address) {
        String lineTwo = address.getLineTwo() == null || address.getLineTwo().isBlank() ? "" : ", " + address.getLineTwo();
        String landmark = address.getLandmark() == null || address.getLandmark().isBlank() ? "" : ", " + address.getLandmark();
        return address.getLineOne() + lineTwo + ", " + address.getCity() + ", " + address.getState() + " - " + address.getPincode() + landmark;
    }
}
