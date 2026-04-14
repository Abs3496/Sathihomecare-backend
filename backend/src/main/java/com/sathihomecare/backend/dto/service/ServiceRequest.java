package com.sathihomecare.backend.dto.service;

import com.sathihomecare.backend.entity.enums.ServiceCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ServiceRequest {
    @NotBlank
    private String name;

    @NotNull
    private ServiceCategory category;

    @NotBlank
    private String description;

    @NotNull
    @Positive
    private BigDecimal price;

    @NotNull
    private Boolean active;
}
