package com.example.medapp.controller;

import com.example.medapp.dto.GuestImportRequest;
import com.example.medapp.service.GuestImportService;
import com.example.medapp.service.GuestImportService.ImportResult;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/import")
public class GuestImportController {

    private final GuestImportService guestImportService;

    public GuestImportController(GuestImportService guestImportService) {
        this.guestImportService = guestImportService;
    }

    /** Imports everything a guest created on the device, all or nothing. */
    @PostMapping("/guest")
    public ImportResult importGuestData(@Valid @RequestBody GuestImportRequest request) {
        return guestImportService.importGuestData(request);
    }
}
