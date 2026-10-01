package com.example.medapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class CreateLogRequest {
    @NotNull
    private Long alarmId;
    @NotBlank
    private String status;
    // Optional: the dose being answered (local wall-clock time). When omitted the
    // server picks the alarm's nearest scheduled time.
    private LocalDateTime scheduledFor;

    public Long getAlarmId() { return alarmId; }
    public void setAlarmId(Long alarmId) { this.alarmId = alarmId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getScheduledFor() { return scheduledFor; }
    public void setScheduledFor(LocalDateTime scheduledFor) { this.scheduledFor = scheduledFor; }
}
