package com.example.medapp.controller;

import com.example.medapp.dto.CreateLogRequest;
import com.example.medapp.entity.MedicationLog;
import com.example.medapp.repository.CaregiverRepository;
import com.example.medapp.service.MedicationLogService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/logs")
public class MedicationLogController {

    private final MedicationLogService medicationLogService;
    private final CaregiverRepository caregiverRepository;

    public MedicationLogController(MedicationLogService medicationLogService,
                                    CaregiverRepository caregiverRepository) {
        this.medicationLogService = medicationLogService;
        this.caregiverRepository = caregiverRepository;
    }

    @PostMapping
    public ResponseEntity<MedicationLog> logMedication(@RequestBody CreateLogRequest req) {
        MedicationLog log = medicationLogService.logMedication(req.getAlarmId(), req.getStatus());
        return ResponseEntity.ok(log);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<MedicationLog>> getLogsForUser(@PathVariable Long userId) {
        return ResponseEntity.ok(medicationLogService.getLogsForUser(userId));
    }

    @GetMapping("/user/{userId}/export")
    public ResponseEntity<byte[]> exportCSV(@PathVariable Long userId) {
        List<MedicationLog> logs = medicationLogService.getLogsForUser(userId);

        StringBuilder sb = new StringBuilder();
        sb.append("Date,Time,Medicine,Dosage,Status\n");

        DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        DateTimeFormatter timeFmt = DateTimeFormatter.ofPattern("HH:mm:ss");

        for (MedicationLog log : logs) {
            String date = log.getTakenAt() != null ? log.getTakenAt().format(dateFmt) : "";
            String time = log.getTakenAt() != null ? log.getTakenAt().format(timeFmt) : "";
            String medicine = "";
            String dosage = "";
            if (log.getAlarm() != null && log.getAlarm().getMedicine() != null) {
                medicine = escapeCSV(log.getAlarm().getMedicine().getName());
                dosage = escapeCSV(log.getAlarm().getMedicine().getDosage());
            }
            String status = log.getStatus() != null ? log.getStatus() : "";
            sb.append(date).append(",")
              .append(time).append(",")
              .append(medicine).append(",")
              .append(dosage).append(",")
              .append(status).append("\n");
        }

        byte[] bytes = sb.toString().getBytes(StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"adherence-log.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(bytes);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<?> getPatientLogs(@PathVariable Long patientId,
                                             @RequestParam Long caregiverId) {
        if (!caregiverRepository.existsByCaregiverIdAndPatientId(caregiverId, patientId)) {
            return ResponseEntity.status(403).body(java.util.Map.of("error", "Not authorized to view this patient's logs"));
        }
        return ResponseEntity.ok(medicationLogService.getLogsForUser(patientId));
    }

    private String escapeCSV(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}

