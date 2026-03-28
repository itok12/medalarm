package com.example.medapp.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class AppStartupValidator {

    @Value("${spring.profiles.active:}")
    private String activeProfile;

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${medalarm.email.enabled:false}")
    private boolean emailEnabled;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @PostConstruct
    public void validate() {
        if ("prod".equalsIgnoreCase(activeProfile)
                && "medalarm-super-secret-key-change-in-production-at-least-32-chars".equals(jwtSecret)) {
            throw new IllegalStateException("JWT_SECRET must be overridden in production");
        }

        if (emailEnabled && (mailUsername == null || mailUsername.isBlank() || mailPassword == null || mailPassword.isBlank())) {
            throw new IllegalStateException("MAIL_USERNAME and MAIL_PASSWORD are required when MAIL_ENABLED=true");
        }
    }
}
