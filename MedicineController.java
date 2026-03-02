package com.example.medapp.controller;

import com.example.medapp.entity.Medicine;
import com.example.medapp.dto.CreateMedicineRequest;
import com.example.medapp.service.MedicineService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medicines")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class MedicineController {

    private final MedicineService medicineService;

    public MedicineController(MedicineService medicineService) {
        this.medicineService = medicineService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Medicine>> getMedicinesForUser(@PathVariable Long userId) {
        List<Medicine> medicines = medicineService.getMedicinesForUser(userId);
        return ResponseEntity.ok(medicines);
    }

    @PostMapping
    public ResponseEntity<Medicine> createMedicine(@RequestBody CreateMedicineRequest req) {
        Medicine saved = medicineService.createMedicine(req);
        return ResponseEntity.ok(saved);
    }
}