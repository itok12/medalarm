package com.example.medapp.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "medication_log")
public class MedicationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "alarm_id")
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
}
