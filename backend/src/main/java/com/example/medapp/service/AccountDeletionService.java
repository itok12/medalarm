package com.example.medapp.service;

import com.example.medapp.entity.Alarm;
import com.example.medapp.entity.CaregiverRelation;
import com.example.medapp.entity.MedicationLog;
import com.example.medapp.entity.Medicine;
import com.example.medapp.entity.User;
import com.example.medapp.repository.AlarmRepository;
import com.example.medapp.repository.CaregiverRepository;
import com.example.medapp.repository.MedicationLogRepository;
import com.example.medapp.repository.MedicineRepository;
import com.example.medapp.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AccountDeletionService {

    private final UserRepository userRepository;
    private final MedicineRepository medicineRepository;
    private final AlarmRepository alarmRepository;
    private final MedicationLogRepository medicationLogRepository;
    private final CaregiverRepository caregiverRepository;
    private final RefreshTokenService refreshTokenService;

    public AccountDeletionService(
            UserRepository userRepository,
            MedicineRepository medicineRepository,
            AlarmRepository alarmRepository,
            MedicationLogRepository medicationLogRepository,
            CaregiverRepository caregiverRepository,
            RefreshTokenService refreshTokenService
    ) {
        this.userRepository = userRepository;
        this.medicineRepository = medicineRepository;
        this.alarmRepository = alarmRepository;
        this.medicationLogRepository = medicationLogRepository;
        this.caregiverRepository = caregiverRepository;
        this.refreshTokenService = refreshTokenService;
    }

    @Transactional
    public void deleteAccount(User user) {
        Long userId = user.getId();

        refreshTokenService.clear(user);

        List<CaregiverRelation> relations = caregiverRepository.findByCaregiver_IdOrPatient_Id(userId, userId);
        if (!relations.isEmpty()) {
            caregiverRepository.deleteAllInBatch(relations);
        }

        List<Medicine> medicines = medicineRepository.findForUser(userId);
        if (!medicines.isEmpty()) {
            List<Long> medicineIds = medicines.stream()
                    .map(Medicine::getId)
                    .toList();

            List<Alarm> alarms = alarmRepository.findByMedicine_IdIn(medicineIds);
            if (!alarms.isEmpty()) {
                List<Long> alarmIds = alarms.stream()
                        .map(Alarm::getId)
                        .toList();

                List<MedicationLog> logs = medicationLogRepository.findByAlarm_IdIn(alarmIds);
                if (!logs.isEmpty()) {
                    medicationLogRepository.deleteAllInBatch(logs);
                }

                alarmRepository.deleteAllInBatch(alarms);
            }

            medicineRepository.deleteAllInBatch(medicines);
        }

        userRepository.delete(user);
        SecurityContextHolder.clearContext();
    }
}
