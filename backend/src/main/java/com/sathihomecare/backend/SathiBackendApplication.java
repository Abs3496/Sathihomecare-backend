package com.sathihomecare.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SathiBackendApplication {

    public static void main(String[] args) {
        String renderPort = System.getenv("PORT");
        if (renderPort == null || renderPort.isBlank()) {
            renderPort = "8080";
        }
        System.out.println("Server started on port: " + renderPort);
        SpringApplication.run(SathiBackendApplication.class, args);
    }
}
