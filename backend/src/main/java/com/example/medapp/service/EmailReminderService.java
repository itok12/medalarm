package com.example.medapp.service;

import com.example.medapp.entity.Alarm;
import com.example.medapp.entity.DaysOfWeek;
import com.example.medapp.repository.AlarmRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class EmailReminderService {

    private final AlarmRepository alarmRepository;
    private final JavaMailSender mailSender;

    @Value("${medalarm.email.enabled:false}")
    private boolean emailEnabled;

    private static final DateTimeFormatter HH_MM = DateTimeFormatter.ofPattern("HH:mm");

    public EmailReminderService(AlarmRepository alarmRepository, JavaMailSender mailSender) {
        this.alarmRepository = alarmRepository;
        this.mailSender = mailSender;
    }

    @Scheduled(fixedRate = 60000)
    public void checkAndSendReminders() {
        if (!emailEnabled) return;

        String currentTime = LocalTime.now().format(HH_MM);
        DayOfWeek today = java.time.LocalDate.now().getDayOfWeek();

        List<Alarm> alarms = alarmRepository.findAll();
        for (Alarm alarm : alarms) {
            if (!alarm.isActive()) continue;
            if (alarm.getMedicine() == null) continue;
            if (alarm.getMedicine().getUser() == null) continue;

            String alarmHHMM = alarm.getAlarmTime() != null ? alarm.getAlarmTime().format(HH_MM) : null;
            if (!currentTime.equals(alarmHHMM)) continue;

            if (!matchesDay(alarm.getRepeatDays(), today)) continue;

            String email = alarm.getMedicine().getUser().getEmail();
            String medicineName = alarm.getMedicine().getName();
            String dosage = alarm.getMedicine().getDosage();

            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(email);
                message.setSubject("💊 MedAlarm Reminder");
                message.setText("Time to take: " + medicineName + " - " + dosage);
                mailSender.send(message);
            } catch (Exception e) {
                // Log but do not propagate — email failures should not break the scheduler
                System.err.println("Failed to send email reminder to " + email + ": " + e.getMessage());
            }
        }
    }

    private boolean matchesDay(java.util.Set<DaysOfWeek> repeatDays, DayOfWeek today) {
        if (repeatDays == null || repeatDays.isEmpty()) return false;
        String todayName = today.name(); // e.g. "MONDAY"
        return repeatDays.stream().anyMatch(d -> d.name().equals(todayName));
    }
}
