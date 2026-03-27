package com.example.medapp.service;

import com.example.medapp.dto.CreateMedicineRequest;
import com.example.medapp.entity.Medicine;
import com.example.medapp.entity.User;
import com.example.medapp.repository.AlarmRepository;
import com.example.medapp.repository.MedicineRepository;
import com.example.medapp.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MedicineServiceTest {

    @Mock
    private MedicineRepository medicineRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AlarmRepository alarmRepository;

    @InjectMocks
    private MedicineService medicineService;

    @Test
    void createMedicine_validData_savesAndReturnsMedicine() {
        User user = new User();
        user.setId(1L);
        user.setUsername("testuser");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(medicineRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        CreateMedicineRequest req = new CreateMedicineRequest();
        req.setUserId(1L);
        req.setName("Aspirin");
        req.setDosage("500mg");
        req.setFrequency("once daily");

        Medicine result = medicineService.createMedicine(req);
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Aspirin");
        assertThat(result.getDosage()).isEqualTo("500mg");
        assertThat(result.getUser()).isEqualTo(user);
    }

    @Test
    void createMedicine_nullUserId_throwsIllegalArgumentException() {
        CreateMedicineRequest req = new CreateMedicineRequest();
        req.setUserId(null);
        req.setName("Aspirin");

        assertThatThrownBy(() -> medicineService.createMedicine(req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("userId is required");
    }
}
