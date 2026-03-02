package com.example.medapp.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.Set;

@Entity
public class Alarm {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalTime alarmTime;
    private boolean active;

    // store enum values as text; avoid column name "day"
    @ElementCollection(targetClass = DaysOfWeek.class)
    @CollectionTable(
        name = "alarm_repeat_days",
        joinColumns = @JoinColumn(name = "alarm_id")
    )
    @Enumerated(EnumType.STRING)
    @Column(name = "day_name")
    private Set<DaysOfWeek> repeatDays = new HashSet<>();

    @ManyToOne
    @JoinColumn(name = "medicine_id")
    @JsonIgnore
    private Medicine medicine;

    // getters & setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalTime getAlarmTime() { return alarmTime; }
    public void setAlarmTime(LocalTime alarmTime) { this.alarmTime = alarmTime; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public Set<DaysOfWeek> getRepeatDays() { return repeatDays; }
    public void setRepeatDays(Set<DaysOfWeek> repeatDays) { this.repeatDays = repeatDays; }

    public Medicine getMedicine() { return medicine; }
    public void setMedicine(Medicine medicine) { this.medicine = medicine; }

    @JsonProperty("medicineId")    
    public Long getMedicineId() { return (medicine != null) ? medicine.getId() : null; }

}
