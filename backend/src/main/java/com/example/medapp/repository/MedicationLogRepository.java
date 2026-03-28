package com.example.medapp.repository;

import com.example.medapp.entity.MedicationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MedicationLogRepository extends JpaRepository<MedicationLog, Long> {
    @Query("""
            select l
            from MedicationLog l
            join fetch l.alarm a
            join fetch a.medicine m
            where m.user.id = :userId
            order by l.takenAt desc
            """)
    List<MedicationLog> findDetailedForUser(@Param("userId") Long userId);
}
