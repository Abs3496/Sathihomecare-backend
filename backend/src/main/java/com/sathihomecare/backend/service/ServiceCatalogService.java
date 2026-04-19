package com.sathihomecare.backend.service;

import com.sathihomecare.backend.dto.service.ServiceRequest;
import com.sathihomecare.backend.dto.service.ServiceResponse;
import com.sathihomecare.backend.entity.ServiceEntity;
import com.sathihomecare.backend.entity.enums.ServiceCategory;
import com.sathihomecare.backend.exception.ResourceNotFoundException;
import com.sathihomecare.backend.repository.ServiceRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ServiceCatalogService {

    private final ServiceRepository serviceRepository;

    @Cacheable("active-services")
    public List<ServiceResponse> getAllActiveServices() {
        return serviceRepository.findByActiveTrue().stream().map(this::toResponse).toList();
    }

    @Cacheable(value = "service-by-id", key = "#id")
    public ServiceResponse getServiceById(Long id) {
        return serviceRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));
    }

    @Cacheable(value = "services-by-category", key = "#category.name()")
    public List<ServiceResponse> getServicesByCategory(ServiceCategory category) {
        return serviceRepository.findByCategoryAndActiveTrue(category).stream().map(this::toResponse).toList();
    }

    @Transactional
    @CacheEvict(value = {"active-services", "service-by-id", "services-by-category"}, allEntries = true)
    public ServiceResponse createService(ServiceRequest request) {
        ServiceEntity service = new ServiceEntity();
        service.setName(request.getName());
        service.setCategory(request.getCategory());
        service.setDescription(request.getDescription());
        service.setPrice(request.getPrice());
        service.setActive(request.getActive());
        return toResponse(serviceRepository.save(service));
    }

    @Transactional
    @CacheEvict(value = {"active-services", "service-by-id", "services-by-category"}, allEntries = true)
    public ServiceResponse updateService(Long id, ServiceRequest request) {
        ServiceEntity service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));
        service.setName(request.getName());
        service.setCategory(request.getCategory());
        service.setDescription(request.getDescription());
        service.setPrice(request.getPrice());
        service.setActive(request.getActive());
        return toResponse(serviceRepository.save(service));
    }

    @Transactional
    @CacheEvict(value = {"active-services", "service-by-id", "services-by-category"}, allEntries = true)
    public void deactivateService(Long id) {
        ServiceEntity service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));
        service.setActive(false);
        serviceRepository.save(service);
    }

    private ServiceResponse toResponse(ServiceEntity service) {
        return ServiceResponse.builder()
                .id(service.getId())
                .name(service.getName())
                .category(service.getCategory())
                .description(service.getDescription())
                .price(service.getPrice())
                .build();
    }
}
