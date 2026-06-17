package com.sathihomecare.backend.dto.ai;

import com.sathihomecare.backend.dto.booking.BookingResponse;
import java.util.ArrayList;
import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AiChatResponse {
    private String reply;
    private AiBookingDraft draft;
    @Builder.Default
    private List<String> missingFields = new ArrayList<>();
    private String bookingSummary;
    private boolean canConfirm;
    private BookingResponse booking;
}
