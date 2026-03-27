package com.example.medapp.dto;

import jakarta.validation.constraints.NotBlank;

public class UpdateMedicineRequest {
    @NotBlank
    private String name;
    @NotBlank
    private String dosage;
    @NotBlank
    private String frequency;
    private String duration;
    private String instructions;
    private String imageUrl;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDosage() { return dosage; }
    public void setDosage(String dosage) { this.dosage = dosage; }

    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }

    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
