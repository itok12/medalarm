package com.example.medapp.dto;

import java.time.LocalTime;

public class UpdateProfileRequest {

    private String currentPassword;
    private String newPassword;
    private String email;
    private String timezone;
    private Boolean emailRemindersEnabled;
    private LocalTime defaultAlarmTime;

    public UpdateProfileRequest() {
    }

    public String getCurrentPassword() {
        return currentPassword;
    }

    public void setCurrentPassword(String currentPassword) {
        this.currentPassword = currentPassword;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public Boolean getEmailRemindersEnabled() {
        return emailRemindersEnabled;
    }

    public void setEmailRemindersEnabled(Boolean emailRemindersEnabled) {
        this.emailRemindersEnabled = emailRemindersEnabled;
    }

    public LocalTime getDefaultAlarmTime() {
        return defaultAlarmTime;
    }

    public void setDefaultAlarmTime(LocalTime defaultAlarmTime) {
        this.defaultAlarmTime = defaultAlarmTime;
    }
}
