package com.example.medapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MedAlarmApplication {
    public static void main(String[] args) {
        SpringApplication.run(MedAlarmApplication.class, args);
    }
}
