package com.example.medapp.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;

public class LoginRequest {
    @NotBlank
    @JsonAlias({"usernameOrEmail", "email"})
    private String username;

    @NotBlank
    private String password;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
