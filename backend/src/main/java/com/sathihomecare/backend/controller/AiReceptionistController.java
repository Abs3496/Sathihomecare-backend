package com.sathihomecare.backend.controller;

import com.sathihomecare.backend.dto.ai.AiChatRequest;
import com.sathihomecare.backend.dto.ai.AiChatResponse;
import com.sathihomecare.backend.service.AiReceptionistService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai-receptionist")
@RequiredArgsConstructor
public class AiReceptionistController {

    private final AiReceptionistService aiReceptionistService;

    @PostMapping("/chat")
    public AiChatResponse chat(@RequestBody AiChatRequest request) {
        return aiReceptionistService.chat(request);
    }
}
