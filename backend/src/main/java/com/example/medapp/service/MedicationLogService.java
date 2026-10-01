package com.example.medapp.service;

import com.example.medapp.entity.Alarm;
import com.example.medapp.entity.MedicationLog;
import com.example.medapp.entity.Medicine;
import com.example.medapp.entity.User;
import com.example.medapp.repository.AlarmRepository;
import com.example.medapp.repository.CaregiverRepository;
import com.example.medapp.repository.MedicationLogRepository;
import com.example.medapp.repository.MedicineRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Stream;

@Service
public class MedicationLogService {

    private static final Set<String> ALLOWED_STATUSES = Set.of("TAKEN", "SKIPPED", "SNOOZED");
    // Statuses that answer a dose; a dose has at most one answer.
    private static final Set<String> ANSWER_STATUSES = Set.of("TAKEN", "SKIPPED");
    // How far from "now" a client may say a dose was scheduled.
    private static final Duration MAX_PAST = Duration.ofDays(7);
    private static final Duration MAX_FUTURE = Duration.ofDays(1);

    private final MedicationLogRepository medicationLogRepository;
    private final AlarmRepository alarmRepository;
    private final CaregiverRepository caregiverRepository;
    private final MedicineRepository medicineRepository;
    private final CurrentUserService currentUserService;
    private final Clock clock;

    public MedicationLogService(
            MedicationLogRepository medicationLogRepository,
            AlarmRepository alarmRepository,
            CaregiverRepository caregiverRepository,
            MedicineRepository medicineRepository,
            CurrentUserService currentUserService,
            Clock clock
    ) {
        this.medicationLogRepository = medicationLogRepository;
        this.alarmRepository = alarmRepository;
        this.caregiverRepository = caregiverRepository;
        this.medicineRepository = medicineRepository;
        this.currentUserService = currentUserService;
        this.clock = clock;
    }

    @Transactional
    public MedicationLog logMedication(Long alarmId, String status, LocalDateTime requestedScheduledFor) {
        User user = currentUserService.getCurrentUser();
        Alarm alarm = alarmRepository.findForUserById(alarmId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Alarm not found: " + alarmId));

        String normalizedStatus = status == null ? null : status.trim().toUpperCase(Locale.ROOT);
        if (!ALLOWED_STATUSES.contains(normalizedStatus)) {
            throw new IllegalArgumentException("Invalid status");
        }

        LocalDateTime nowLocal = LocalDateTime.now(clock.withZone(userZone(user)));
        LocalDateTime scheduledFor = requestedScheduledFor != null
                ? validateScheduledFor(requestedScheduledFor, alarm, nowLocal)
                : nearestDose(alarm, nowLocal);
        LocalDateTime nowUtc = LocalDateTime.now(clock.withZone(ZoneOffset.UTC));

        Set<String> sameKind = ANSWER_STATUSES.contains(normalizedStatus) ? ANSWER_STATUSES : Set.of(normalizedStatus);
        var existing = medicationLogRepository
                .findFirstByAlarm_IdAndScheduledForAndStatusIn(alarm.getId(), scheduledFor, sameKind);

        if (existing.isPresent()) {
            MedicationLog log = existing.get();
            if (normalizedStatus.equals(log.getStatus())) {
                // Retried or double-tapped request: already recorded.
                return log;
            }
            // Changed answer for the same dose, e.g. Skipped -> Taken.
            adjustPillCount(alarm, log.getStatus(), normalizedStatus);
            log.setStatus(normalizedStatus);
            log.setTakenAt(nowUtc);
            return medicationLogRepository.save(log);
        }

        MedicationLog log = new MedicationLog();
        log.setAlarm(alarm);
        log.setTakenAt(nowUtc);
        log.setScheduledFor(scheduledFor);
        log.setStatus(normalizedStatus);
        MedicationLog saved = medicationLogRepository.saveAndFlush(log);
        adjustPillCount(alarm, null, normalizedStatus);
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

    private ZoneId userZone(User user) {
        try {
            return ZoneId.of(user.getTimezone());
        } catch (Exception ex) {
            return ZoneOffset.UTC;
        }
    }

    // Older clients don't say which dose they answer: use the alarm's scheduled
    // time closest to now (yesterday, today or tomorrow).
    private LocalDateTime nearestDose(Alarm alarm, LocalDateTime nowLocal) {
        return Stream.of(-1, 0, 1)
                .map(offset -> nowLocal.toLocalDate().plusDays(offset).atTime(alarm.getAlarmTime()))
                .min(Comparator.comparing(candidate -> Duration.between(candidate, nowLocal).abs()))
                .orElseThrow();
    }

    private LocalDateTime validateScheduledFor(LocalDateTime requested, Alarm alarm, LocalDateTime nowLocal) {
        LocalDateTime normalized = requested.withSecond(0).withNano(0);
        if (!normalized.toLocalTime().equals(alarm.getAlarmTime().withSecond(0).withNano(0))) {
            throw new IllegalArgumentException("scheduledFor does not match this alarm's time");
        }
        if (normalized.isBefore(nowLocal.minus(MAX_PAST)) || normalized.isAfter(nowLocal.plus(MAX_FUTURE))) {
            throw new IllegalArgumentException("scheduledFor is too far from the current time");
        }
        return normalized;
    }

    // Keep the pill count consistent with the dose's answer: entering TAKEN uses
    // pills, leaving TAKEN (changed to SKIPPED) gives them back.
    private void adjustPillCount(Alarm alarm, String previousStatus, String nextStatus) {
        boolean wasTaken = "TAKEN".equals(previousStatus);
        boolean isTaken = "TAKEN".equals(nextStatus);
        if (wasTaken == isTaken) {
            return;
        }

        Medicine medicine = alarm.getMedicine();
        if (medicine == null || medicine.getPillsRemaining() == null) {
            return;
        }
        int perDose = medicine.getPillsPerDose() != null ? medicine.getPillsPerDose() : 1;
        int delta = isTaken ? -perDose : perDose;
        medicine.setPillsRemaining(Math.max(0, medicine.getPillsRemaining() + delta));
        medicineRepository.save(medicine);
    }
}
