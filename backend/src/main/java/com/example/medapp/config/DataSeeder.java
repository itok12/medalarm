package com.example.medapp.config;

import com.example.medapp.entity.User;
import com.example.medapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalTime;

@Component
public class DataSeeder implements CommandLineRunner {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final boolean demoSeedEnabled;

    public DataSeeder(UserRepository userRepository,
                      PasswordEncoder passwordEncoder,
                      @Value("${medalarm.demo-seed.enabled:true}") boolean demoSeedEnabled) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.demoSeedEnabled = demoSeedEnabled;
    }

    @Override
    public void run(String... args) {
        if (!demoSeedEnabled) {
            return;
        }

        userRepository.findByUsername("demo").orElseGet(() -> {
            User u = new User();
            u.setUsername("demo");
            u.setEmail("demo@example.com");
            u.setPassword(passwordEncoder.encode("demo123"));
            u.setTimezone("UTC");
            u.setDefaultAlarmTime(LocalTime.of(8, 0));
            return userRepository.save(u);
        });
    }
}

