package com.example.medapp.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

public class AuthResponse {
    private String token;
    private Long userId;
    private String username;
    private String email;
    private String timezone;
    private boolean emailRemindersEnabled;
    private String defaultAlarmTime;
    // Only sent to native apps, whose WebView drops the refresh cookie. Web clients
    // keep the HttpOnly cookie so the token is never readable by page scripts.
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String refreshToken;
    private String healthDataConsentAt;

    public AuthResponse(String token, Long userId, String username) {
        this.token = token;
        this.userId = userId;
        this.username = username;
    }

    public AuthResponse(
            String token,
            Long userId,
            String username,
            String email,
            String timezone,
            boolean emailRemindersEnabled,
            String defaultAlarmTime
    ) {
        this.token = token;
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.timezone = timezone;
        this.emailRemindersEnabled = emailRemindersEnabled;
        this.defaultAlarmTime = defaultAlarmTime;
    }

    public String getToken() { return token; }
    public String getRefreshToken() { return refreshToken; }
    public String getHealthDataConsentAt() { return healthDataConsentAt; }
    public void setHealthDataConsentAt(String healthDataConsentAt) { this.healthDataConsentAt = healthDataConsentAt; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
    public Long getUserId() { return userId; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getTimezone() { return timezone; }
    public boolean isEmailRemindersEnabled() { return emailRemindersEnabled; }
    public String getDefaultAlarmTime() { return defaultAlarmTime; }
}
