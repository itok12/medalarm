package com.example.medapp.repository;

import com.example.medapp.entity.CaregiverRelation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CaregiverRepository extends JpaRepository<CaregiverRelation, Long> {

    List<CaregiverRelation> findByCaregiver_IdOrderByPatient_UsernameAsc(Long caregiverId);

    boolean existsByCaregiverIdAndPatientId(Long caregiverId, Long patientId);

    Optional<CaregiverRelation> findByCaregiver_IdAndPatient_Id(Long caregiverId, Long patientId);
}
