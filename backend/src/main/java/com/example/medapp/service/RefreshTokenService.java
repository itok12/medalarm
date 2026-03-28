package com.example.medapp.service;

import com.example.medapp.entity.User;
import com.example.medapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class RefreshTokenService {

    private final UserRepository userRepository;
    private final long refreshTokenDays;

    public RefreshTokenService(
            UserRepository userRepository,
            @Value("${jwt.refresh-token-days:7}") long refreshTokenDays
    ) {
        this.userRepository = userRepository;
        this.refreshTokenDays = refreshTokenDays;
    }

    public String rotateRefreshToken(User user) {
        String refreshToken = UUID.randomUUID() + "." + UUID.randomUUID();
        user.setRefreshTokenHash(hashToken(refreshToken));
        user.setRefreshTokenExpiry(LocalDateTime.now().plusDays(refreshTokenDays));
        return refreshToken;
    }

    public User findByRawToken(String rawToken) {
        return userRepository.findByRefreshTokenHash(hashToken(rawToken)).orElse(null);
    }

    public void clear(User user) {
        user.setRefreshTokenHash(null);
        user.setRefreshTokenExpiry(null);
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("Unable to hash refresh token", ex);
        }
    }
}
