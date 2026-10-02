package com.example.medapp.repository;

import com.example.medapp.entity.MedicationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

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

    List<MedicationLog> findByAlarm_IdIn(Collection<Long> alarmIds);

    @Query("""
            select l
            from MedicationLog l
            join fetch l.alarm a
            join fetch a.medicine m
            where l.id = :logId and m.user.id = :userId
            """)
    Optional<MedicationLog> findForUserById(@Param("logId") Long logId, @Param("userId") Long userId);

    Optional<MedicationLog> findFirstByAlarm_IdAndScheduledForAndStatusIn(
            Long alarmId, LocalDateTime scheduledFor, Collection<String> statuses);
}
