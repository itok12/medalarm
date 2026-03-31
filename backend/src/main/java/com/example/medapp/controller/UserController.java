package com.example.medapp.controller;

import com.example.medapp.dto.DeleteAccountRequest;
import com.example.medapp.dto.UpdateProfileRequest;
import com.example.medapp.dto.UserProfileResponse;
import com.example.medapp.entity.User;
import com.example.medapp.repository.UserRepository;
import com.example.medapp.service.AccountDeletionService;
import com.example.medapp.service.CurrentUserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.ZoneId;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;
    private final PasswordEncoder passwordEncoder;
    private final AccountDeletionService accountDeletionService;

    public UserController(
            UserRepository userRepository,
            CurrentUserService currentUserService,
            PasswordEncoder passwordEncoder,
            AccountDeletionService accountDeletionService
    ) {
        this.userRepository = userRepository;
        this.currentUserService = currentUserService;
        this.passwordEncoder = passwordEncoder;
        this.accountDeletionService = accountDeletionService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getCurrentUser() {
        return ResponseEntity.ok(new UserProfileResponse(currentUserService.getCurrentUser()));
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(@RequestBody UpdateProfileRequest req) {
        User user = currentUserService.getCurrentUser();

        boolean changingProtectedField =
                (req.getNewPassword() != null && !req.getNewPassword().isBlank())
                        || (req.getEmail() != null && !req.getEmail().isBlank() && !req.getEmail().equals(user.getEmail()));

        if (changingProtectedField) {
            if (req.getCurrentPassword() == null || req.getCurrentPassword().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Current password is required"));
            }
            if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Current password is incorrect"));
            }
        }

        if (req.getNewPassword() != null && !req.getNewPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        }

        if (req.getEmail() != null && !req.getEmail().isBlank()) {
            if (!req.getEmail().equals(user.getEmail()) && userRepository.existsByEmail(req.getEmail())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is already in use"));
            }
            user.setEmail(req.getEmail());
        }

        if (req.getTimezone() != null && !req.getTimezone().isBlank()) {
            try {
                ZoneId.of(req.getTimezone());
            } catch (Exception ex) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid timezone"));
            }
            user.setTimezone(req.getTimezone());
        }

        if (req.getEmailRemindersEnabled() != null) {
            user.setEmailRemindersEnabled(req.getEmailRemindersEnabled());
        }

        if (req.getDefaultAlarmTime() != null) {
            user.setDefaultAlarmTime(req.getDefaultAlarmTime());
        }

        User saved = userRepository.save(user);
        return ResponseEntity.ok(new UserProfileResponse(saved));
    }

    @DeleteMapping("/me")
    public ResponseEntity<?> deleteCurrentUser(@Valid @RequestBody DeleteAccountRequest req) {
        User user = currentUserService.getCurrentUser();

        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Current password is incorrect"));
        }

        accountDeletionService.deleteAccount(user);
        return ResponseEntity.ok(Map.of("message", "Account deleted"));
    }
}

