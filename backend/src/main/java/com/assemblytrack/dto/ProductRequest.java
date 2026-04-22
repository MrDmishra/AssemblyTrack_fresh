package com.assemblytrack.dto;

import jakarta.validation.constraints.NotBlank;

public class ProductRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String sku;

    private String description;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
