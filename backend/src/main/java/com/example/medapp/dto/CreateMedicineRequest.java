package com.example.medapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class CreateMedicineRequest {
    @NotBlank
    private String name;
    @NotBlank
    private String dosage;
    @NotBlank
    private String frequency;
    private String instructions;
    private String imageUrl;
    @NotNull
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer pillsRemaining;
    private Integer pillsPerDose;

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

    public Integer getPillsRemaining() { return pillsRemaining; }
    public void setPillsRemaining(Integer pillsRemaining) { this.pillsRemaining = pillsRemaining; }

    public Integer getPillsPerDose() { return pillsPerDose; }
    public void setPillsPerDose(Integer pillsPerDose) { this.pillsPerDose = pillsPerDose; }
}
