package com.example.medapp.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public class UpdateMedicineRequest {
    @NotBlank
    private String name;
    @NotBlank
    private String dosage;
    @NotBlank
    private String frequency;
    private String instructions;
    private String imageUrl;
    private LocalDate startDate;
    private LocalDate endDate;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDosage() { return dosage; }
    public void setDosage(String dosage) { this.dosage = dosage; }

    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }

    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
}
