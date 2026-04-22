package com.assemblytrack.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class StopProductionRequest {

    @NotNull
    @Positive
    private Integer unitsProduced;

    @NotNull
    private String quality; // PASS, PARTIAL, FAIL

    private String logbookNotes;

    private String delayReason; // Required if delayed

    private String imageBase64; // Optional base64-encoded image

    private String imageFileName; // Original file name of the uploaded image

    public StopProductionRequest() {
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

    public String getDelayReason() {
        return delayReason;
    }

    public void setDelayReason(String delayReason) {
        this.delayReason = delayReason;
    }

    public String getImageBase64() {
        return imageBase64;
    }

    public void setImageBase64(String imageBase64) {
        this.imageBase64 = imageBase64;
    }

    public String getImageFileName() {
        return imageFileName;
    }

    public void setImageFileName(String imageFileName) {
        this.imageFileName = imageFileName;
    }
}