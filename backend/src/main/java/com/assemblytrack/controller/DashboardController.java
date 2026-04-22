package com.assemblytrack.controller;

import com.assemblytrack.dto.DashboardStats;
import com.assemblytrack.repository.ProductRepository;
import com.assemblytrack.repository.ProductionRunRepository;
import java.util.Map;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin
public class DashboardController {

    private final ProductRepository productRepository;
    private final ProductionRunRepository productionRunRepository;

    public DashboardController(ProductRepository productRepository, ProductionRunRepository productionRunRepository) {
        this.productRepository = productRepository;
        this.productionRunRepository = productionRunRepository;
    }

    @GetMapping("/stats")
    public DashboardStats stats() {
        return new DashboardStats(
            productRepository.count(),
            productionRunRepository.count(),
            Map.of(
                "PLANNED", productionRunRepository.countByStatusIgnoreCase("PLANNED"),
                "IN_PROGRESS", productionRunRepository.countByStatusIgnoreCase("IN_PROGRESS"),
                "COMPLETED", productionRunRepository.countByStatusIgnoreCase("COMPLETED")
            )
        );
    }
}
