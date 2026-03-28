package com.example.medapp.dto;

public class AuthResponse {
    private String token;
    private Long userId;
    private String username;
    private String email;
    private String refreshToken;
    private String timezone;
    private boolean emailRemindersEnabled;
    private String defaultAlarmTime;

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
            String refreshToken,
            String timezone,
            boolean emailRemindersEnabled,
            String defaultAlarmTime
    ) {
        this.token = token;
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.refreshToken = refreshToken;
        this.timezone = timezone;
        this.emailRemindersEnabled = emailRemindersEnabled;
        this.defaultAlarmTime = defaultAlarmTime;
    }

    public String getToken() { return token; }
    public Long getUserId() { return userId; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getRefreshToken() { return refreshToken; }
    public String getTimezone() { return timezone; }
    public boolean isEmailRemindersEnabled() { return emailRemindersEnabled; }
    public String getDefaultAlarmTime() { return defaultAlarmTime; }
}
