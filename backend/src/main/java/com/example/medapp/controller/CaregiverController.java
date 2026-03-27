package com.example.medapp.controller;

import com.example.medapp.entity.CaregiverRelation;
import com.example.medapp.entity.User;
import com.example.medapp.repository.CaregiverRepository;
import com.example.medapp.repository.UserRepository;
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

    public CaregiverController(CaregiverRepository caregiverRepository,
                                UserRepository userRepository) {
        this.caregiverRepository = caregiverRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<?> addPatient(@RequestBody Map<String, Object> body) {
        Long caregiverId = Long.valueOf(body.get("caregiverId").toString());
        String patientUsername = body.get("patientUsername").toString();

        User caregiver = userRepository.findById(caregiverId).orElse(null);
        if (caregiver == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Caregiver not found"));
        }

        User patient = userRepository.findByUsername(patientUsername).orElse(null);
        if (patient == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Patient not found"));
        }

        if (caregiverId.equals(patient.getId())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Cannot add yourself as a patient"));
        }

        if (caregiverRepository.existsByCaregiverIdAndPatientId(caregiverId, patient.getId())) {
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

    @GetMapping("/{caregiverId}/patients")
    public ResponseEntity<List<Map<String, Object>>> getPatients(@PathVariable Long caregiverId) {
        List<CaregiverRelation> relations = caregiverRepository.findByCaregiver_Id(caregiverId);
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
}
