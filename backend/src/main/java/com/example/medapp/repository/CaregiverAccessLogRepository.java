package com.example.medapp.repository;

import com.example.medapp.entity.CaregiverAccessLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CaregiverAccessLogRepository extends JpaRepository<CaregiverAccessLog, Long> {
}
