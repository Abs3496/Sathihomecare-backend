package com.sathihomecare.backend.dto.service;

import com.sathihomecare.backend.entity.enums.ServiceCategory;
import java.math.BigDecimal;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ServiceResponse {
    private Long id;
    private String name;
    private ServiceCategory category;
    private String description;
    private BigDecimal price;
}
