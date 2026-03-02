
package com.example.medapp.repository;

import com.example.medapp.entity.Alarm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AlarmRepository extends JpaRepository<Alarm, Long> {

    // Fetch alarms with medicine and repeatDays to avoid lazy-loading issues during JSON serialization
    @Query("""
            select distinct a
            from Alarm a
            join fetch a.medicine m
            left join fetch a.repeatDays
            where m.user.id = :userId
            """)
    List<Alarm> findForUser(@Param("userId") Long userId);
}
