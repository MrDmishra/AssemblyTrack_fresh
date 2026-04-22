package com.assemblytrack.dto;

import java.util.Map;

public class DashboardStats {

    private final long totalProducts;
    private final long totalRuns;
    private final Map<String, Long> runStatusCounts;

    public DashboardStats(long totalProducts, long totalRuns, Map<String, Long> runStatusCounts) {
        this.totalProducts = totalProducts;
        this.totalRuns = totalRuns;
        this.runStatusCounts = runStatusCounts;
    }

    public long getTotalProducts() {
        return totalProducts;
    }

    public long getTotalRuns() {
        return totalRuns;
    }

    public Map<String, Long> getRunStatusCounts() {
        return runStatusCounts;
    }
}
