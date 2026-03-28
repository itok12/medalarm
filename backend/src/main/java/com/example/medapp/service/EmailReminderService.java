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
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class EmailReminderService {

    private static final DateTimeFormatter HH_MM = DateTimeFormatter.ofPattern("HH:mm");

    private final AlarmRepository alarmRepository;
    private final JavaMailSender mailSender;
    private final Map<String, Long> sentReminderKeys = new ConcurrentHashMap<>();

    @Value("${medalarm.email.enabled:false}")
    private boolean emailEnabled;

    public EmailReminderService(AlarmRepository alarmRepository, JavaMailSender mailSender) {
        this.alarmRepository = alarmRepository;
        this.mailSender = mailSender;
    }

    @Scheduled(fixedRate = 60000)
    public void checkAndSendReminders() {
        if (!emailEnabled) {
            return;
        }

        long nowMillis = System.currentTimeMillis();
        sentReminderKeys.entrySet().removeIf(entry -> entry.getValue() < nowMillis - 7200000);

        List<Alarm> alarms = alarmRepository.findActiveWithMedicineAndUser();
        for (Alarm alarm : alarms) {
            if (!alarm.isActive() || alarm.getMedicine() == null || alarm.getMedicine().getUser() == null) {
                continue;
            }
            if (!alarm.getMedicine().getUser().isEmailRemindersEnabled()) {
                continue;
            }

            ZoneId zoneId;
            try {
                zoneId = ZoneId.of(alarm.getMedicine().getUser().getTimezone());
            } catch (Exception ex) {
                zoneId = ZoneId.of("UTC");
            }

            ZonedDateTime zonedNow = ZonedDateTime.now(zoneId);
            String currentTime = zonedNow.toLocalTime().format(HH_MM);
            DayOfWeek today = zonedNow.toLocalDate().getDayOfWeek();
            String alarmTime = alarm.getAlarmTime() != null ? alarm.getAlarmTime().format(HH_MM) : null;
            if (!currentTime.equals(alarmTime) || !matchesDay(alarm.getRepeatDays(), today)) {
                continue;
            }

            String reminderKey = alarm.getId() + ":" + zonedNow.toLocalDate() + ":" + currentTime;
            if (sentReminderKeys.putIfAbsent(reminderKey, nowMillis) != null) {
                continue;
            }

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
                System.err.println("Failed to send email reminder to " + email + ": " + e.getMessage());
            }
        }
    }

    private boolean matchesDay(java.util.Set<DaysOfWeek> repeatDays, DayOfWeek today) {
        if (repeatDays == null || repeatDays.isEmpty()) {
            return false;
        }
        String todayName = today.name();
        return repeatDays.stream().anyMatch(day -> day.name().equals(todayName));
    }
}
