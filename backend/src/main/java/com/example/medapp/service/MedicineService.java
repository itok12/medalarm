package com.example.medapp.service;

import com.example.medapp.entity.Medicine;
import com.example.medapp.dto.CreateMedicineRequest;
import com.example.medapp.entity.User;
import com.example.medapp.repository.MedicineRepository;
import com.example.medapp.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MedicineService {

    private final MedicineRepository medicineRepository;
    private final UserRepository userRepository;

    public MedicineService(MedicineRepository medicineRepository,
                           UserRepository userRepository) {
        this.medicineRepository = medicineRepository;
        this.userRepository = userRepository;
    }

    public List<Medicine> getMedicinesForUser(Long userId) {
        // Use explicit fetch-join query to avoid lazy-loading errors when serializing
        return medicineRepository.findForUser(userId);
    }

    public Medicine createMedicine(CreateMedicineRequest req) {
        // Validate userId is provided
        if (req.getUserId() == null) {
            throw new IllegalArgumentException("userId is required");
        }

        // Look up the user
        User user = userRepository.findById(req.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + req.getUserId()));

        // Create and populate the medicine entity from the DTO
        Medicine medicine = new Medicine();
        medicine.setName(req.getName());
        medicine.setDosage(req.getDosage());
        medicine.setFrequency(req.getFrequency());
        medicine.setDuration(req.getDuration());
        medicine.setInstructions(req.getInstructions());
        medicine.setImageUrl(req.getImageUrl());
        medicine.setUser(user);

        return medicineRepository.save(medicine);
    }
}
