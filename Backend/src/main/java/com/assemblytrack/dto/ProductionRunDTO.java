package com.assemblytrack.dto;

import java.time.OffsetDateTime;

public class ProductionRunDTO {
    private Long id;
    private String employeeId;
    private String productName;
    private String category;
    private String workStation;
    private String toolsUsed;
    private OffsetDateTime startTime;
    private OffsetDateTime endTime;
    private Integer expectedDuration;
    private Integer actualDuration;
    private String status;
    private String delayReason;
    private Integer unitsProduced;
    private String quality;
    private String logbookNotes;

    public ProductionRunDTO() {
    }

    // Constructor and getters/setters
    public ProductionRunDTO(Long id, String employeeId, String productName, String category,
            String workStation, String toolsUsed, OffsetDateTime startTime,
            OffsetDateTime endTime, Integer expectedDuration, Integer actualDuration,
            String status, String delayReason, Integer unitsProduced, String quality,
            String logbookNotes) {
        this.id = id;
        this.employeeId = employeeId;
        this.productName = productName;
        this.category = category;
        this.workStation = workStation;
        this.toolsUsed = toolsUsed;
        this.startTime = startTime;
        this.endTime = endTime;
        this.expectedDuration = expectedDuration;
        this.actualDuration = actualDuration;
        this.status = status;
        this.delayReason = delayReason;
        this.unitsProduced = unitsProduced;
        this.quality = quality;
        this.logbookNotes = logbookNotes;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getWorkStation() {
        return workStation;
    }

    public void setWorkStation(String workStation) {
        this.workStation = workStation;
    }

    public String getToolsUsed() {
        return toolsUsed;
    }

    public void setToolsUsed(String toolsUsed) {
        this.toolsUsed = toolsUsed;
    }

    public OffsetDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(OffsetDateTime startTime) {
        this.startTime = startTime;
    }

    public OffsetDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(OffsetDateTime endTime) {
        this.endTime = endTime;
    }

    public Integer getExpectedDuration() {
        return expectedDuration;
    }

    public void setExpectedDuration(Integer expectedDuration) {
        this.expectedDuration = expectedDuration;
    }

    public Integer getActualDuration() {
        return actualDuration;
    }

    public void setActualDuration(Integer actualDuration) {
        this.actualDuration = actualDuration;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDelayReason() {
        return delayReason;
    }

    public void setDelayReason(String delayReason) {
        this.delayReason = delayReason;
    }

    public Integer getUnitsProduced() {
        return unitsProduced;
    }

    public void setUnitsProduced(Integer unitsProduced) {
        this.unitsProduced = unitsProduced;
    }

    public String getQuality() {
        return quality;
    }

    public void setQuality(String quality) {
        this.quality = quality;
    }

    public String getLogbookNotes() {
        return logbookNotes;
    }

    public void setLogbookNotes(String logbookNotes) {
        this.logbookNotes = logbookNotes;
    }
}