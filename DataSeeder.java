package com.example.medapp.config;

import com.example.medapp.entity.User;          // ✅ use your actual entity name
import com.example.medapp.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {
    private final UserRepository userRepository;

    public DataSeeder(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {
        userRepository.findById(1L).orElseGet(() -> {
            User u = new User();
            
            u.setUsername("demo");
            u.setEmail("demo@example.com");

            return userRepository.save(u);
        });
    }
}

