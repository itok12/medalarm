package com.example.medapp.dto;

import com.example.medapp.entity.User;

public class UserProfileResponse {
    private Long id;
    private String username;
    private String email;
    private String timezone;
    private boolean emailRemindersEnabled;
    private String defaultAlarmTime;

    public UserProfileResponse(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.timezone = user.getTimezone();
        this.emailRemindersEnabled = user.isEmailRemindersEnabled();
        this.defaultAlarmTime = user.getDefaultAlarmTime() != null ? user.getDefaultAlarmTime().toString() : null;
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getTimezone() {
        return timezone;
    }

    public boolean isEmailRemindersEnabled() {
        return emailRemindersEnabled;
    }

    public String getDefaultAlarmTime() {
        return defaultAlarmTime;
    }
}
