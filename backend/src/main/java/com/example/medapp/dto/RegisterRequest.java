package com.example.medapp.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {
    @NotBlank
    @Size(min = 3)
    private String username;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 6)
    private String password;

    private String timezone;

    // Explicit consent to store health data is required to create an account.
    @AssertTrue(message = "Please agree to how MedAlarm stores your medicines and dose history")
    private boolean healthDataConsent;

    public boolean isHealthDataConsent() { return healthDataConsent; }
    public void setHealthDataConsent(boolean healthDataConsent) { this.healthDataConsent = healthDataConsent; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getTimezone() { return timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }
}
