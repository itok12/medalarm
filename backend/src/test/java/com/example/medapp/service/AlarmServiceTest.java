package com.example.medapp.service;

import com.example.medapp.dto.CreateAlarmRequest;
import com.example.medapp.entity.Alarm;
import com.example.medapp.entity.Medicine;
import com.example.medapp.repository.AlarmRepository;
import com.example.medapp.repository.MedicineRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AlarmServiceTest {

    @Mock
    private AlarmRepository alarmRepository;

    @Mock
    private MedicineRepository medicineRepository;

    @InjectMocks
    private AlarmService alarmService;

    private Medicine medicineWithFrequency(String frequency) {
        Medicine medicine = new Medicine();
        medicine.setId(1L);
        medicine.setFrequency(frequency);
        return medicine;
    }

    @Test
    void generateAlarmsForMedicine_onceDaily_generates1Alarm() {
        Medicine medicine = medicineWithFrequency("once daily");
        when(medicineRepository.findById(1L)).thenReturn(Optional.of(medicine));
        when(alarmRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        List<Alarm> alarms = alarmService.generateAlarmsForMedicine(1L);
        assertThat(alarms).hasSize(1);
    }

    @Test
    void generateAlarmsForMedicine_twiceDaily_generates2Alarms() {
        Medicine medicine = medicineWithFrequency("twice daily");
        when(medicineRepository.findById(1L)).thenReturn(Optional.of(medicine));
        when(alarmRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        List<Alarm> alarms = alarmService.generateAlarmsForMedicine(1L);
        assertThat(alarms).hasSize(2);
    }

    @Test
    void generateAlarmsForMedicine_threeTimesDaily_generates3Alarms() {
        Medicine medicine = medicineWithFrequency("three times daily");
        when(medicineRepository.findById(1L)).thenReturn(Optional.of(medicine));
        when(alarmRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        List<Alarm> alarms = alarmService.generateAlarmsForMedicine(1L);
        assertThat(alarms).hasSize(3);
    }

    @Test
    void generateAlarmsForMedicine_fourTimesDaily_generates4Alarms() {
        Medicine medicine = medicineWithFrequency("four times daily");
        when(medicineRepository.findById(1L)).thenReturn(Optional.of(medicine));
        when(alarmRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        List<Alarm> alarms = alarmService.generateAlarmsForMedicine(1L);
        assertThat(alarms).hasSize(4);
    }

    @Test
    void generateAlarmsForMedicine_asNeeded_generates0Alarms() {
        Medicine medicine = medicineWithFrequency("as needed");
        when(medicineRepository.findById(1L)).thenReturn(Optional.of(medicine));

        List<Alarm> alarms = alarmService.generateAlarmsForMedicine(1L);
        assertThat(alarms).isEmpty();
    }

    @Test
    void createAlarm_validRequest_savesAndReturnsAlarm() {
        Medicine medicine = medicineWithFrequency("once daily");
        when(medicineRepository.findById(1L)).thenReturn(Optional.of(medicine));
        when(alarmRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        CreateAlarmRequest req = new CreateAlarmRequest();
        req.setMedicineId(1L);
        req.setAlarmTime("08:00");
        req.setActive(true);

        Alarm alarm = alarmService.createAlarm(req);
        assertThat(alarm).isNotNull();
        assertThat(alarm.isActive()).isTrue();
    }

    @Test
    void setAlarmActive_togglesCorrectly() {
        Alarm alarm = new Alarm();
        alarm.setId(1L);
        alarm.setActive(false);
        when(alarmRepository.findById(1L)).thenReturn(Optional.of(alarm));
        when(alarmRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Alarm result = alarmService.setAlarmActive(1L, true);
        assertThat(result.isActive()).isTrue();
    }
}
