package com.assemblytrack.dto;

public class DashboardMetricsDTO {
    private Long totalRunsCompleted;
    private Long delayedRuns;
    private Long totalUnitsProduced;
    private Double onTimeRate;

    public DashboardMetricsDTO() {
    }

    public DashboardMetricsDTO(Long totalRunsCompleted, Long delayedRuns, Long totalUnitsProduced, Double onTimeRate) {
        this.totalRunsCompleted = totalRunsCompleted;
        this.delayedRuns = delayedRuns;
        this.totalUnitsProduced = totalUnitsProduced;
        this.onTimeRate = onTimeRate;
    }

    public Long getTotalRunsCompleted() {
        return totalRunsCompleted;
    }

    public void setTotalRunsCompleted(Long totalRunsCompleted) {
        this.totalRunsCompleted = totalRunsCompleted;
    }

    public Long getDelayedRuns() {
        return delayedRuns;
    }

    public void setDelayedRuns(Long delayedRuns) {
        this.delayedRuns = delayedRuns;
    }

    public Long getTotalUnitsProduced() {
        return totalUnitsProduced;
    }

    public void setTotalUnitsProduced(Long totalUnitsProduced) {
        this.totalUnitsProduced = totalUnitsProduced;
    }

    public Double getOnTimeRate() {
        return onTimeRate;
    }

    public void setOnTimeRate(Double onTimeRate) {
        this.onTimeRate = onTimeRate;
    }
}