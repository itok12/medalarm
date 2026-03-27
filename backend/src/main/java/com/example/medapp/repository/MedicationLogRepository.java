package com.example.medapp.repository;

import com.example.medapp.entity.MedicationLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MedicationLogRepository extends JpaRepository<MedicationLog, Long> {
    List<MedicationLog> findByAlarm_Medicine_User_IdOrderByTakenAtDesc(Long userId);
}
