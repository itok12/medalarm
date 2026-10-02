package com.example.medapp.security;

import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Locks an account identifier after repeated failed logins. Keyed by the
 * username/email being tried, not the caller's IP, so rotating IPs doesn't help
 * an attacker guess one account's password.
 */
@Component
public class LoginAttemptService {

    static final int MAX_FAILURES = 5;
    static final Duration WINDOW = Duration.ofMinutes(15);
    private static final int MAX_TRACKED = 10_000;

    private record Attempts(int failures, Instant firstFailure, Instant lockedUntil) {
    }

    private final Map<String, Attempts> attempts = new ConcurrentHashMap<>();
    private final Clock clock;

    public LoginAttemptService(Clock clock) {
        this.clock = clock;
    }

    /** How long the identifier stays locked, or Duration.ZERO if it isn't. */
    public Duration lockRemaining(String identifier) {
        Attempts current = attempts.get(key(identifier));
        Instant now = clock.instant();
        if (current == null || current.lockedUntil() == null || !current.lockedUntil().isAfter(now)) {
            return Duration.ZERO;
        }
        return Duration.between(now, current.lockedUntil());
    }

    public void recordFailure(String identifier) {
        Instant now = clock.instant();
        if (attempts.size() >= MAX_TRACKED) {
            attempts.values().removeIf(entry -> entry.firstFailure().plus(WINDOW).isBefore(now));
        }
        attempts.compute(key(identifier), (k, current) -> {
            if (current == null || current.firstFailure().plus(WINDOW).isBefore(now)) {
                return new Attempts(1, now, null);
            }
            int failures = current.failures() + 1;
            Instant lockedUntil = failures >= MAX_FAILURES ? now.plus(WINDOW) : current.lockedUntil();
            return new Attempts(failures, current.firstFailure(), lockedUntil);
        });
    }

    public void recordSuccess(String identifier) {
        attempts.remove(key(identifier));
    }

    private String key(String identifier) {
        return identifier == null ? "" : identifier.trim().toLowerCase(Locale.ROOT);
    }
}
