package com.example.medapp.config;

import com.example.medapp.entity.User;
import com.example.medapp.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalTime;
import java.time.ZoneId;

@Component
public class ReviewAccountSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(ReviewAccountSeeder.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String username;
    private final String email;
    private final String password;
    private final String timezone;

    public ReviewAccountSeeder(UserRepository userRepository,
                               PasswordEncoder passwordEncoder,
                               @Value("${medalarm.review-account.username:}") String username,
                               @Value("${medalarm.review-account.email:}") String email,
                               @Value("${medalarm.review-account.password:}") String password,
                               @Value("${medalarm.review-account.timezone:UTC}") String timezone) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.username = username;
        this.email = email;
        this.password = password;
        this.timezone = timezone;
    }

    @Override
    public void run(String... args) {
        if (username.isBlank() && email.isBlank() && password.isBlank()) {
            return;
        }

        if (username.isBlank() || email.isBlank() || password.isBlank()) {
            log.warn("Skipping review account seed because username, email, or password is missing");
            return;
        }

        String resolvedTimezone = resolveTimezone(timezone);

        User user = userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(email))
                .orElseGet(User::new);

        user.setUsername(username.trim());
        user.setEmail(email.trim());
        user.setPassword(passwordEncoder.encode(password));
        user.setTimezone(resolvedTimezone);
        if (user.getDefaultAlarmTime() == null) {
            user.setDefaultAlarmTime(LocalTime.of(8, 0));
        }

        userRepository.save(user);
        log.info("Ensured review account [{}] is available for app review", username.trim());
    }

    private String resolveTimezone(String value) {
        if (value == null || value.isBlank()) {
            return "UTC";
        }

        try {
            ZoneId.of(value);
            return value;
        } catch (Exception ex) {
            log.warn("Invalid review account timezone [{}], defaulting to UTC", value);
            return "UTC";
        }
    }
}
