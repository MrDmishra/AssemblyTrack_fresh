package com.assemblytrack.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "production_results")
public class ProductionResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "production_run_id", nullable = false)
    private ProductionRun productionRun;

    @Column(nullable = false)
    private Integer unitsProduced;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Quality quality;

    @Column
    private String logbookNotes;

    public enum Quality {
        PASS, PARTIAL, FAIL
    }

    // Constructors
    public ProductionResult() {
    }

    public ProductionResult(ProductionRun productionRun, Integer unitsProduced, Quality quality, String logbookNotes) {
        this.productionRun = productionRun;
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

    public ProductionRun getProductionRun() {
        return productionRun;
    }

    public void setProductionRun(ProductionRun productionRun) {
        this.productionRun = productionRun;
    }

    public Integer getUnitsProduced() {
        return unitsProduced;
    }

    public void setUnitsProduced(Integer unitsProduced) {
        this.unitsProduced = unitsProduced;
    }

    public Quality getQuality() {
        return quality;
    }

    public void setQuality(Quality quality) {
        this.quality = quality;
    }

    public String getLogbookNotes() {
        return logbookNotes;
    }

    public void setLogbookNotes(String logbookNotes) {
        this.logbookNotes = logbookNotes;
    }
}