package com.example.medapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateLogRequest {
    @NotNull
    private Long alarmId;
    @NotBlank
    private String status;

    public Long getAlarmId() { return alarmId; }
    public void setAlarmId(Long alarmId) { this.alarmId = alarmId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
