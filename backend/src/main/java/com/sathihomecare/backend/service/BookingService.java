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
import com.sathihomecare.backend.entity.enums.Role;
import com.sathihomecare.backend.exception.ResourceNotFoundException;
import com.sathihomecare.backend.repository.AddressRepository;
import com.sathihomecare.backend.repository.BookingRepository;
import com.sathihomecare.backend.repository.PartnerProfileRepository;
import com.sathihomecare.backend.repository.PatientDetailsRepository;
import com.sathihomecare.backend.repository.ServiceRepository;
import com.sathihomecare.backend.repository.UserRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Locale;
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
    private final BookingReceiptService bookingReceiptService;
    private final BookingEmailService bookingEmailService;
    private final WhatsAppNotificationService whatsAppNotificationService;

    @Transactional
    public BookingResponse createGuestBooking(CreateBookingRequest request) {
        return createBooking(request, null);
    }

    private BookingResponse createBooking(CreateBookingRequest request, User customer) {
        ServiceEntity service = serviceRepository.findById(request.getServiceId())
                .filter(ServiceEntity::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));

        Address address = new Address();
        address.setLineOne(firstText(request.getAddressLineOne(), request.getAddress()));
        address.setLineTwo(request.getAddressLineTwo());
        address.setCity(firstText(request.getCity(), "NA"));
        address.setState(firstText(request.getState(), "NA"));
        address.setPincode(firstText(request.getPincode(), "000000"));
        address.setLandmark(request.getLandmark());
        Address savedAddress = addressRepository.save(address);

        PatientDetails patientDetails = new PatientDetails();
        patientDetails.setPatientName(request.getPatientName());
        patientDetails.setPatientPhone(firstText(request.getPatientPhone(), request.getMobileNumber()));
        patientDetails.setPatientAge(request.getPatientAge());
        patientDetails.setGender(request.getGender());
        patientDetails.setPatientAddress(firstText(request.getPatientAddress(), request.getAddress()));
        patientDetails.setPatientIssues(firstText(request.getPatientIssues(), request.getAdditionalNotes(), ""));
        PatientDetails savedPatientDetails = patientDetailsRepository.save(patientDetails);

        Booking booking = new Booking();
        booking.setBookingCode(generateBookingCode(request.getPreferredDate()));
        booking.setCustomer(customer);
        booking.setCustomerName(customer != null ? customer.getFullName() : request.getPatientName());
        booking.setCustomerMobile(request.getMobileNumber());
        booking.setCustomerEmail(request.getEmail());
        booking.setService(service);
        booking.setServiceAddress(savedAddress);
        booking.setPatientDetails(savedPatientDetails);
        booking.setPreferredDate(request.getPreferredDate());
        booking.setPreferredTimeSlot(request.getPreferredTimeSlot());
        booking.setBookingDateTime(LocalDateTime.of(request.getPreferredDate(), LocalTime.of(10, 0)));
        booking.setAdditionalNotes(request.getAdditionalNotes());
        booking.setTotalAmount(service.getPrice());
        booking.setBookingStatus(BookingStatus.PENDING);

        Booking savedBooking = bookingRepository.save(booking);
        byte[] receiptPdf = bookingReceiptService.generateReceipt(savedBooking);
        bookingEmailService.sendBookingReceipt(savedBooking, receiptPdf);
        whatsAppNotificationService.notifyBookingCreated(savedBooking);
        return toResponse(savedBooking);
    }

    @Transactional(readOnly = true)
    public BookingResponse trackBooking(String bookingCode, String mobileNumber) {
        Booking booking = bookingRepository.findByBookingCodeIgnoreCase(bookingCode)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        if (!booking.getCustomerMobile().equals(mobileNumber)) {
            throw new ResourceNotFoundException("Booking not found");
        }
        return toResponse(booking);
    }

    @Transactional(readOnly = true)
    public byte[] generateReceipt(String bookingCode, String mobileNumber) {
        Booking booking = bookingRepository.findByBookingCodeIgnoreCase(bookingCode)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        if (!booking.getCustomerMobile().equals(mobileNumber)) {
            throw new ResourceNotFoundException("Booking not found");
        }
        return bookingReceiptService.generateReceipt(booking);
    }

    @Transactional(readOnly = true)
    public byte[] generateAdminReceipt(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        return bookingReceiptService.generateReceipt(booking);
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
        return userRepository.findByEmailIgnoreCase(username)
                .or(() -> userRepository.findByPhone(username))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private BookingResponse toResponse(Booking booking) {
        PartnerProfile partnerProfile = booking.getAssignedPartner() == null
                ? null
                : partnerProfileRepository.findByUser(booking.getAssignedPartner()).orElse(null);

        return BookingResponse.builder()
                .id(booking.getId())
                .bookingCode(booking.getBookingCode())
                .customerId(booking.getCustomer() != null ? booking.getCustomer().getId() : null)
                .customerName(booking.getCustomerName())
                .customerEmail(booking.getCustomerEmail())
                .customerMobile(booking.getCustomerMobile())
                .serviceId(booking.getService().getId())
                .serviceName(booking.getService().getName())
                .serviceCategory(booking.getService().getCategory())
                .serviceDescription(booking.getService().getDescription())
                .totalAmount(booking.getTotalAmount())
                .bookingStatus(booking.getBookingStatus())
                .bookingDateTime(booking.getBookingDateTime())
                .preferredDate(booking.getPreferredDate())
                .preferredTimeSlot(booking.getPreferredTimeSlot())
                .additionalNotes(booking.getAdditionalNotes())
                .partnerId(booking.getAssignedPartner() != null ? booking.getAssignedPartner().getId() : null)
                .partnerName(booking.getAssignedPartner() != null ? booking.getAssignedPartner().getFullName() : null)
                .partnerEmployeeId(partnerProfile != null ? partnerProfile.getEmployeeId() : null)
                .patientName(booking.getPatientDetails().getPatientName())
                .patientAge(booking.getPatientDetails().getPatientAge())
                .patientGender(booking.getPatientDetails().getGender())
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

    private String generateBookingCode(LocalDate preferredDate) {
        int year = preferredDate.getYear();
        long sequence = bookingRepository.count() + 1;
        String code;
        do {
            code = String.format(Locale.ROOT, "SHC-%d-%05d", year, sequence++);
        } while (bookingRepository.existsByBookingCode(code));
        return code;
    }

    private String firstText(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value.trim();
            }
        }
        return "";
    }
}
