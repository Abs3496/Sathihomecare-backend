package com.sathihomecare.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sathihomecare.backend.dto.ai.AiBookingDraft;
import com.sathihomecare.backend.dto.ai.AiChatMessage;
import com.sathihomecare.backend.dto.ai.AiChatRequest;
import com.sathihomecare.backend.dto.ai.AiChatResponse;
import com.sathihomecare.backend.dto.booking.BookingResponse;
import com.sathihomecare.backend.dto.booking.CreateBookingRequest;
import com.sathihomecare.backend.entity.ServiceEntity;
import com.sathihomecare.backend.repository.ServiceRepository;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;

@Service
@RequiredArgsConstructor
public class AiReceptionistService {

    private static final String WELCOME = "Namaste Sir, main Priya hoon. Main aapki care requirement samajhne aur booking mein madad kar sakti hoon.";
    private static final Pattern MOBILE_PATTERN = Pattern.compile("(?<!\\d)([6-9]\\d{9})(?!\\d)");
    private static final Pattern AGE_PATTERN = Pattern.compile("(?i)(?:age|umar|umra|aayu|aged)?\\s*(\\d{1,3})\\s*(?:years?|yrs?|saal)?");

    private final RestClient.Builder restClientBuilder;
    private final ObjectMapper objectMapper;
    private final ServiceRepository serviceRepository;
    private final BookingService bookingService;

    @Value("${app.gemini.api-key:}")
    private String geminiApiKey;

    @Value("${app.gemini.model:gemini-3.5-flash}")
    private String geminiModel;

    public AiChatResponse chat(AiChatRequest request) {
        AiBookingDraft draft = copyDraft(request.getDraft());
        String latestUserMessage = latestUserMessage(request.getMessages());
        List<ServiceEntity> services = serviceRepository.findByActiveTrue();

        if (StringUtils.hasText(latestUserMessage)) {
            mergeDraft(draft, extractWithFallback(latestUserMessage, request.getMessages(), draft, services));
        }

        ServiceEntity service = resolveService(draft.getServiceType(), services);
        if (service != null) {
            draft.setServiceType(service.getName());
        }

        List<String> missingFields = missingFields(draft);
        if (StringUtils.hasText(draft.getServiceType()) && service == null && !missingFields.contains("Service Type")) {
            missingFields.add("Service Type");
        }
        String summary = buildSummary(draft);

        if (request.isConfirmBooking()) {
            if (!missingFields.isEmpty()) {
                return AiChatResponse.builder()
                        .reply("Booking confirm karne se pehle mujhe " + String.join(", ", missingFields) + " chahiye.")
                        .draft(draft)
                        .missingFields(missingFields)
                        .bookingSummary(summary)
                        .canConfirm(false)
                        .build();
            }

            BookingResponse booking = createBooking(draft, service);
            return AiChatResponse.builder()
                    .reply("Done Sir. Aapki booking submit ho gayi hai. Booking ID: " + booking.getBookingCode() + ". Hamari team jald confirm karegi.")
                    .draft(draft)
                    .missingFields(List.of())
                    .bookingSummary(summary)
                    .canConfirm(false)
                    .booking(booking)
                    .build();
        }

        String reply = buildReply(draft, missingFields, summary, latestUserMessage, services);
        return AiChatResponse.builder()
                .reply(reply)
                .draft(draft)
                .missingFields(missingFields)
                .bookingSummary(summary)
                .canConfirm(missingFields.isEmpty())
                .build();
    }

    private AiBookingDraft extractWithFallback(
            String latestUserMessage,
            List<AiChatMessage> messages,
            AiBookingDraft draft,
            List<ServiceEntity> services
    ) {
        AiBookingDraft extracted = callGemini(messages, draft, services);
        if (extracted == null) {
            extracted = heuristicExtract(latestUserMessage, services);
        } else {
            mergeDraft(extracted, heuristicExtract(latestUserMessage, services));
        }
        return extracted;
    }

    private AiBookingDraft callGemini(List<AiChatMessage> messages, AiBookingDraft draft, List<ServiceEntity> services) {
        if (!StringUtils.hasText(geminiApiKey)) {
            return null;
        }

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("system_instruction", Map.of("parts", List.of(Map.of("text", systemPrompt(services)))));

        List<Map<String, Object>> contents = new ArrayList<>();
        for (AiChatMessage message : messages == null ? List.<AiChatMessage>of() : messages) {
            String role = "assistant".equalsIgnoreCase(message.getRole()) ? "model" : "user";
            contents.add(Map.of("role", role, "parts", List.of(Map.of("text", safe(message.getContent())))));
        }
        contents.add(Map.of("role", "user", "parts", List.of(Map.of(
                "text",
                "Current collected JSON: " + toJson(draft) + ". Return updated JSON only."
        ))));
        payload.put("contents", contents);
        payload.put("generationConfig", Map.of("responseMimeType", "application/json"));

        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/" + geminiModel + ":generateContent";
            JsonNode response = restClientBuilder.build()
                    .post()
                    .uri(url)
                    .header("x-goog-api-key", geminiApiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .body(JsonNode.class);

            String text = response == null ? "" : response.at("/candidates/0/content/parts/0/text").asText("");
            if (!StringUtils.hasText(text)) return null;
            return objectMapper.readValue(cleanJson(text), AiBookingDraft.class);
        } catch (RuntimeException | java.io.IOException error) {
            return null;
        }
    }

    private String systemPrompt(List<ServiceEntity> services) {
        String serviceNames = services.stream()
                .map(ServiceEntity::getName)
                .toList()
                .toString();
        return """
                You are Priya Sharma, an AI care receptionist for Sathi Homecare.
                Understand Hindi, English, and Hinglish. Answer only homecare service questions.
                Extract booking details into JSON only with keys:
                patientName, age, location, serviceType, preferredDate, timeSlot, mobileNumber.
                Use yyyy-MM-dd for preferredDate when possible. Do not invent missing data.
                Available services: %s
                """.formatted(serviceNames);
    }

    private AiBookingDraft heuristicExtract(String text, List<ServiceEntity> services) {
        AiBookingDraft draft = new AiBookingDraft();
        String normalized = safe(text).trim();
        String lower = normalized.toLowerCase(Locale.ROOT);

        Matcher mobileMatcher = MOBILE_PATTERN.matcher(normalized);
        if (mobileMatcher.find()) draft.setMobileNumber(mobileMatcher.group(1));

        Matcher ageMatcher = AGE_PATTERN.matcher(normalized);
        while (ageMatcher.find()) {
            int age = Integer.parseInt(ageMatcher.group(1));
            if (age > 0 && age < 120) {
                draft.setAge(age);
                break;
            }
        }

        Matcher nameMatcher = Pattern.compile("(?i)(?:patient name|name|naam)\\s*(?:is|hai|:)\\s*([A-Za-z ]{2,40})").matcher(normalized);
        if (nameMatcher.find()) {
            draft.setPatientName(nameMatcher.group(1).trim());
        }

        Matcher locationMatcher = Pattern.compile("(?i)(?:location|address|area|city|jagah|pata)\\s*(?:is|hai|:)\\s*([A-Za-z0-9, .-]{3,80})").matcher(normalized);
        if (locationMatcher.find()) {
            draft.setLocation(locationMatcher.group(1).trim());
        }

        for (ServiceEntity service : services) {
            if (lower.contains(service.getName().toLowerCase(Locale.ROOT))) {
                draft.setServiceType(service.getName());
                break;
            }
        }
        if (draft.getServiceType() == null) {
            if (lower.contains("nurs") || lower.contains("patient") || lower.contains("elder")) draft.setServiceType("Nursing");
            if (lower.contains("therapy") || lower.contains("physio") || lower.contains("ayur")) draft.setServiceType("Therapy");
            if (lower.contains("counsel") || lower.contains("mental")) draft.setServiceType("Counselling");
        }

        String date = findIsoDate(normalized);
        if (date != null) draft.setPreferredDate(date);
        for (String slot : List.of("08:00 AM - 10:00 AM", "10:00 AM - 12:00 PM", "12:00 PM - 02:00 PM", "02:00 PM - 04:00 PM", "04:00 PM - 06:00 PM", "06:00 PM - 08:00 PM")) {
            if (lower.contains(slot.toLowerCase(Locale.ROOT)) || lower.contains(slot.substring(0, 5).toLowerCase(Locale.ROOT))) {
                draft.setTimeSlot(slot);
                break;
            }
        }

        return draft;
    }

    private BookingResponse createBooking(AiBookingDraft draft, ServiceEntity service) {
        ServiceEntity selectedService = service != null ? service : resolveService(draft.getServiceType(), serviceRepository.findByActiveTrue());
        if (selectedService == null) {
            throw new IllegalArgumentException("Service not found");
        }

        CreateBookingRequest bookingRequest = new CreateBookingRequest();
        bookingRequest.setServiceId(selectedService.getId());
        bookingRequest.setPatientName(draft.getPatientName());
        bookingRequest.setPatientAge(draft.getAge());
        bookingRequest.setGender("Other");
        bookingRequest.setMobileNumber(draft.getMobileNumber());
        bookingRequest.setEmail(draft.getMobileNumber() + "@sathihomecare.local");
        bookingRequest.setAddress(draft.getLocation());
        bookingRequest.setServiceType(selectedService.getName());
        bookingRequest.setPreferredDate(LocalDate.parse(draft.getPreferredDate()));
        bookingRequest.setPreferredTimeSlot(draft.getTimeSlot());
        bookingRequest.setAdditionalNotes("AI receptionist booking. Location: " + draft.getLocation());
        return bookingService.createGuestBooking(bookingRequest);
    }

    private String buildReply(AiBookingDraft draft, List<String> missingFields, String summary, String latestUserMessage, List<ServiceEntity> services) {
        if (!StringUtils.hasText(latestUserMessage)) {
            return WELCOME;
        }
        if (!missingFields.isEmpty()) {
            return "Samajh gayi Sir. " + recommendLine(draft, services) + " Booking ke liye mujhe abhi " + String.join(", ", missingFields) + " bata dijiye.";
        }
        return "Perfect Sir. Yeh summary hai:\n" + summary + "\nAap Confirm Booking dabakar request submit kar sakte hain.";
    }

    private String recommendLine(AiBookingDraft draft, List<ServiceEntity> services) {
        if (StringUtils.hasText(draft.getServiceType())) {
            return draft.getServiceType() + " suitable lag raha hai.";
        }
        return "Patient need ke hisaab se main nursing, therapy ya counselling recommend kar sakti hoon.";
    }

    private List<String> missingFields(AiBookingDraft draft) {
        List<String> missing = new ArrayList<>();
        if (!StringUtils.hasText(draft.getPatientName())) missing.add("Patient Name");
        if (draft.getAge() == null) missing.add("Age");
        if (!StringUtils.hasText(draft.getLocation())) missing.add("Location");
        if (!StringUtils.hasText(draft.getServiceType())) missing.add("Service Type");
        if (!StringUtils.hasText(draft.getPreferredDate()) || !isValidDate(draft.getPreferredDate())) missing.add("Preferred Date");
        if (!StringUtils.hasText(draft.getTimeSlot())) missing.add("Time Slot");
        if (!StringUtils.hasText(draft.getMobileNumber()) || !draft.getMobileNumber().matches("^[0-9]{10}$")) missing.add("Mobile Number");
        return missing;
    }

    private String buildSummary(AiBookingDraft draft) {
        return """
                Patient: %s
                Age: %s
                Location: %s
                Service: %s
                Date: %s
                Time Slot: %s
                Mobile: %s
                """.formatted(
                blank(draft.getPatientName()),
                draft.getAge() == null ? "-" : draft.getAge(),
                blank(draft.getLocation()),
                blank(draft.getServiceType()),
                blank(draft.getPreferredDate()),
                blank(draft.getTimeSlot()),
                blank(draft.getMobileNumber())
        ).trim();
    }

    private ServiceEntity resolveService(String requested, List<ServiceEntity> services) {
        if (!StringUtils.hasText(requested)) return null;
        String normalized = requested.toLowerCase(Locale.ROOT);
        return services.stream()
                .filter(ServiceEntity::isActive)
                .min(Comparator.comparingInt(service -> serviceScore(service, normalized)))
                .filter(service -> serviceScore(service, normalized) < 100)
                .orElse(null);
    }

    private int serviceScore(ServiceEntity service, String requested) {
        String name = service.getName().toLowerCase(Locale.ROOT);
        String category = service.getCategory().name().toLowerCase(Locale.ROOT);
        if (name.equals(requested)) return 0;
        if (name.contains(requested) || requested.contains(name)) return 1;
        if (requested.contains(category) || category.contains(requested)) return 2;
        return 100;
    }

    private void mergeDraft(AiBookingDraft target, AiBookingDraft source) {
        if (source == null) return;
        if (!StringUtils.hasText(target.getPatientName())) target.setPatientName(source.getPatientName());
        if (target.getAge() == null) target.setAge(source.getAge());
        if (!StringUtils.hasText(target.getLocation())) target.setLocation(source.getLocation());
        if (!StringUtils.hasText(target.getServiceType())) target.setServiceType(source.getServiceType());
        if (!StringUtils.hasText(target.getPreferredDate())) target.setPreferredDate(source.getPreferredDate());
        if (!StringUtils.hasText(target.getTimeSlot())) target.setTimeSlot(source.getTimeSlot());
        if (!StringUtils.hasText(target.getMobileNumber())) target.setMobileNumber(source.getMobileNumber());
    }

    private AiBookingDraft copyDraft(AiBookingDraft source) {
        AiBookingDraft copy = new AiBookingDraft();
        mergeDraft(copy, source);
        return copy;
    }

    private String latestUserMessage(List<AiChatMessage> messages) {
        if (messages == null) return "";
        for (int index = messages.size() - 1; index >= 0; index -= 1) {
            AiChatMessage message = messages.get(index);
            if ("user".equalsIgnoreCase(message.getRole())) {
                return safe(message.getContent());
            }
        }
        return "";
    }

    private String findIsoDate(String text) {
        Matcher matcher = Pattern.compile("\\b(20\\d{2}-\\d{2}-\\d{2})\\b").matcher(text);
        if (matcher.find() && isValidDate(matcher.group(1))) return matcher.group(1);
        return null;
    }

    private boolean isValidDate(String value) {
        try {
            LocalDate.parse(value);
            return true;
        } catch (DateTimeParseException error) {
            return false;
        }
    }

    private String cleanJson(String text) {
        return text.replace("```json", "").replace("```", "").trim();
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (RuntimeException | java.io.IOException error) {
            return "{}";
        }
    }

    private String blank(String value) {
        return StringUtils.hasText(value) ? value : "-";
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }
}
