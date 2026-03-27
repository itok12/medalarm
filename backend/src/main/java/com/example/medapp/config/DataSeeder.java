package com.example.medapp.config;

import com.example.medapp.entity.User;
import com.example.medapp.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        userRepository.findByUsername("demo").orElseGet(() -> {
            User u = new User();
            u.setUsername("demo");
            u.setEmail("demo@example.com");
            u.setPassword(passwordEncoder.encode("demo123"));
            return userRepository.save(u);
        });
    }
}

