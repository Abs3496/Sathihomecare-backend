package com.sathihomecare.backend.service;

import com.sathihomecare.backend.entity.Booking;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;

@Service
@RequiredArgsConstructor
public class WhatsAppNotificationService {

    private static final Logger LOGGER = LoggerFactory.getLogger(WhatsAppNotificationService.class);

    private final RestClient.Builder restClientBuilder;

    @Value("${app.whatsapp.api-url:}")
    private String whatsappApiUrl;

    @Value("${app.whatsapp.api-token:}")
    private String whatsappApiToken;

    @Value("${app.whatsapp.business-number:${app.payment.support-whatsapp:918090806731}}")
    private String businessNumber;

    public void notifyBookingCreated(Booking booking) {
        String businessMessage = """
                New SATHIHOMECARE booking
                Booking ID: %s
                Service: %s
                Patient: %s
                Mobile: %s
                Date: %s
                Time: %s
                Address: %s
                """.formatted(
                booking.getBookingCode(),
                booking.getService().getName(),
                booking.getPatientDetails().getPatientName(),
                booking.getCustomerMobile(),
                booking.getPreferredDate(),
                booking.getPreferredTimeSlot(),
                booking.getPatientDetails().getPatientAddress()
        );

        String customerMessage = """
                Thank you for booking SATHIHOMECARE.
                Booking ID: %s
                Service: %s
                Date: %s
                Time: %s
                Status: PENDING
                """.formatted(
                booking.getBookingCode(),
                booking.getService().getName(),
                booking.getPreferredDate(),
                booking.getPreferredTimeSlot()
        );

        sendMessage(businessNumber, businessMessage);
        sendMessage("91" + booking.getCustomerMobile(), customerMessage);
    }

    private void sendMessage(String to, String message) {
        if (!StringUtils.hasText(whatsappApiUrl) || !StringUtils.hasText(whatsappApiToken)) {
            LOGGER.info("WhatsApp API is not configured. Skipping WhatsApp message to {}", to);
            return;
        }

        Map<String, String> payload = new LinkedHashMap<>();
        payload.put("to", to);
        payload.put("message", message);

        try {
            restClientBuilder.build()
                    .post()
                    .uri(whatsappApiUrl)
                    .headers((headers) -> headers.setBearerAuth(whatsappApiToken))
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RuntimeException error) {
            LOGGER.warn("Unable to send WhatsApp notification to {}: {}", to, error.getMessage());
        }
    }
}
