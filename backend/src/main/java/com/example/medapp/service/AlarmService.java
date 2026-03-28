package com.example.medapp.service;

import com.example.medapp.dto.CreateAlarmRequest;
import com.example.medapp.entity.Alarm;
import com.example.medapp.entity.AlarmSource;
import com.example.medapp.entity.DaysOfWeek;
import com.example.medapp.entity.Medicine;
import com.example.medapp.entity.User;
import com.example.medapp.repository.AlarmRepository;
import com.example.medapp.repository.MedicineRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.HashSet;
import java.util.List;

@Service
public class AlarmService {

    private final AlarmRepository alarmRepository;
    private final MedicineRepository medicineRepository;
    private final CurrentUserService currentUserService;

    public AlarmService(
            AlarmRepository alarmRepository,
            MedicineRepository medicineRepository,
            CurrentUserService currentUserService
    ) {
        this.alarmRepository = alarmRepository;
        this.medicineRepository = medicineRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public List<Alarm> getAlarmsForCurrentUser() {
        return alarmRepository.findForUser(currentUserService.getCurrentUserId());
    }

    @Transactional
    public List<Alarm> generateAlarmsForMedicine(Long medicineId) {
        User user = currentUserService.getCurrentUser();
        Medicine medicine = medicineRepository.findForUserById(medicineId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Medicine not found: " + medicineId));

        List<Alarm> alarms = new ArrayList<>();
        String frequency = medicine.getFrequency() == null ? "" : medicine.getFrequency().toLowerCase();
        if ("as needed".equals(frequency)) {
            return alarms;
        }

        int timesPerDay = switch (frequency) {
            case "once daily" -> 1;
            case "twice daily" -> 2;
            case "three times daily" -> 3;
            case "four times daily" -> 4;
            default -> 1;
        };

        alarmRepository.findByMedicine_IdAndMedicine_User_Id(medicineId, user.getId()).stream()
                .filter(existing -> existing.getSource() == AlarmSource.AUTO)
                .forEach(alarmRepository::delete);

        LocalTime anchorTime = user.getDefaultAlarmTime() != null ? user.getDefaultAlarmTime() : LocalTime.of(8, 0);
        int intervalHours = switch (timesPerDay) {
            case 1 -> 24;
            case 2 -> 12;
            case 3 -> 6;
            case 4 -> 4;
            default -> 24;
        };

        var defaultDays = EnumSet.allOf(DaysOfWeek.class);
        for (int i = 0; i < timesPerDay; i++) {
            Alarm alarm = new Alarm();
            alarm.setMedicine(medicine);
            alarm.setAlarmTime(anchorTime.plusHours((long) intervalHours * i));
            alarm.setActive(true);
            alarm.setRepeatDays(new HashSet<>(defaultDays));
            alarm.setSource(AlarmSource.AUTO);
            alarms.add(alarmRepository.save(alarm));
        }

        return alarms;
    }

    @Transactional
    public Alarm setAlarmActive(Long alarmId, boolean isActive) {
        Alarm alarm = alarmRepository.findForUserById(alarmId, currentUserService.getCurrentUserId())
                .orElseThrow(() -> new IllegalArgumentException("Alarm not found: " + alarmId));
        alarm.setActive(isActive);
        return alarmRepository.save(alarm);
    }

    @Transactional
    public void deleteAlarm(Long alarmId) {
        Alarm alarm = alarmRepository.findForUserById(alarmId, currentUserService.getCurrentUserId())
                .orElseThrow(() -> new IllegalArgumentException("Alarm not found: " + alarmId));
        alarmRepository.delete(alarm);
    }

    @Transactional
    public Alarm createAlarm(CreateAlarmRequest req) {
        Medicine medicine = medicineRepository.findForUserById(req.getMedicineId(), currentUserService.getCurrentUserId())
                .orElseThrow(() -> new IllegalArgumentException("Medicine not found: " + req.getMedicineId()));

        Alarm alarm = new Alarm();
        alarm.setMedicine(medicine);
        try {
            alarm.setAlarmTime(LocalTime.parse(req.getAlarmTime()));
        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid alarmTime. Use HH:mm (e.g. 08:30)");
        }

        alarm.setActive(req.isActive());
        if (req.getRepeatDays() == null || req.getRepeatDays().isEmpty()) {
            throw new IllegalArgumentException("At least one repeat day is required");
        }

        var days = new HashSet<DaysOfWeek>();
        for (String day : req.getRepeatDays()) {
            days.add(normalizeDay(day));
        }
        alarm.setRepeatDays(days);
        alarm.setSource(AlarmSource.MANUAL);

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
        return switch (shortName) {
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
