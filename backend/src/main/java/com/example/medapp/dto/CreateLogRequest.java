package com.example.medapp.dto;

public class CreateLogRequest {
    private Long alarmId;
    private String status;

    public Long getAlarmId() { return alarmId; }
    public void setAlarmId(Long alarmId) { this.alarmId = alarmId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
