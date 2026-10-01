package com.example.medapp.service;

import com.example.medapp.dto.GuestImportRequest;
import com.example.medapp.dto.GuestImportRequest.AlarmItem;
import com.example.medapp.dto.GuestImportRequest.LogItem;
import com.example.medapp.dto.GuestImportRequest.MedicineItem;
import com.example.medapp.entity.Alarm;
import com.example.medapp.entity.AlarmSource;
import com.example.medapp.entity.DaysOfWeek;
import com.example.medapp.entity.MedicationLog;
import com.example.medapp.entity.Medicine;
import com.example.medapp.entity.User;
import com.example.medapp.repository.AlarmRepository;
import com.example.medapp.repository.MedicationLogRepository;
import com.example.medapp.repository.MedicineRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneOffset;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

/**
 * Moves a guest's on-device data into their account in one transaction: either
 * everything is imported or nothing is, so the device only clears its copy
 * after the server has all of it.
 */
@Service
public class GuestImportService {

    public record ImportResult(int medicines, int alarms, int logs) {
    }

    private static final Set<String> STATUSES = Set.of("TAKEN", "SKIPPED", "SNOOZED");

    private final MedicineRepository medicineRepository;
    private final AlarmRepository alarmRepository;
    private final MedicationLogRepository medicationLogRepository;
    private final CurrentUserService currentUserService;
    private final Clock clock;

    public GuestImportService(MedicineRepository medicineRepository,
                              AlarmRepository alarmRepository,
                              MedicationLogRepository medicationLogRepository,
                              CurrentUserService currentUserService,
                              Clock clock) {
        this.medicineRepository = medicineRepository;
        this.alarmRepository = alarmRepository;
        this.medicationLogRepository = medicationLogRepository;
        this.currentUserService = currentUserService;
        this.clock = clock;
    }

    @Transactional
    public ImportResult importGuestData(GuestImportRequest request) {
        User user = currentUserService.getCurrentUser();
        LocalDate today = LocalDate.now(clock);

        Map<Long, Medicine> medicinesByGuestId = new HashMap<>();
        for (MedicineItem item : request.medicines()) {
            Medicine medicine = new Medicine();
            medicine.setUser(user);
            medicine.setName(item.name().trim());
            medicine.setDosage(item.dosage() == null ? "" : item.dosage());
            medicine.setFrequency(item.frequency() == null || item.frequency().isBlank() ? "Once daily" : item.frequency());
            medicine.setInstructions(item.instructions());
            medicine.setStartDate(item.startDate() != null ? item.startDate() : today);
            medicine.setEndDate(item.endDate());
            // Pill counts are imported as they stand; replaying logs below must not use pills again.
            medicine.setPillsRemaining(item.pillsRemaining());
            medicine.setPillsPerDose(item.pillsPerDose() != null ? item.pillsPerDose() : 1);
            medicinesByGuestId.put(item.id(), medicineRepository.save(medicine));
        }

        Map<Long, Alarm> alarmsByGuestId = new HashMap<>();
        for (AlarmItem item : request.alarms()) {
            Medicine medicine = medicinesByGuestId.get(item.medicineId());
            if (medicine == null) {
                throw new IllegalArgumentException("Alarm " + item.id() + " refers to an unknown medicine");
            }
            Alarm alarm = new Alarm();
            alarm.setMedicine(medicine);
            alarm.setAlarmTime(parseTime(item.alarmTime()));
            alarm.setActive(item.active() == null || item.active());
            alarm.setRepeatDays(parseDays(item.repeatDays()));
            alarm.setSource(AlarmSource.MANUAL);
            alarmsByGuestId.put(item.id(), alarmRepository.save(alarm));
        }

        int importedLogs = 0;
        Set<String> seenDoses = new HashSet<>();
        for (LogItem item : request.logs()) {
            Alarm alarm = alarmsByGuestId.get(item.alarmId());
            String status = item.status().trim().toUpperCase(Locale.ROOT);
            if (alarm == null || !STATUSES.contains(status)) {
                // Logs for alarms the guest deleted have nothing to attach to.
                continue;
            }
            if (item.scheduledFor() != null && !seenDoses.add(alarm.getId() + "|" + item.scheduledFor() + "|" + status)) {
                continue;
            }

            MedicationLog log = new MedicationLog();
            log.setAlarm(alarm);
            log.setStatus(status);
            log.setScheduledFor(item.scheduledFor());
            log.setTakenAt(item.takenAt() != null
                    ? LocalDateTime.ofInstant(item.takenAt(), ZoneOffset.UTC)
                    : LocalDateTime.now(clock.withZone(ZoneOffset.UTC)));
            medicationLogRepository.save(log);
            importedLogs++;
        }

        return new ImportResult(medicinesByGuestId.size(), alarmsByGuestId.size(), importedLogs);
    }

    private LocalTime parseTime(String value) {
        try {
            return LocalTime.parse(value.length() > 5 ? value.substring(0, 5) : value);
        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid alarmTime: " + value);
        }
    }

    private Set<DaysOfWeek> parseDays(Set<String> values) {
        if (values == null || values.isEmpty()) {
            return EnumSet.allOf(DaysOfWeek.class);
        }
        Set<DaysOfWeek> days = EnumSet.noneOf(DaysOfWeek.class);
        for (String value : values) {
            try {
                days.add(DaysOfWeek.valueOf(value.trim().toUpperCase(Locale.ROOT)));
            } catch (Exception ex) {
                throw new IllegalArgumentException("Invalid repeat day: " + value);
            }
        }
        return days;
    }
}
