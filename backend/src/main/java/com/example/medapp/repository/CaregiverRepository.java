package com.example.medapp.repository;

import com.example.medapp.entity.CaregiverRelation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CaregiverRepository extends JpaRepository<CaregiverRelation, Long> {

    List<CaregiverRelation> findByCaregiver_Id(Long caregiverId);

    boolean existsByCaregiverIdAndPatientId(Long caregiverId, Long patientId);
}
