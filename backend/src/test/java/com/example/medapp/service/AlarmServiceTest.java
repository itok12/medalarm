package com.example.medapp.service;

import com.example.medapp.dto.CreateAlarmRequest;
import com.example.medapp.entity.Alarm;
import com.example.medapp.entity.DaysOfWeek;
import com.example.medapp.entity.Medicine;
import com.example.medapp.entity.User;
import com.example.medapp.repository.AlarmRepository;
import com.example.medapp.repository.MedicineRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AlarmServiceTest {

    @Mock
    private AlarmRepository alarmRepository;

    @Mock
    private MedicineRepository medicineRepository;

    @Mock
    private CurrentUserService currentUserService;

    @InjectMocks
    private AlarmService alarmService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setDefaultAlarmTime(LocalTime.of(8, 0));
    }

    private Medicine medicineWithFrequency(String frequency) {
        Medicine medicine = new Medicine();
        medicine.setId(1L);
        medicine.setFrequency(frequency);
        medicine.setUser(user);
        return medicine;
    }

    @Test
    void generateAlarmsForMedicine_twiceDaily_generatesAnchoredAlarms() {
        Medicine medicine = medicineWithFrequency("twice daily");
        when(currentUserService.getCurrentUser()).thenReturn(user);
        when(medicineRepository.findForUserById(1L, 1L)).thenReturn(Optional.of(medicine));
        when(alarmRepository.findByMedicine_IdAndMedicine_User_Id(1L, 1L)).thenReturn(List.of());
        when(alarmRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        List<Alarm> alarms = alarmService.generateAlarmsForMedicine(1L);

        assertThat(alarms).hasSize(2);
        assertThat(alarms.get(0).getAlarmTime()).isEqualTo(LocalTime.of(8, 0));
        assertThat(alarms.get(1).getAlarmTime()).isEqualTo(LocalTime.of(20, 0));
        assertThat(alarms.get(0).getRepeatDays()).contains(DaysOfWeek.MONDAY);
    }

    @Test
    void generateAlarmsForMedicine_asNeeded_generates0Alarms() {
        Medicine medicine = medicineWithFrequency("as needed");
        when(currentUserService.getCurrentUser()).thenReturn(user);
        when(medicineRepository.findForUserById(1L, 1L)).thenReturn(Optional.of(medicine));

        List<Alarm> alarms = alarmService.generateAlarmsForMedicine(1L);
        assertThat(alarms).isEmpty();
    }

    @Test
    void createAlarm_validRequest_savesAndReturnsAlarm() {
        Medicine medicine = medicineWithFrequency("once daily");
        when(currentUserService.getCurrentUserId()).thenReturn(1L);
        when(medicineRepository.findForUserById(1L, 1L)).thenReturn(Optional.of(medicine));
        when(alarmRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        CreateAlarmRequest request = new CreateAlarmRequest();
        request.setMedicineId(1L);
        request.setAlarmTime("08:00");
        request.setActive(true);
        request.setRepeatDays(Set.of("MONDAY", "WEDNESDAY"));

        Alarm alarm = alarmService.createAlarm(request);
        assertThat(alarm).isNotNull();
        assertThat(alarm.isActive()).isTrue();
        assertThat(alarm.getRepeatDays()).contains(DaysOfWeek.MONDAY, DaysOfWeek.WEDNESDAY);
    }

    @Test
    void setAlarmActive_togglesCorrectly() {
        Alarm alarm = new Alarm();
        alarm.setId(1L);
        alarm.setActive(false);
        when(currentUserService.getCurrentUserId()).thenReturn(1L);
        when(alarmRepository.findForUserById(1L, 1L)).thenReturn(Optional.of(alarm));
        when(alarmRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        Alarm result = alarmService.setAlarmActive(1L, true);
        assertThat(result.isActive()).isTrue();
    }
}
