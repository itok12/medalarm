package com.example.medapp.controller;

import com.example.medapp.dto.CreateAlarmRequest;
import com.example.medapp.dto.GenerateAlarmsRequest;
import com.example.medapp.dto.ToggleAlarmRequest;
import com.example.medapp.entity.Alarm;
import com.example.medapp.service.AlarmService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alarms")
public class AlarmController {

    private final AlarmService alarmService;

    public AlarmController(AlarmService alarmService) {
        this.alarmService = alarmService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Alarm>> getAlarmsForUser(@PathVariable Long userId) {
        return ResponseEntity.ok(alarmService.getAlarmsForUser(userId));
    }

    @PostMapping
    public ResponseEntity<Alarm> createAlarm(@Valid @RequestBody CreateAlarmRequest req) {
        return ResponseEntity.ok(alarmService.createAlarm(req));
    }

    @PostMapping("/generate")
    public ResponseEntity<List<Alarm>> generateForMedicine(@RequestBody GenerateAlarmsRequest request) {
        return ResponseEntity.ok(alarmService.generateAlarmsForMedicine(request.medicineId()));
    }

    @PatchMapping("/{alarmId}")
    public ResponseEntity<Alarm> toggleAlarm(@PathVariable Long alarmId, @RequestBody ToggleAlarmRequest body) {
        return ResponseEntity.ok(alarmService.setAlarmActive(alarmId, body.getActive()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAlarm(@PathVariable Long id) {
        alarmService.deleteAlarm(id);
        return ResponseEntity.noContent().build();
    }
}
