package com.example.medapp.controller;

import com.example.medapp.dto.CreateLogRequest;
import com.example.medapp.entity.MedicationLog;
import com.example.medapp.service.CurrentUserService;
import com.example.medapp.service.MedicationLogService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/logs")
public class MedicationLogController {

    private final MedicationLogService medicationLogService;
    private final CurrentUserService currentUserService;

    public MedicationLogController(MedicationLogService medicationLogService, CurrentUserService currentUserService) {
        this.medicationLogService = medicationLogService;
        this.currentUserService = currentUserService;
    }

    @PostMapping
    public ResponseEntity<MedicationLog> logMedication(@Valid @RequestBody CreateLogRequest req) {
        MedicationLog log = medicationLogService.logMedication(req.getAlarmId(), req.getStatus(), req.getScheduledFor());
        return ResponseEntity.ok(log);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLog(@PathVariable Long id) {
        medicationLogService.deleteLog(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<MedicationLog>> getLogsForCurrentUser() {
        return ResponseEntity.ok(medicationLogService.getLogsForCurrentUser());
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportCSV() {
        List<MedicationLog> logs = medicationLogService.getLogsForCurrentUser();
        ZoneId zone = userZone();

        StringBuilder sb = new StringBuilder();
        sb.append("Date,Time,Scheduled,Medicine,Dosage,Status\n");

        DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        DateTimeFormatter timeFmt = DateTimeFormatter.ofPattern("HH:mm:ss");
        DateTimeFormatter scheduledFmt = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

        for (MedicationLog log : logs) {
            // takenAt is stored in UTC; show it in the user's own timezone.
            ZonedDateTime loggedAt = log.getTakenAt() != null
                    ? log.getTakenAt().atOffset(ZoneOffset.UTC).atZoneSameInstant(zone)
                    : null;
            String date = loggedAt != null ? loggedAt.format(dateFmt) : "";
            String time = loggedAt != null ? loggedAt.format(timeFmt) : "";
            String scheduled = log.getScheduledFor() != null ? log.getScheduledFor().format(scheduledFmt) : "";
            String medicine = "";
            String dosage = "";
            if (log.getAlarm() != null && log.getAlarm().getMedicine() != null) {
                medicine = escapeCSV(log.getAlarm().getMedicine().getName());
                dosage = escapeCSV(log.getAlarm().getMedicine().getDosage());
            }
            String status = log.getStatus() != null ? log.getStatus() : "";
            sb.append(date).append(",")
              .append(time).append(",")
              .append(scheduled).append(",")
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

    private ZoneId userZone() {
        try {
            return ZoneId.of(currentUserService.getCurrentUser().getTimezone());
        } catch (Exception ex) {
            return ZoneOffset.UTC;
        }
    }

    private String escapeCSV(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
