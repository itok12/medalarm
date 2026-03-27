package com.example.medapp.service;

import com.example.medapp.entity.Alarm;
import com.example.medapp.entity.MedicationLog;
import com.example.medapp.repository.AlarmRepository;
import com.example.medapp.repository.MedicationLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MedicationLogService {

    private final MedicationLogRepository medicationLogRepository;
    private final AlarmRepository alarmRepository;

    public MedicationLogService(MedicationLogRepository medicationLogRepository,
                                AlarmRepository alarmRepository) {
        this.medicationLogRepository = medicationLogRepository;
        this.alarmRepository = alarmRepository;
    }

    @Transactional
    public MedicationLog logMedication(Long alarmId, String status) {
        Alarm alarm = alarmRepository.findById(alarmId)
                .orElseThrow(() -> new IllegalArgumentException("Alarm not found: " + alarmId));

        MedicationLog log = new MedicationLog();
        log.setAlarm(alarm);
        log.setTakenAt(LocalDateTime.now());
        log.setStatus(status);

        return medicationLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public List<MedicationLog> getLogsForUser(Long userId) {
        return medicationLogRepository.findByAlarm_Medicine_User_IdOrderByTakenAtDesc(userId);
    }
}
