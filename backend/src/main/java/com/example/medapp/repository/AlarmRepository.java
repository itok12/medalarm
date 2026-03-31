
package com.example.medapp.repository;

import com.example.medapp.entity.Alarm;
import com.example.medapp.entity.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface AlarmRepository extends JpaRepository<Alarm, Long> {

    @Query("""
            select distinct a
            from Alarm a
            join fetch a.medicine m
            left join fetch a.repeatDays
            where m.user.id = :userId
            order by a.alarmTime asc
            """)
    List<Alarm> findForUser(@Param("userId") Long userId);

    @Query("""
            select distinct a
            from Alarm a
            join fetch a.medicine m
            join fetch m.user u
            left join fetch a.repeatDays
            where a.active = true
            """)
    List<Alarm> findActiveWithMedicineAndUser();

    @Query("""
            select distinct a
            from Alarm a
            join fetch a.medicine m
            left join fetch a.repeatDays
            where a.id = :alarmId and m.user.id = :userId
            """)
    Optional<Alarm> findForUserById(@Param("alarmId") Long alarmId, @Param("userId") Long userId);

    List<Alarm> findByMedicine(Medicine medicine);

    List<Alarm> findByMedicine_IdAndMedicine_User_Id(Long medicineId, Long userId);

    List<Alarm> findByMedicine_IdIn(Collection<Long> medicineIds);
}
