package com.example.medapp.service;

import com.example.medapp.dto.CreateMedicineRequest;
import com.example.medapp.entity.Medicine;
import com.example.medapp.entity.User;
import com.example.medapp.repository.MedicineRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MedicineServiceTest {

    @Mock
    private MedicineRepository medicineRepository;

    @Mock
    private CurrentUserService currentUserService;

    @InjectMocks
    private MedicineService medicineService;

    @Test
    void createMedicine_validData_savesAndReturnsMedicine() {
        User user = new User();
        user.setId(1L);
        user.setUsername("testuser");

        when(currentUserService.getCurrentUser()).thenReturn(user);
        when(medicineRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        CreateMedicineRequest request = new CreateMedicineRequest();
        request.setName("Aspirin");
        request.setDosage("500mg");
        request.setFrequency("Once daily");
        request.setStartDate(LocalDate.of(2026, 3, 28));

        Medicine result = medicineService.createMedicine(request);
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Aspirin");
        assertThat(result.getDosage()).isEqualTo("500mg");
        assertThat(result.getUser()).isEqualTo(user);
    }

    @Test
    void createMedicine_endDateBeforeStartDate_throwsIllegalArgumentException() {
        User user = new User();
        user.setId(1L);
        when(currentUserService.getCurrentUser()).thenReturn(user);

        CreateMedicineRequest request = new CreateMedicineRequest();
        request.setName("Aspirin");
        request.setDosage("500mg");
        request.setFrequency("Once daily");
        request.setStartDate(LocalDate.of(2026, 3, 28));
        request.setEndDate(LocalDate.of(2026, 3, 27));

        assertThatThrownBy(() -> medicineService.createMedicine(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("endDate must be on or after startDate");
    }
}
