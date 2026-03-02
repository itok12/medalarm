package com.example.medapp.repository;

import com.example.medapp.entity.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MedicineRepository extends JpaRepository<Medicine, Long> {

    // Explicit fetch join to load the user relation and avoid lazy serialization issues
    @Query("select m from Medicine m join fetch m.user u where u.id = :userId")
    List<Medicine> findForUser(@Param("userId") Long userId);
}
