package com.sathihomecare.backend.service;

import com.sathihomecare.backend.entity.Booking;
import com.sathihomecare.backend.entity.Payment;
import jakarta.mail.internet.MimeMessage;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;

@Service
@RequiredArgsConstructor
public class BookingEmailService {

    private static final Logger LOGGER = LoggerFactory.getLogger(BookingEmailService.class);

    private final RestClient.Builder restClientBuilder;
    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    @Value("${app.email.resend-api-key:}")
    private String resendApiKey;

    @Value("${app.email.from:SATHIHOMECARE <bookings@sathihomecare.com>}")
    private String fromAddress;

    @Value("${app.email.admin-to:}")
    private String adminEmail;

    @Value("${app.payment.support-whatsapp:918090806731}")
    private String supportWhatsapp;

    public void sendBookingReceipt(Booking booking, byte[] receiptPdf) {
        String fileName = booking.getBookingCode() + "-receipt.pdf";
        String customerHtml = buildCustomerReceiptHtml(booking);
        if (StringUtils.hasText(booking.getCustomerEmail())) {
            sendEmail(
                    booking.getCustomerEmail(),
                    "SATHIHOMECARE booking receipt " + booking.getBookingCode(),
                    customerHtml,
                    receiptPdf,
                    fileName
            );
        }

        if (StringUtils.hasText(adminEmail)) {
            sendEmail(
                    adminEmail,
                    "New booking " + booking.getBookingCode(),
                    buildBusinessBookingHtml(booking),
                    receiptPdf,
                    fileName
            );
        }
    }

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
        sendEmail(to, subject, html, null, null);
    }

    private void sendEmail(String to, String subject, String html, byte[] attachment, String attachmentName) {
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender != null) {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, attachment != null);
                helper.setFrom(fromAddress);
                helper.setTo(to);
                helper.setSubject(subject);
                helper.setText(html, true);
                if (attachment != null) {
                    helper.addAttachment(attachmentName, new ByteArrayResource(attachment), "application/pdf");
                }
                mailSender.send(message);
                return;
            } catch (RuntimeException | jakarta.mail.MessagingException error) {
                LOGGER.warn("Unable to send Spring Mail email to {}: {}", to, error.getMessage());
            }
        }

        if (!StringUtils.hasText(resendApiKey)) {
            LOGGER.info("No email provider configured. Skipping email to {}", to);
            return;
        }

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("from", fromAddress);
        payload.put("to", new String[] { to });
        payload.put("subject", subject);
        payload.put("html", html);
        if (attachment != null) {
            Map<String, String> file = new LinkedHashMap<>();
            file.put("filename", attachmentName);
            file.put("content", java.util.Base64.getEncoder().encodeToString(attachment));
            payload.put("attachments", new Object[] { file });
        }

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

    private String buildCustomerReceiptHtml(Booking booking) {
        return """
                <div style="font-family:Arial,sans-serif;color:#102542;line-height:1.6">
                  <h1 style="color:#102542">Booking received</h1>
                  <p>Thank you for choosing SATHIHOMECARE. Your booking is pending and our team will contact you shortly.</p>
                  %s
                  <p><strong>Need help?</strong> WhatsApp support: <a href="https://wa.me/%s?text=I%%20need%%20help%%20with%%20booking%%20%s">Chat with support</a></p>
                </div>
                """.formatted(buildBookingDetailsTable(booking), supportWhatsapp, booking.getBookingCode());
    }

    private String buildBusinessBookingHtml(Booking booking) {
        return """
                <div style="font-family:Arial,sans-serif;color:#102542;line-height:1.6">
                  <h1>New pending booking</h1>
                  <p>A customer booked directly from the website. Please assign a nurse or therapist.</p>
                  %s
                </div>
                """.formatted(buildBookingDetailsTable(booking));
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

    private String buildBookingDetailsTable(Booking booking) {
        return """
                <table style="border-collapse:collapse;width:100%%;max-width:620px">
                  <tr><td style="padding:8px;border:1px solid #e5e7eb">Booking ID</td><td style="padding:8px;border:1px solid #e5e7eb">%s</td></tr>
                  <tr><td style="padding:8px;border:1px solid #e5e7eb">Service</td><td style="padding:8px;border:1px solid #e5e7eb">%s</td></tr>
                  <tr><td style="padding:8px;border:1px solid #e5e7eb">Patient</td><td style="padding:8px;border:1px solid #e5e7eb">%s</td></tr>
                  <tr><td style="padding:8px;border:1px solid #e5e7eb">Mobile</td><td style="padding:8px;border:1px solid #e5e7eb">%s</td></tr>
                  <tr><td style="padding:8px;border:1px solid #e5e7eb">Email</td><td style="padding:8px;border:1px solid #e5e7eb">%s</td></tr>
                  <tr><td style="padding:8px;border:1px solid #e5e7eb">Date</td><td style="padding:8px;border:1px solid #e5e7eb">%s</td></tr>
                  <tr><td style="padding:8px;border:1px solid #e5e7eb">Time Slot</td><td style="padding:8px;border:1px solid #e5e7eb">%s</td></tr>
                  <tr><td style="padding:8px;border:1px solid #e5e7eb">Address</td><td style="padding:8px;border:1px solid #e5e7eb">%s</td></tr>
                </table>
                """.formatted(
                escape(booking.getBookingCode()),
                escape(booking.getService().getName()),
                escape(booking.getPatientDetails().getPatientName()),
                escape(booking.getCustomerMobile()),
                escape(booking.getCustomerEmail()),
                booking.getPreferredDate(),
                escape(booking.getPreferredTimeSlot()),
                escape(booking.getPatientDetails().getPatientAddress())
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
