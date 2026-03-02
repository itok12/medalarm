package com.example.medapp.dto;

import java.util.Set;

public class CreateAlarmRequest {
    private Long medicineId;
    private String alarmTime;
    private boolean active;
    private Set<String> repeatDays;

    public Long getMedicineId() { return medicineId; }
    public void setMedicineId(Long medicineId) { this.medicineId = medicineId; }

    public String getAlarmTime() { return alarmTime; }
    public void setAlarmTime(String alarmTime) { this.alarmTime = alarmTime; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public Set<String> getRepeatDays() { return repeatDays; }
    public void setRepeatDays(Set<String> repeatDays) { this.repeatDays = repeatDays; }
}

