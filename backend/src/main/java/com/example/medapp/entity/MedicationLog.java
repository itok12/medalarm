package com.example.medapp.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "medication_log")
public class MedicationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "alarm_id")
    @JsonIgnore
    private Alarm alarm;

    private LocalDateTime takenAt;

    private String status; // TAKEN, SKIPPED, SNOOZED

    public MedicationLog() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Alarm getAlarm() { return alarm; }
    public void setAlarm(Alarm alarm) { this.alarm = alarm; }

    public LocalDateTime getTakenAt() { return takenAt; }
    public void setTakenAt(LocalDateTime takenAt) { this.takenAt = takenAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    @JsonProperty("alarmId")
    public Long getAlarmId() {
        return alarm != null ? alarm.getId() : null;
    }

    @JsonProperty("medicineId")
    public Long getMedicineId() {
        return alarm != null && alarm.getMedicine() != null ? alarm.getMedicine().getId() : null;
    }

    @JsonProperty("medicineName")
    public String getMedicineName() {
        return alarm != null && alarm.getMedicine() != null ? alarm.getMedicine().getName() : null;
    }
}
