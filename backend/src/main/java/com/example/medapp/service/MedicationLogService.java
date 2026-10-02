package com.example.medapp.service;

import com.example.medapp.entity.Alarm;
import com.example.medapp.entity.MedicationLog;
import com.example.medapp.repository.AlarmRepository;
import com.example.medapp.repository.CaregiverRepository;
import com.example.medapp.repository.MedicationLogRepository;
import com.example.medapp.repository.MedicineRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class MedicationLogService {

    private static final Set<String> ALLOWED_STATUSES = Set.of("TAKEN", "SKIPPED", "SNOOZED");

    private final MedicationLogRepository medicationLogRepository;
    private final AlarmRepository alarmRepository;
    private final CaregiverRepository caregiverRepository;
    private final MedicineRepository medicineRepository;
    private final CurrentUserService currentUserService;

    public MedicationLogService(
            MedicationLogRepository medicationLogRepository,
            AlarmRepository alarmRepository,
            CaregiverRepository caregiverRepository,
            MedicineRepository medicineRepository,
            CurrentUserService currentUserService
    ) {
        this.medicationLogRepository = medicationLogRepository;
        this.alarmRepository = alarmRepository;
        this.caregiverRepository = caregiverRepository;
        this.medicineRepository = medicineRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional
    public MedicationLog logMedication(Long alarmId, String status) {
        Alarm alarm = alarmRepository.findForUserById(alarmId, currentUserService.getCurrentUserId())
                .orElseThrow(() -> new IllegalArgumentException("Alarm not found: " + alarmId));

        String normalizedStatus = status == null ? null : status.trim().toUpperCase(Locale.ROOT);
        if (!ALLOWED_STATUSES.contains(normalizedStatus)) {
            throw new IllegalArgumentException("Invalid status");
        }

        MedicationLog log = new MedicationLog();
        log.setAlarm(alarm);
        log.setTakenAt(LocalDateTime.now());
        log.setStatus(normalizedStatus);
        MedicationLog saved = medicationLogRepository.save(log);

        // Decrement pill supply when a dose is taken
        if ("TAKEN".equals(normalizedStatus)) {
            Long medicineId = alarm.getMedicine().getId();
            medicineRepository.findById(medicineId).ifPresent(medicine -> {
                if (medicine.getPillsRemaining() != null && medicine.getPillsRemaining() > 0) {
                    int perDose = medicine.getPillsPerDose() != null ? medicine.getPillsPerDose() : 1;
                    medicine.setPillsRemaining(Math.max(0, medicine.getPillsRemaining() - perDose));
                    medicineRepository.save(medicine);
                }
            });
        }

        return saved;
    }

    @Transactional(readOnly = true)
    public List<MedicationLog> getLogsForCurrentUser() {
        return medicationLogRepository.findDetailedForUser(currentUserService.getCurrentUserId());
    }

    @Transactional(readOnly = true)
    public List<MedicationLog> getLogsForPatient(Long patientId) {
        Long caregiverId = currentUserService.getCurrentUserId();
        if (!caregiverRepository.existsByCaregiverIdAndPatientId(caregiverId, patientId)) {
            throw new AccessDeniedException("Not authorized to view this patient's logs");
        }
        return medicationLogRepository.findDetailedForUser(patientId);
    }
}
