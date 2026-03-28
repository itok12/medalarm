package com.example.medapp.service;

import com.example.medapp.entity.Alarm;
import com.example.medapp.entity.Medicine;
import com.example.medapp.repository.AlarmRepository;
import com.example.medapp.repository.MedicineRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class MedicineExpiryService {

    private static final Logger log = LoggerFactory.getLogger(MedicineExpiryService.class);

    private final MedicineRepository medicineRepository;
    private final AlarmRepository alarmRepository;

    public MedicineExpiryService(MedicineRepository medicineRepository, AlarmRepository alarmRepository) {
        this.medicineRepository = medicineRepository;
        this.alarmRepository = alarmRepository;
    }

    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void deactivateExpiredMedicineAlarms() {
        List<Medicine> expiredMedicines = medicineRepository.findByEndDateBefore(LocalDate.now());
        LocalDate today = LocalDate.now();

        for (Medicine medicine : expiredMedicines) {
            if (medicine.getEndDate() == null || !medicine.getEndDate().isBefore(today)) {
                continue;
            }

            List<Alarm> alarms = alarmRepository.findByMedicine(medicine);
            for (Alarm alarm : alarms) {
                if (alarm.isActive()) {
                    alarm.setActive(false);
                    alarmRepository.save(alarm);
                }
            }
            log.info("Deactivated alarms for expired medicine: {}", medicine.getName());
        }
    }
}
