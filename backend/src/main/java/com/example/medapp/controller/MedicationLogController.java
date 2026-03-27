package com.example.medapp.controller;

import com.example.medapp.dto.CreateLogRequest;
import com.example.medapp.entity.MedicationLog;
import com.example.medapp.service.MedicationLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/logs")
public class MedicationLogController {

    private final MedicationLogService medicationLogService;

    public MedicationLogController(MedicationLogService medicationLogService) {
        this.medicationLogService = medicationLogService;
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
}
