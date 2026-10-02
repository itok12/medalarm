package com.example.medapp.controller;

import com.example.medapp.dto.CaregiverPatientRequest;
import com.example.medapp.entity.MedicationLog;
import com.example.medapp.service.CaregiverService;
import com.example.medapp.service.CaregiverService.LinkView;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/caregivers")
public class CaregiverController {

    private final CaregiverService caregiverService;

    public CaregiverController(CaregiverService caregiverService) {
        this.caregiverService = caregiverService;
    }

    // ── As a caregiver ─────────────────────────────────────────────────────────

    /** Sends an access request; the patient must accept it before anything is shared. */
    @PostMapping("/patients")
    public ResponseEntity<LinkView> requestAccess(@Valid @RequestBody CaregiverPatientRequest body) {
        return ResponseEntity.status(201).body(caregiverService.requestAccess(body.getPatientUsername()));
    }

    @GetMapping("/patients")
    public List<LinkView> listPatients() {
        return caregiverService.listPatients();
    }

    @DeleteMapping("/patients/{patientId}")
    public ResponseEntity<Void> removePatient(@PathVariable Long patientId) {
        caregiverService.removePatient(patientId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/patients/{patientId}/logs")
    public List<MedicationLog> getPatientLogs(@PathVariable Long patientId) {
        return caregiverService.readPatientLogs(patientId);
    }

    // ── As a patient ───────────────────────────────────────────────────────────

    /** Pending requests and accepted caregivers who can see the current user's history. */
    @GetMapping("/caregivers")
    public List<LinkView> listCaregivers() {
        return caregiverService.listCaregivers();
    }

    @PostMapping("/caregivers/{caregiverId}/accept")
    public LinkView acceptCaregiver(@PathVariable Long caregiverId) {
        return caregiverService.acceptCaregiver(caregiverId);
    }

    /** Declines a pending request or revokes an accepted caregiver. */
    @DeleteMapping("/caregivers/{caregiverId}")
    public ResponseEntity<Void> removeCaregiver(@PathVariable Long caregiverId) {
        caregiverService.removeCaregiver(caregiverId);
        return ResponseEntity.noContent().build();
    }
}
