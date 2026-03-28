package com.example.medapp.controller;

import com.example.medapp.dto.AuthResponse;
import com.example.medapp.dto.LoginRequest;
import com.example.medapp.dto.RegisterRequest;
import com.example.medapp.entity.User;
import com.example.medapp.repository.UserRepository;
import com.example.medapp.security.JwtUtil;
import com.example.medapp.service.CurrentUserService;
import com.example.medapp.service.RefreshTokenService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalTime;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;
    private final CurrentUserService currentUserService;

    public AuthController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil,
                          RefreshTokenService refreshTokenService,
                          CurrentUserService currentUserService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.refreshTokenService = refreshTokenService;
        this.currentUserService = currentUserService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        if (userRepository.existsByUsername(req.getUsername())) {
            return ResponseEntity.badRequest().body("Username already taken");
        }
        if (userRepository.existsByEmail(req.getEmail())) {
            return ResponseEntity.badRequest().body("Email already registered");
        }

        User user = new User();
        user.setUsername(req.getUsername());
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setTimezone(resolveTimezone(req.getTimezone()));
        user.setDefaultAlarmTime(LocalTime.of(8, 0));

        String refreshToken = refreshTokenService.rotateRefreshToken(user);

        User saved = userRepository.save(user);

        String token = jwtUtil.generateToken(saved.getUsername());
        return ResponseEntity.ok(buildAuthResponse(saved, token, refreshToken));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        User user = userRepository.findByUsername(req.getUsername())
                .orElse(null);

        if (user == null || user.getPassword() == null
                || !passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).body("Invalid username or password");
        }

        String refreshToken = refreshTokenService.rotateRefreshToken(user);
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getUsername());
        return ResponseEntity.ok(buildAuthResponse(user, token, refreshToken));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody Map<String, String> body) {
        String refreshToken = body.get("refreshToken");
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.status(401).body("Missing refreshToken");
        }

        User user = refreshTokenService.findByRawToken(refreshToken);
        if (user == null || user.getRefreshTokenExpiry() == null
                || user.getRefreshTokenExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(401).body("Invalid or expired refresh token");
        }

        String newRefreshToken = refreshTokenService.rotateRefreshToken(user);
        userRepository.save(user);
        String newToken = jwtUtil.generateToken(user.getUsername());
        return ResponseEntity.ok(buildAuthResponse(user, newToken, newRefreshToken));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        User user = currentUserService.getCurrentUser();
        refreshTokenService.clear(user);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Logged out"));
    }

    private AuthResponse buildAuthResponse(User user, String accessToken, String refreshToken) {
        return new AuthResponse(
                accessToken,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                refreshToken,
                user.getTimezone(),
                user.isEmailRemindersEnabled(),
                user.getDefaultAlarmTime() != null ? user.getDefaultAlarmTime().toString() : null
        );
    }

    private String resolveTimezone(String timezone) {
        if (timezone == null || timezone.isBlank()) {
            return "UTC";
        }

        try {
            ZoneId.of(timezone);
            return timezone;
        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid timezone");
        }
    }
}
