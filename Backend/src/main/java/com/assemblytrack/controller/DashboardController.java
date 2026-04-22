package com.assemblytrack.controller;

import com.assemblytrack.dto.DashboardMetricsDTO;
import com.assemblytrack.service.ProductionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private ProductionService productionService;

    @GetMapping("/metrics")
    public ResponseEntity<DashboardMetricsDTO> getDashboardMetrics() {
        DashboardMetricsDTO metrics = productionService.getDashboardMetrics();
        return ResponseEntity.ok(metrics);
    }

    // Additional endpoints for charts can be added here
    // For now, we'll implement basic metrics
}