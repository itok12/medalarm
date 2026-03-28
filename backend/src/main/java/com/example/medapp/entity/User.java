package com.example.medapp.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "app_user") // you already used this table name before
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String email;

    @JsonIgnore
    private String password;

    @JsonIgnore
    private String refreshTokenHash;

    @JsonIgnore
    private LocalDateTime refreshTokenExpiry;

    private String timezone = "UTC";

    private boolean emailRemindersEnabled;

    private LocalTime defaultAlarmTime = LocalTime.of(8, 0);

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Medicine> medicines = new ArrayList<>();

    public User() {
    }

    // ---- getters & setters ----

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public List<Medicine> getMedicines() {
        return medicines;
    }

    public void setMedicines(List<Medicine> medicines) {
        this.medicines = medicines;
    }

    public String getRefreshTokenHash() { return refreshTokenHash; }
    public void setRefreshTokenHash(String refreshTokenHash) { this.refreshTokenHash = refreshTokenHash; }

    public LocalDateTime getRefreshTokenExpiry() { return refreshTokenExpiry; }
    public void setRefreshTokenExpiry(LocalDateTime refreshTokenExpiry) { this.refreshTokenExpiry = refreshTokenExpiry; }

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public boolean isEmailRemindersEnabled() {
        return emailRemindersEnabled;
    }

    public void setEmailRemindersEnabled(boolean emailRemindersEnabled) {
        this.emailRemindersEnabled = emailRemindersEnabled;
    }

    public LocalTime getDefaultAlarmTime() {
        return defaultAlarmTime;
    }

    public void setDefaultAlarmTime(LocalTime defaultAlarmTime) {
        this.defaultAlarmTime = defaultAlarmTime;
    }
}
