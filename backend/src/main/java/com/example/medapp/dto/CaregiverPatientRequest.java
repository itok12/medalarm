package com.example.medapp.dto;

import jakarta.validation.constraints.NotBlank;

public class CaregiverPatientRequest {
    @NotBlank
    private String patientUsername;

    public String getPatientUsername() {
        return patientUsername;
    }

    public void setPatientUsername(String patientUsername) {
        this.patientUsername = patientUsername;
    }
}
