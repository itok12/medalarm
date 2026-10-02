package com.example.medapp.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

/**
 * Everything a guest created on the device, sent once when they sign in. Ids
 * are the device's local ids and are only used to connect the three lists.
 */
public record GuestImportRequest(
        @NotNull @Size(max = 200) List<@Valid MedicineItem> medicines,
        @NotNull @Size(max = 2_000) List<@Valid AlarmItem> alarms,
        @NotNull @Size(max = 20_000) List<@Valid LogItem> logs
) {

    public record MedicineItem(
            @NotNull Long id,
            @NotBlank @Size(max = 255) String name,
            @Size(max = 255) String dosage,
            @Size(max = 100) String frequency,
            @Size(max = 2000) String instructions,
            LocalDate startDate,
            LocalDate endDate,
            Integer pillsRemaining,
            Integer pillsPerDose
    ) {
    }

    public record AlarmItem(
            @NotNull Long id,
            @NotNull Long medicineId,
            @NotBlank String alarmTime,
            Boolean active,
            Set<String> repeatDays,
            String source
    ) {
    }

    public record LogItem(
            @NotNull Long alarmId,
            @NotBlank String status,
            Instant takenAt,
            LocalDateTime scheduledFor
    ) {
    }
}
