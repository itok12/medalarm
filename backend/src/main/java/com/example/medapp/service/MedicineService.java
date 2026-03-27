package com.example.medapp.service;

import com.example.medapp.dto.UpdateMedicineRequest;
import com.example.medapp.entity.Medicine;
import com.example.medapp.dto.CreateMedicineRequest;
import com.example.medapp.entity.User;
import com.example.medapp.repository.AlarmRepository;
import com.example.medapp.repository.MedicineRepository;
import com.example.medapp.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MedicineService {

    private final MedicineRepository medicineRepository;
    private final UserRepository userRepository;
    private final AlarmRepository alarmRepository;

    public MedicineService(MedicineRepository medicineRepository,
                           UserRepository userRepository,
                           AlarmRepository alarmRepository) {
        this.medicineRepository = medicineRepository;
        this.userRepository = userRepository;
        this.alarmRepository = alarmRepository;
    }

    public List<Medicine> getMedicinesForUser(Long userId) {
        return medicineRepository.findForUser(userId);
    }

    public Medicine createMedicine(CreateMedicineRequest req) {
        if (req.getUserId() == null) {
            throw new IllegalArgumentException("userId is required");
        }

        User user = userRepository.findById(req.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + req.getUserId()));

        Medicine medicine = new Medicine();
        medicine.setName(req.getName());
        medicine.setDosage(req.getDosage());
        medicine.setFrequency(req.getFrequency());
        medicine.setDuration(req.getDuration());
        medicine.setInstructions(req.getInstructions());
        medicine.setImageUrl(req.getImageUrl());
        medicine.setUser(user);
        medicine.setStartDate(java.time.LocalDate.now());

        return medicineRepository.save(medicine);
    }

    @Transactional
    public Medicine updateMedicine(Long id, UpdateMedicineRequest req) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Medicine not found: " + id));

        if (req.getName() != null) medicine.setName(req.getName());
        if (req.getDosage() != null) medicine.setDosage(req.getDosage());
        if (req.getFrequency() != null) medicine.setFrequency(req.getFrequency());
        if (req.getDuration() != null) medicine.setDuration(req.getDuration());
        if (req.getInstructions() != null) medicine.setInstructions(req.getInstructions());
        if (req.getImageUrl() != null) medicine.setImageUrl(req.getImageUrl());
        if (req.getStartDate() != null) medicine.setStartDate(req.getStartDate());

        return medicineRepository.save(medicine);
    }

    @Transactional
    public void deleteMedicine(Long id) {
        if (!medicineRepository.existsById(id)) {
            throw new IllegalArgumentException("Medicine not found: " + id);
        }
        medicineRepository.deleteById(id);
    }
}
