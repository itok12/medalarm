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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final String REFRESH_COOKIE_NAME = "medalarm_refresh";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;
    private final CurrentUserService currentUserService;
    private final boolean refreshCookieSecure;
    private final String refreshCookieSameSite;
    private final long refreshTokenDays;

    public AuthController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil,
                          RefreshTokenService refreshTokenService,
                          CurrentUserService currentUserService,
                          @Value("${medalarm.auth.refresh-cookie.secure:false}") boolean refreshCookieSecure,
                          @Value("${medalarm.auth.refresh-cookie.same-site:Strict}") String refreshCookieSameSite,
                          @Value("${jwt.refresh-token-days:7}") long refreshTokenDays) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.refreshTokenService = refreshTokenService;
        this.currentUserService = currentUserService;
        this.refreshCookieSecure = refreshCookieSecure;
        this.refreshCookieSameSite = refreshCookieSameSite;
        this.refreshTokenDays = refreshTokenDays;
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
        return authResponse(saved, token, refreshToken);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        String identifier = req.getUsername() == null ? "" : req.getUsername().trim();
        User user = userRepository.findByUsername(identifier)
                .or(() -> userRepository.findByEmail(identifier))
                .orElse(null);

        if (user == null || user.getPassword() == null
                || !passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).body("Invalid username or password");
        }

        String refreshToken = refreshTokenService.rotateRefreshToken(user);
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getUsername());
        return authResponse(user, token, refreshToken);
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(
            @RequestBody(required = false) Map<String, String> body,
            @CookieValue(name = REFRESH_COOKIE_NAME, required = false) String refreshCookie
    ) {
        String refreshToken = body != null ? body.get("refreshToken") : null;
        if (refreshToken == null || refreshToken.isBlank()) {
            refreshToken = refreshCookie;
        }
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
        return authResponse(user, newToken, newRefreshToken);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            @CookieValue(name = REFRESH_COOKIE_NAME, required = false) String refreshCookie
    ) {
        User user = resolveLogoutUser(refreshCookie);
        if (user != null) {
            refreshTokenService.clear(user);
            userRepository.save(user);
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, expireRefreshCookie().toString())
                .body(Map.of("message", "Logged out"));
    }

    private ResponseEntity<AuthResponse> authResponse(User user, String accessToken, String refreshToken) {
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, buildRefreshCookie(refreshToken).toString())
                .body(buildAuthResponse(user, accessToken));
    }

    private AuthResponse buildAuthResponse(User user, String accessToken) {
        return new AuthResponse(
                accessToken,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getTimezone(),
                user.isEmailRemindersEnabled(),
                user.getDefaultAlarmTime() != null ? user.getDefaultAlarmTime().toString() : null
        );
    }

    private User resolveLogoutUser(String refreshCookie) {
        try {
            return currentUserService.getCurrentUser();
        } catch (AccessDeniedException ex) {
            if (refreshCookie == null || refreshCookie.isBlank()) {
                return null;
            }
            return refreshTokenService.findByRawToken(refreshCookie);
        }
    }

    private ResponseCookie buildRefreshCookie(String refreshToken) {
        return ResponseCookie.from(REFRESH_COOKIE_NAME, refreshToken)
                .httpOnly(true)
                .secure(refreshCookieSecure)
                .sameSite(refreshCookieSameSite)
                .path("/api/auth")
                .maxAge(Duration.ofDays(refreshTokenDays))
                .build();
    }

    private ResponseCookie expireRefreshCookie() {
        return ResponseCookie.from(REFRESH_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(refreshCookieSecure)
                .sameSite(refreshCookieSameSite)
                .path("/api/auth")
                .maxAge(Duration.ZERO)
                .build();
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
