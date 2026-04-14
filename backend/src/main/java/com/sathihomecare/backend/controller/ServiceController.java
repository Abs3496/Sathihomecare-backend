package com.sathihomecare.backend.controller;

import com.sathihomecare.backend.dto.service.ServiceResponse;
import com.sathihomecare.backend.entity.enums.ServiceCategory;
import com.sathihomecare.backend.service.ServiceCatalogService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class ServiceController {

    private final ServiceCatalogService serviceCatalogService;

    @GetMapping
    public List<ServiceResponse> getAllServices(@RequestParam(value = "category", required = false) ServiceCategory category) {
        if (category != null) {
            return serviceCatalogService.getServicesByCategory(category);
        }
        return serviceCatalogService.getAllActiveServices();
    }

    @GetMapping("/{id}")
    public ServiceResponse getServiceById(@PathVariable Long id) {
        return serviceCatalogService.getServiceById(id);
    }

    @GetMapping("/category/{category}")
    public List<ServiceResponse> getByCategory(@PathVariable ServiceCategory category) {
        return serviceCatalogService.getServicesByCategory(category);
    }
}
