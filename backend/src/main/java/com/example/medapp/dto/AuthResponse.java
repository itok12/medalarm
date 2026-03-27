package com.example.medapp.dto;

public class AuthResponse {
    private String token;
    private Long userId;
    private String username;
    private String refreshToken;

    public AuthResponse(String token, Long userId, String username) {
        this.token = token;
        this.userId = userId;
        this.username = username;
    }

    public AuthResponse(String token, Long userId, String username, String refreshToken) {
        this.token = token;
        this.userId = userId;
        this.username = username;
        this.refreshToken = refreshToken;
    }

    public String getToken() { return token; }
    public Long getUserId() { return userId; }
    public String getUsername() { return username; }
    public String getRefreshToken() { return refreshToken; }
}
