package com.assemblytrack.controller;

import com.assemblytrack.dto.ProductionRunDTO;
import com.assemblytrack.dto.StartProductionRequest;
import com.assemblytrack.dto.StopProductionRequest;
import com.assemblytrack.entity.ProductionImage;
import com.assemblytrack.repository.ProductionImageRepository;
import com.assemblytrack.service.ProductionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/productions")
public class ProductionController {

    @Autowired
    private ProductionService productionService;

    @Autowired
    private ProductionImageRepository productionImageRepository;

    @GetMapping("/active")
    public ResponseEntity<List<ProductionRunDTO>> getActiveProductions() {
        List<ProductionRunDTO> activeProductions = productionService.getActiveProductions();
        return ResponseEntity.ok(activeProductions);
    }

    @PostMapping("/start")
    public ResponseEntity<ProductionRunDTO> startProduction(
            @Valid @RequestBody StartProductionRequest request,
            Authentication authentication) {
        String employeeId = authentication.getName();
        ProductionRunDTO productionRun = productionService.startProduction(employeeId, request);
        return ResponseEntity.ok(productionRun);
    }

    @PostMapping("/stop/{productionRunId}")
    public ResponseEntity<ProductionRunDTO> stopProduction(
            @PathVariable Long productionRunId,
            @Valid @RequestBody StopProductionRequest request,
            Authentication authentication) {
        String callerEmployeeId = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        ProductionRunDTO productionRun = productionService.stopProduction(
                productionRunId, request, callerEmployeeId, isAdmin);
        return ResponseEntity.ok(productionRun);
    }

    @GetMapping("/history")
    public ResponseEntity<List<ProductionRunDTO>> getProductionHistory() {
        List<ProductionRunDTO> history = productionService.getProductionHistory();
        return ResponseEntity.ok(history);
    }

    @GetMapping("/{productionRunId}/images")
    public ResponseEntity<List<Map<String, Object>>> getImages(@PathVariable Long productionRunId) {
        List<ProductionImage> images = productionImageRepository.findByProductionRunId(productionRunId);
        List<Map<String, Object>> result = images.stream().map(img -> {
            Map<String, Object> m = new java.util.LinkedHashMap<>();
            m.put("id", img.getId());
            m.put("fileName", img.getFileName());
            m.put("imageData", img.getImageData());
            m.put("uploadedAt", img.getUploadedAt());
            return m;
        }).toList();
        return ResponseEntity.ok(result);
    }
}