package com.example.medapp.service;

import com.example.medapp.entity.Alarm;
import com.example.medapp.entity.DaysOfWeek;
import com.example.medapp.entity.Medicine;
import com.example.medapp.repository.AlarmRepository;
import com.example.medapp.repository.MedicineRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.medapp.dto.CreateAlarmRequest;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.HashSet;
import java.util.List;

@Service
public class AlarmService {

    private final AlarmRepository alarmRepository;
    private final MedicineRepository medicineRepository;

    public AlarmService(AlarmRepository alarmRepository, MedicineRepository medicineRepository) {
        this.alarmRepository = alarmRepository;
        this.medicineRepository = medicineRepository;
    }

    @Transactional(readOnly = true)
    public List<Alarm> getAlarmsForUser(Long userId) {
        return alarmRepository.findForUser(userId);
    }

    @Transactional
    public List<Alarm> generateAlarmsForMedicine(Long medicineId) {
        Medicine medicine = medicineRepository.findById(medicineId)
                .orElseThrow(() -> new IllegalArgumentException("Medicine not found: " + medicineId));

        List<Alarm> alarms = new ArrayList<>();

        String freq = (medicine.getFrequency() == null ? "" : medicine.getFrequency()).toLowerCase();

        if ("as needed".equals(freq)) return alarms;

        int timesPerDay = switch (freq) {
            case "once daily" -> 1;
            case "twice daily" -> 2;
            case "three times daily" -> 3;
            case "four times daily" -> 4;
            default -> 1;
        };

        LocalTime[] baseTimes = {
            LocalTime.of(8, 0), LocalTime.of(14, 0), LocalTime.of(20, 0), LocalTime.of(23, 0)
        };

        var defaultDays = EnumSet.of(DaysOfWeek.MONDAY, DaysOfWeek.TUESDAY, DaysOfWeek.WEDNESDAY, DaysOfWeek.THURSDAY, DaysOfWeek.FRIDAY);

        for (int i = 0; i < timesPerDay; i++) {
            Alarm alarm = new Alarm();
            alarm.setMedicine(medicine);
            alarm.setAlarmTime(baseTimes[i]);
            alarm.setActive(true);
            // FIX: Copy EnumSet to HashSet for safely persisting to JPA
            alarm.setRepeatDays(new HashSet<>(defaultDays));
            alarms.add(alarmRepository.save(alarm));
        }

        return alarms;
    }

    @Transactional
    public Alarm setAlarmActive(Long alarmId, boolean isActive) {
        Alarm alarm = alarmRepository.findById(alarmId)
                .orElseThrow(() -> new RuntimeException("Alarm not found: " + alarmId));
        alarm.setActive(isActive);
        return alarmRepository.save(alarm);
    }


    @Transactional
    public Alarm createAlarm(CreateAlarmRequest req) {
        Medicine medicine = medicineRepository.findById(req.getMedicineId())
                .orElseThrow(() -> new IllegalArgumentException("Medicine not found: " + req.getMedicineId()));

        Alarm alarm = new Alarm();
        alarm.setMedicine(medicine);
        
        // Parse String alarmTime to LocalTime (e.g., "08:30", "14:45")
        if (req.getAlarmTime() != null && !req.getAlarmTime().isEmpty()) {
            try {
                alarm.setAlarmTime(LocalTime.parse(req.getAlarmTime()));
            } catch (Exception ex) {
                throw new IllegalArgumentException("Invalid alarmTime. Use HH:mm (e.g. 08:30)");
            }
        }
        
        alarm.setActive(req.isActive());
        if (req.getRepeatDays() != null && !req.getRepeatDays().isEmpty()) {
            var days = new HashSet<DaysOfWeek>();
            for (String d : req.getRepeatDays()) {
                days.add(normalizeDay(d));
            }
            alarm.setRepeatDays(days);
        }

        return alarmRepository.save(alarm);
    }

    private DaysOfWeek normalizeDay(String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException("Invalid repeatDays value: " + value);
        }
        String key = value.trim().toUpperCase();
        try {
            return DaysOfWeek.valueOf(key.length() == 3 ? getFullDayName(key) : key);
        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid repeatDays value: " + value);
        }
    }

    private String getFullDayName(String shortName) {
        return switch(shortName) {
            case "MON" -> "MONDAY";
            case "TUE" -> "TUESDAY";
            case "WED" -> "WEDNESDAY";
            case "THU" -> "THURSDAY";
            case "FRI" -> "FRIDAY";
            case "SAT" -> "SATURDAY";
            case "SUN" -> "SUNDAY";
            default -> shortName;
        };
    }
    
}
