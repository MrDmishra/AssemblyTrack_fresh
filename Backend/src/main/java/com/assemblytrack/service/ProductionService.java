package com.assemblytrack.service;

import com.assemblytrack.dto.*;
import com.assemblytrack.entity.*;
import com.assemblytrack.repository.EmployeeRepository;
import com.assemblytrack.repository.ProductionImageRepository;
import com.assemblytrack.repository.ProductionResultRepository;
import com.assemblytrack.repository.ProductionRunRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductionService {

    @Autowired
    private ProductionRunRepository productionRunRepository;

    @Autowired
    private ProductionResultRepository productionResultRepository;

    @Autowired
    private ProductionImageRepository productionImageRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    public List<ProductionRunDTO> getActiveProductions() {
        return productionRunRepository.findByStatusOrderByStartTimeDesc(ProductionRun.Status.ACTIVE)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductionRunDTO startProduction(String employeeId, StartProductionRequest request) {
        Employee employee = employeeRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        if (productionRunRepository.existsByEmployeeAndStatus(employee, ProductionRun.Status.ACTIVE)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "You already have an active production. Stop it before starting a new one.");
        }

        String toolsUsed = request.getToolsUsed() != null ? String.join(",", request.getToolsUsed()) : null;

        ProductionRun productionRun = new ProductionRun(
                employee,
                request.getProductName(),
                request.getCategory(),
                request.getWorkStation(),
                toolsUsed,
                LocalDateTime.now(ZoneOffset.UTC),
                request.getExpectedDuration());

        productionRun = productionRunRepository.save(productionRun);
        return convertToDTO(productionRun);
    }

    @Transactional
    public ProductionRunDTO stopProduction(Long productionRunId, StopProductionRequest request,
            String callerEmployeeId, boolean isAdmin) {
        ProductionRun productionRun = productionRunRepository.findById(productionRunId)
                .orElseThrow(() -> new RuntimeException("Production run not found"));

        // Ownership check: only the employee who started it, or an admin, can stop it
        if (!isAdmin && !productionRun.getEmployee().getEmployeeId().equals(callerEmployeeId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You can only stop your own production runs");
        }

        if (productionRun.getStatus() != ProductionRun.Status.ACTIVE) {
            throw new RuntimeException("Production run is not active");
        }

        LocalDateTime endTime = LocalDateTime.now(ZoneOffset.UTC);
        long actualDurationMinutes = ChronoUnit.MINUTES.between(productionRun.getStartTime(), endTime);
        int actualDuration = (int) actualDurationMinutes;

        boolean isDelayed = actualDuration > productionRun.getExpectedDuration();
        if (isDelayed && (request.getDelayReason() == null || request.getDelayReason().trim().isEmpty())) {
            throw new RuntimeException("Delay reason is required for delayed production");
        }

        productionRun.setEndTime(endTime);
        productionRun.setActualDuration(actualDuration);
        productionRun.setStatus(ProductionRun.Status.COMPLETED);
        if (isDelayed) {
            productionRun.setDelayReason(request.getDelayReason());
        }

        ProductionResult.Quality quality = ProductionResult.Quality.valueOf(request.getQuality().toUpperCase());
        ProductionResult productionResult = new ProductionResult(
                productionRun,
                request.getUnitsProduced(),
                quality,
                request.getLogbookNotes());

        productionRun.setProductionResult(productionResult);
        productionResultRepository.save(productionResult);
        productionRun = productionRunRepository.save(productionRun);

        // Save image if provided
        if (request.getImageBase64() != null && !request.getImageBase64().isBlank()) {
            String fileName = request.getImageFileName() != null ? request.getImageFileName() : "image.jpg";
            ProductionImage image = new ProductionImage(productionRun, fileName, request.getImageBase64());
            productionImageRepository.save(image);
        }

        return convertToDTO(productionRun);
    }

    public List<ProductionRunDTO> getProductionHistory() {
        return productionRunRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public DashboardMetricsDTO getDashboardMetrics() {
        List<ProductionRun> allRuns = productionRunRepository.findAll();
        List<ProductionRun> completedRuns = allRuns.stream()
                .filter(run -> run.getStatus() == ProductionRun.Status.COMPLETED)
                .collect(Collectors.toList());

        long totalRunsCompleted = completedRuns.size();
        long delayedRuns = completedRuns.stream()
                .filter(run -> run.getActualDuration() != null && run.getActualDuration() > run.getExpectedDuration())
                .count();

        long totalUnitsProduced = completedRuns.stream()
                .filter(run -> run.getProductionResult() != null)
                .mapToLong(run -> run.getProductionResult().getUnitsProduced())
                .sum();

        double onTimeRate = totalRunsCompleted > 0
                ? ((double) (totalRunsCompleted - delayedRuns) / totalRunsCompleted) * 100
                : 0;

        return new DashboardMetricsDTO(totalRunsCompleted, delayedRuns, totalUnitsProduced, onTimeRate);
    }

    private ProductionRunDTO convertToDTO(ProductionRun productionRun) {
        String toolsUsed = productionRun.getToolsUsed();
        Integer unitsProduced = null;
        String quality = null;
        String logbookNotes = null;
        OffsetDateTime startTimeWithZone = productionRun.getStartTime() != null
                ? productionRun.getStartTime().atOffset(ZoneOffset.UTC)
                : null;
        OffsetDateTime endTimeWithZone = productionRun.getEndTime() != null
                ? productionRun.getEndTime().atOffset(ZoneOffset.UTC)
                : null;

        if (productionRun.getProductionResult() != null) {
            unitsProduced = productionRun.getProductionResult().getUnitsProduced();
            quality = productionRun.getProductionResult().getQuality().name();
            logbookNotes = productionRun.getProductionResult().getLogbookNotes();
        }

        return new ProductionRunDTO(
                productionRun.getId(),
                productionRun.getEmployee().getEmployeeId(),
                productionRun.getProductName(),
                productionRun.getCategory(),
                productionRun.getWorkStation(),
                toolsUsed,
                startTimeWithZone,
                endTimeWithZone,
                productionRun.getExpectedDuration(),
                productionRun.getActualDuration(),
                productionRun.getStatus().name(),
                productionRun.getDelayReason(),
                unitsProduced,
                quality,
                logbookNotes);
    }
}