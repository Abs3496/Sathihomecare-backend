package com.sathihomecare.backend.dto.ai;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AiChatMessage {
    private String role;
    private String content;
}
