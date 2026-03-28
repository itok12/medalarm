package com.example.medapp.controller;

import com.example.medapp.dto.CreateLogRequest;
import com.example.medapp.entity.MedicationLog;
import com.example.medapp.service.MedicationLogService;
import jakarta.validation.Valid;
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

    public MedicationLogController(MedicationLogService medicationLogService) {
        this.medicationLogService = medicationLogService;
    }

    @PostMapping
    public ResponseEntity<MedicationLog> logMedication(@Valid @RequestBody CreateLogRequest req) {
        MedicationLog log = medicationLogService.logMedication(req.getAlarmId(), req.getStatus());
        return ResponseEntity.ok(log);
    }

    @GetMapping
    public ResponseEntity<List<MedicationLog>> getLogsForCurrentUser() {
        return ResponseEntity.ok(medicationLogService.getLogsForCurrentUser());
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportCSV() {
        List<MedicationLog> logs = medicationLogService.getLogsForCurrentUser();

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
    private String escapeCSV(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}

