package com.example.medapp.controller;

import com.example.medapp.dto.CaregiverPatientRequest;
import com.example.medapp.entity.CaregiverRelation;
import com.example.medapp.entity.MedicationLog;
import com.example.medapp.entity.User;
import com.example.medapp.repository.CaregiverRepository;
import com.example.medapp.repository.UserRepository;
import com.example.medapp.service.CurrentUserService;
import com.example.medapp.service.MedicationLogService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/caregivers")
public class CaregiverController {

    private final CaregiverRepository caregiverRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;
    private final MedicationLogService medicationLogService;

    public CaregiverController(CaregiverRepository caregiverRepository,
                                UserRepository userRepository,
                                CurrentUserService currentUserService,
                                MedicationLogService medicationLogService) {
        this.caregiverRepository = caregiverRepository;
        this.userRepository = userRepository;
        this.currentUserService = currentUserService;
        this.medicationLogService = medicationLogService;
    }

    @PostMapping("/patients")
    public ResponseEntity<?> addPatient(@Valid @RequestBody CaregiverPatientRequest body) {
        User caregiver = currentUserService.getCurrentUser();
        String patientUsername = body.getPatientUsername();

        User patient = userRepository.findByUsername(patientUsername).orElse(null);
        if (patient == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Patient not found"));
        }

        if (caregiver.getId().equals(patient.getId())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Cannot add yourself as a patient"));
        }

        if (caregiverRepository.existsByCaregiverIdAndPatientId(caregiver.getId(), patient.getId())) {
            return ResponseEntity.status(409).body(Map.of("error", "Relation already exists"));
        }

        CaregiverRelation relation = new CaregiverRelation();
        relation.setCaregiver(caregiver);
        relation.setPatient(patient);
        caregiverRepository.save(relation);

        return ResponseEntity.status(201).body(Map.of(
                "id", patient.getId(),
                "username", patient.getUsername(),
                "email", patient.getEmail() != null ? patient.getEmail() : ""
        ));
    }

    @GetMapping("/patients")
    public ResponseEntity<List<Map<String, Object>>> getPatients() {
        List<CaregiverRelation> relations = caregiverRepository.findByCaregiver_IdOrderByPatient_UsernameAsc(currentUserService.getCurrentUserId());
        List<Map<String, Object>> patients = relations.stream()
                .map(r -> {
                    User p = r.getPatient();
                    return Map.<String, Object>of(
                            "id", p.getId(),
                            "username", p.getUsername(),
                            "email", p.getEmail() != null ? p.getEmail() : ""
                    );
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(patients);
    }

    @GetMapping("/patients/{patientId}/logs")
    public ResponseEntity<List<MedicationLog>> getPatientLogs(@PathVariable Long patientId) {
        return ResponseEntity.ok(medicationLogService.getLogsForPatient(patientId));
    }
}
