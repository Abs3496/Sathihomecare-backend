package com.sathihomecare.backend.service;

import com.sathihomecare.backend.entity.Booking;
import com.sathihomecare.backend.entity.Payment;
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
public class BookingEmailService {

    private static final Logger LOGGER = LoggerFactory.getLogger(BookingEmailService.class);

    private final RestClient.Builder restClientBuilder;

    @Value("${app.email.resend-api-key:}")
    private String resendApiKey;

    @Value("${app.email.from:SATHIHOMECARE <bookings@sathihomecare.com>}")
    private String fromAddress;

    @Value("${app.email.admin-to:}")
    private String adminEmail;

    @Value("${app.payment.support-whatsapp:918090806731}")
    private String supportWhatsapp;

    public void sendPaymentConfirmation(Booking booking, Payment payment) {
        if (!StringUtils.hasText(resendApiKey)) {
            LOGGER.info("Resend API key not configured. Skipping confirmation email for booking {}", booking.getId());
            return;
        }

        String customerEmail = booking.getCustomer().getEmail();
        if (StringUtils.hasText(customerEmail)) {
            sendEmail(
                    customerEmail,
                    "SATHIHOMECARE booking confirmation #" + booking.getId(),
                    buildCustomerHtml(booking, payment)
            );
        }

        if (StringUtils.hasText(adminEmail)) {
            sendEmail(
                    adminEmail,
                    "New paid booking #" + booking.getId(),
                    buildAdminHtml(booking, payment)
            );
        }
    }

    private void sendEmail(String to, String subject, String html) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("from", fromAddress);
        payload.put("to", new String[] { to });
        payload.put("subject", subject);
        payload.put("html", html);

        try {
            restClientBuilder.build()
                    .post()
                    .uri("https://api.resend.com/emails")
                    .headers((headers) -> headers.setBearerAuth(resendApiKey))
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RuntimeException error) {
            LOGGER.warn("Unable to send booking email to {}: {}", to, error.getMessage());
        }
    }

    private String buildCustomerHtml(Booking booking, Payment payment) {
        return """
                <div style="font-family:Arial,sans-serif;color:#102542;line-height:1.6">
                  <h1 style="color:#102542">Booking confirmed</h1>
                  <p>Thank you for choosing SATHIHOMECARE. Your payment proof has been recorded and your care request is now confirmed.</p>
                  %s
                  <p><strong>Need Help?</strong> Contact support on WhatsApp: <a href="https://wa.me/%s?text=I%%20need%%20help%%20with%%20booking%%20%s">Chat with support</a></p>
                </div>
                """.formatted(buildDetailsTable(booking, payment), supportWhatsapp, booking.getId());
    }

    private String buildAdminHtml(Booking booking, Payment payment) {
        return """
                <div style="font-family:Arial,sans-serif;color:#102542;line-height:1.6">
                  <h1>New paid booking</h1>
                  <p>A customer has submitted UPI payment details. Please verify the UTR and assign care staff.</p>
                  %s
                </div>
                """.formatted(buildDetailsTable(booking, payment));
    }

    private String buildDetailsTable(Booking booking, Payment payment) {
        return """
                <table style="border-collapse:collapse;width:100%%;max-width:620px">
                  <tr><td style="padding:8px;border:1px solid #e5e7eb">Booking ID</td><td style="padding:8px;border:1px solid #e5e7eb">#%s</td></tr>
                  <tr><td style="padding:8px;border:1px solid #e5e7eb">Service</td><td style="padding:8px;border:1px solid #e5e7eb">%s</td></tr>
                  <tr><td style="padding:8px;border:1px solid #e5e7eb">Patient</td><td style="padding:8px;border:1px solid #e5e7eb">%s</td></tr>
                  <tr><td style="padding:8px;border:1px solid #e5e7eb">Amount</td><td style="padding:8px;border:1px solid #e5e7eb">Rs. %s</td></tr>
                  <tr><td style="padding:8px;border:1px solid #e5e7eb">UTR</td><td style="padding:8px;border:1px solid #e5e7eb">%s</td></tr>
                  <tr><td style="padding:8px;border:1px solid #e5e7eb">Support</td><td style="padding:8px;border:1px solid #e5e7eb">WhatsApp +%s</td></tr>
                </table>
                """.formatted(
                booking.getId(),
                escape(booking.getService().getName()),
                escape(booking.getPatientDetails().getPatientName()),
                payment.getAmount(),
                escape(payment.getUtrNumber()),
                supportWhatsapp
        );
    }

    private String escape(String value) {
        return String.valueOf(value == null ? "" : value)
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}
