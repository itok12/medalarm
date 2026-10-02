package com.example.medapp.service;

import com.example.medapp.entity.CaregiverAccessLog;
import com.example.medapp.entity.CaregiverRelation;
import com.example.medapp.entity.CaregiverStatus;
import com.example.medapp.entity.MedicationLog;
import com.example.medapp.entity.User;
import com.example.medapp.repository.CaregiverAccessLogRepository;
import com.example.medapp.repository.CaregiverRepository;
import com.example.medapp.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Caregiver links require the patient's consent: a caregiver can only send a
 * request, and nothing is shared until the patient accepts it. Either side can
 * end the link at any time.
 */
@Service
public class CaregiverService {

    /** One side of a link, as shown to the other side. Deliberately excludes email. */
    public record LinkView(Long userId, String username, CaregiverStatus status) {
    }

    private final CaregiverRepository caregiverRepository;
    private final CaregiverAccessLogRepository caregiverAccessLogRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;
    private final MedicationLogService medicationLogService;
    private final Clock clock;

    public CaregiverService(CaregiverRepository caregiverRepository,
                            CaregiverAccessLogRepository caregiverAccessLogRepository,
                            UserRepository userRepository,
                            CurrentUserService currentUserService,
                            MedicationLogService medicationLogService,
                            Clock clock) {
        this.caregiverRepository = caregiverRepository;
        this.caregiverAccessLogRepository = caregiverAccessLogRepository;
        this.userRepository = userRepository;
        this.currentUserService = currentUserService;
        this.medicationLogService = medicationLogService;
        this.clock = clock;
    }

    // ── Caregiver side ─────────────────────────────────────────────────────────

    @Transactional
    public LinkView requestAccess(String patientUsername) {
        User caregiver = currentUserService.getCurrentUser();
        User patient = userRepository.findByUsername(patientUsername == null ? "" : patientUsername.trim())
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));

        if (caregiver.getId().equals(patient.getId())) {
            throw new IllegalArgumentException("Cannot add yourself as a patient");
        }
        if (caregiverRepository.existsByCaregiverIdAndPatientId(caregiver.getId(), patient.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A request for this patient already exists");
        }

        CaregiverRelation relation = new CaregiverRelation();
        relation.setCaregiver(caregiver);
        relation.setPatient(patient);
        relation.setStatus(CaregiverStatus.PENDING);
        relation.setCreatedAt(LocalDateTime.now(clock));
        caregiverRepository.save(relation);

        return new LinkView(patient.getId(), patient.getUsername(), CaregiverStatus.PENDING);
    }

    @Transactional(readOnly = true)
    public List<LinkView> listPatients() {
        return caregiverRepository.findByCaregiver_IdOrderByPatient_UsernameAsc(currentUserService.getCurrentUserId())
                .stream()
                .map(r -> new LinkView(r.getPatient().getId(), r.getPatient().getUsername(), r.getStatus()))
                .toList();
    }

    @Transactional
    public void removePatient(Long patientId) {
        caregiverRepository.delete(findLink(currentUserService.getCurrentUserId(), patientId));
    }

    @Transactional
    public List<MedicationLog> readPatientLogs(Long patientId) {
        // Throws AccessDeniedException unless the patient has accepted.
        List<MedicationLog> logs = medicationLogService.getLogsForPatient(patientId);

        CaregiverAccessLog accessLog = new CaregiverAccessLog();
        accessLog.setCaregiver(currentUserService.getCurrentUser());
        accessLog.setPatient(userRepository.getReferenceById(patientId));
        accessLog.setAccessedAt(LocalDateTime.now(clock));
        caregiverAccessLogRepository.save(accessLog);

        return logs;
    }

    // ── Patient side ───────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<LinkView> listCaregivers() {
        return caregiverRepository.findByPatient_IdOrderByCaregiver_UsernameAsc(currentUserService.getCurrentUserId())
                .stream()
                .map(r -> new LinkView(r.getCaregiver().getId(), r.getCaregiver().getUsername(), r.getStatus()))
                .toList();
    }

    @Transactional
    public LinkView acceptCaregiver(Long caregiverId) {
        CaregiverRelation relation = findLink(caregiverId, currentUserService.getCurrentUserId());
        if (relation.getStatus() != CaregiverStatus.ACCEPTED) {
            relation.setStatus(CaregiverStatus.ACCEPTED);
            relation.setRespondedAt(LocalDateTime.now(clock));
        }
        User caregiver = relation.getCaregiver();
        return new LinkView(caregiver.getId(), caregiver.getUsername(), relation.getStatus());
    }

    /** Declines a pending request or revokes an accepted one. */
    @Transactional
    public void removeCaregiver(Long caregiverId) {
        caregiverRepository.delete(findLink(caregiverId, currentUserService.getCurrentUserId()));
    }

    private CaregiverRelation findLink(Long caregiverId, Long patientId) {
        return caregiverRepository.findByCaregiver_IdAndPatient_Id(caregiverId, patientId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Caregiver link not found"));
    }
}
