package com.example.medapp.service;

import com.example.medapp.dto.CreateMedicineRequest;
import com.example.medapp.dto.UpdateMedicineRequest;
import com.example.medapp.entity.Medicine;
import com.example.medapp.entity.User;
import com.example.medapp.repository.MedicineRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class MedicineService {

    private final MedicineRepository medicineRepository;
    private final CurrentUserService currentUserService;

    public MedicineService(MedicineRepository medicineRepository, CurrentUserService currentUserService) {
        this.medicineRepository = medicineRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public List<Medicine> getMedicinesForCurrentUser() {
        return medicineRepository.findForUser(currentUserService.getCurrentUserId());
    }

    @Transactional
    public Medicine createMedicine(CreateMedicineRequest req) {
        User user = currentUserService.getCurrentUser();
        validateDateRange(req.getStartDate(), req.getEndDate());

        Medicine medicine = new Medicine();
        medicine.setName(req.getName());
        medicine.setDosage(req.getDosage());
        medicine.setFrequency(req.getFrequency());
        medicine.setInstructions(req.getInstructions());
        medicine.setImageUrl(req.getImageUrl());
        medicine.setUser(user);
        medicine.setStartDate(req.getStartDate());
        medicine.setEndDate(req.getEndDate());

        return medicineRepository.save(medicine);
    }

    @Transactional
    public Medicine updateMedicine(Long id, UpdateMedicineRequest req) {
        Medicine medicine = medicineRepository.findForUserById(id, currentUserService.getCurrentUserId())
                .orElseThrow(() -> new IllegalArgumentException("Medicine not found: " + id));

        validateDateRange(req.getStartDate(), req.getEndDate());

        medicine.setName(req.getName());
        medicine.setDosage(req.getDosage());
        medicine.setFrequency(req.getFrequency());
        medicine.setInstructions(req.getInstructions());
        medicine.setImageUrl(req.getImageUrl());
        medicine.setStartDate(req.getStartDate());
        medicine.setEndDate(req.getEndDate());

        return medicineRepository.save(medicine);
    }

    @Transactional
    public void deleteMedicine(Long id) {
        Medicine medicine = medicineRepository.findForUserById(id, currentUserService.getCurrentUserId())
                .orElseThrow(() -> new IllegalArgumentException("Medicine not found: " + id));
        medicineRepository.delete(medicine);
    }

    private void validateDateRange(LocalDate startDate, LocalDate endDate) {
        if (startDate == null) {
            throw new IllegalArgumentException("startDate is required");
        }
        if (endDate != null && endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("endDate must be on or after startDate");
        }
    }
}
