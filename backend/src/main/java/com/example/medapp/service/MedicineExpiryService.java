package com.example.medapp.service;

import com.example.medapp.entity.Alarm;
import com.example.medapp.entity.Medicine;
import com.example.medapp.repository.AlarmRepository;
import com.example.medapp.repository.MedicineRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class MedicineExpiryService {

    private static final Logger log = LoggerFactory.getLogger(MedicineExpiryService.class);

    private static final Pattern DURATION_PATTERN =
            Pattern.compile("(\\d+)\\s*(day|days|week|weeks|month|months)", Pattern.CASE_INSENSITIVE);

    private final MedicineRepository medicineRepository;
    private final AlarmRepository alarmRepository;

    public MedicineExpiryService(MedicineRepository medicineRepository,
                                  AlarmRepository alarmRepository) {
        this.medicineRepository = medicineRepository;
        this.alarmRepository = alarmRepository;
    }

    @Scheduled(fixedRate = 3600000) // runs every hour (3 600 000 ms)
    @Transactional
    public void deactivateExpiredMedicineAlarms() {
        List<Medicine> all = medicineRepository.findAll();
        LocalDate today = LocalDate.now();

        for (Medicine medicine : all) {
            if (medicine.getStartDate() == null || medicine.getDuration() == null) {
                continue;
            }

            Integer days = parseDurationToDays(medicine.getDuration());
            if (days == null) {
                continue;
            }

            LocalDate endDate = medicine.getStartDate().plusDays(days);
            if (endDate.isBefore(today)) {
                List<Alarm> alarms = alarmRepository.findByMedicine(medicine);
                for (Alarm alarm : alarms) {
                    if (alarm.isActive()) {
                        alarm.setActive(false);
                        alarmRepository.save(alarm);
                    }
                }
                log.info("Deactivated alarms for expired medicine: {}", medicine.getName());
            }
        }
    }

    static Integer parseDurationToDays(String duration) {
        if (duration == null || duration.isBlank()) {
            return null;
        }
        Matcher m = DURATION_PATTERN.matcher(duration.trim());
        if (!m.find()) {
            return null;
        }
        int value = Integer.parseInt(m.group(1));
        String unit = m.group(2).toLowerCase();
        if (unit.startsWith("day")) {
            return value;
        } else if (unit.startsWith("week")) {
            return value * 7;
        } else if (unit.startsWith("month")) {
            return value * 30;
        }
        return null;
    }
}
