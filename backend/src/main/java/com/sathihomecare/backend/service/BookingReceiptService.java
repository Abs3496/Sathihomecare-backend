package com.sathihomecare.backend.service;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.sathihomecare.backend.entity.Booking;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import org.springframework.stereotype.Service;

@Service
public class BookingReceiptService {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd MMM yyyy");

    public byte[] generateReceipt(Booking booking) {
        try {
            ByteArrayOutputStream output = new ByteArrayOutputStream();
            Document document = new Document();
            PdfWriter.getInstance(document, output);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 11);

            document.add(new Paragraph("SATHIHOMECARE Booking Receipt", titleFont));
            document.add(new Paragraph("Your care request has been received and is pending assignment.", bodyFont));
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            addRow(table, "Booking ID", booking.getBookingCode());
            addRow(table, "Status", booking.getBookingStatus().name());
            addRow(table, "Service", booking.getService().getName());
            addRow(table, "Patient Name", booking.getPatientDetails().getPatientName());
            addRow(table, "Age", String.valueOf(booking.getPatientDetails().getPatientAge()));
            addRow(table, "Gender", booking.getPatientDetails().getGender());
            addRow(table, "Mobile", booking.getCustomerMobile());
            addRow(table, "Email", booking.getCustomerEmail());
            addRow(table, "Address", booking.getPatientDetails().getPatientAddress());
            addRow(table, "Preferred Date", booking.getPreferredDate().format(DATE_FORMAT));
            addRow(table, "Preferred Time Slot", booking.getPreferredTimeSlot());
            addRow(table, "Additional Notes", nullToBlank(booking.getAdditionalNotes()));
            document.add(table);

            document.add(new Paragraph(" "));
            document.add(new Paragraph("Our team will contact you shortly to confirm availability and staff assignment.", bodyFont));
            document.close();
            return output.toByteArray();
        } catch (DocumentException error) {
            throw new IllegalStateException("Unable to generate booking receipt", error);
        }
    }

    private void addRow(PdfPTable table, String label, String value) {
        table.addCell(label);
        table.addCell(nullToBlank(value));
    }

    private String nullToBlank(String value) {
        return value == null ? "" : value;
    }
}
