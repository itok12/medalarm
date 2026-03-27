package com.example.medapp.controller;

import com.example.medapp.dto.CreateMedicineRequest;
import com.example.medapp.dto.UpdateMedicineRequest;
import com.example.medapp.entity.Medicine;
import com.example.medapp.service.MedicineService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medicines")
public class MedicineController {

    private final MedicineService medicineService;

    public MedicineController(MedicineService medicineService) {
        this.medicineService = medicineService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Medicine>> getMedicinesForUser(@PathVariable Long userId) {
        return ResponseEntity.ok(medicineService.getMedicinesForUser(userId));
    }

    @PostMapping
    public ResponseEntity<Medicine> createMedicine(@Valid @RequestBody CreateMedicineRequest req) {
        return ResponseEntity.ok(medicineService.createMedicine(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Medicine> updateMedicine(@PathVariable Long id,
                                                   @Valid @RequestBody UpdateMedicineRequest req) {
        return ResponseEntity.ok(medicineService.updateMedicine(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedicine(@PathVariable Long id) {
        medicineService.deleteMedicine(id);
        return ResponseEntity.noContent().build();
    }
}
