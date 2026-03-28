package com.example.medapp.repository;

import com.example.medapp.entity.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface MedicineRepository extends JpaRepository<Medicine, Long> {

    @Query("select m from Medicine m join fetch m.user u where u.id = :userId")
    List<Medicine> findForUser(@Param("userId") Long userId);

    @Query("select m from Medicine m join fetch m.user u where m.id = :id and u.id = :userId")
    Optional<Medicine> findForUserById(@Param("id") Long id, @Param("userId") Long userId);

    List<Medicine> findByEndDateBefore(LocalDate date);
}
