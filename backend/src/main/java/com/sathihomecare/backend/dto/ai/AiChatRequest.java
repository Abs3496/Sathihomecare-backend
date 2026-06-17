package com.sathihomecare.backend.dto.ai;

import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AiChatRequest {
    private List<AiChatMessage> messages = new ArrayList<>();
    private AiBookingDraft draft = new AiBookingDraft();
    private boolean confirmBooking;
}
