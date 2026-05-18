package com.example.medapp.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void register_withValidData_returns200WithTokenAndPreferences() throws Exception {
        Map<String, String> request = Map.of(
                "username", "testuser",
                "password", "password123",
                "email", "testuser@example.com",
                "timezone", "Europe/London"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").doesNotExist())
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.timezone").value("Europe/London"))
                .andExpect(cookie().httpOnly("medalarm_refresh", true));
    }

    @Test
    void register_withDuplicateUsername_returns400() throws Exception {
        Map<String, String> request = Map.of(
                "username", "dupuser",
                "password", "password123",
                "email", "dupuser1@example.com"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        Map<String, String> duplicate = Map.of(
                "username", "dupuser",
                "password", "password123",
                "email", "dupuser2@example.com"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicate)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void login_withValidCredentials_returns200WithToken() throws Exception {
        Map<String, String> registration = Map.of(
                "username", "loginuser",
                "password", "mypassword",
                "email", "loginuser@example.com"
        );
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registration)))
                .andExpect(status().isOk());

        Map<String, String> login = Map.of(
                "username", "loginuser",
                "password", "mypassword"
        );
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").doesNotExist())
                .andExpect(cookie().httpOnly("medalarm_refresh", true));
    }

    @Test
    void login_withWrongPassword_returns401() throws Exception {
        Map<String, String> registration = Map.of(
                "username", "wrongpwuser",
                "password", "correctpass",
                "email", "wrongpwuser@example.com"
        );
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registration)))
                .andExpect(status().isOk());

        Map<String, String> login = Map.of(
                "username", "wrongpwuser",
                "password", "wrongpassword"
        );
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void refresh_withValidRefreshToken_rotatesRefreshToken() throws Exception {
        Map<String, String> registration = Map.of(
                "username", "refreshuser",
                "password", "password123",
                "email", "refreshuser@example.com"
        );
        Cookie refreshCookie = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registration)))
                .andExpect(status().isOk())
                .andExpect(cookie().httpOnly("medalarm_refresh", true))
                .andReturn().getResponse().getCookie("medalarm_refresh");

        mockMvc.perform(post("/api/auth/refresh")
                        .cookie(refreshCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").doesNotExist())
                .andExpect(cookie().httpOnly("medalarm_refresh", true));
    }

    @Test
    void logout_invalidatesRefreshToken() throws Exception {
        Map<String, String> registration = Map.of(
                "username", "logoutuser",
                "password", "password123",
                "email", "logoutuser@example.com"
        );
        var registerResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registration)))
                .andExpect(status().isOk())
                .andReturn();

        @SuppressWarnings("unchecked")
        Map<String, Object> auth = objectMapper.readValue(
                registerResult.getResponse().getContentAsString(),
                Map.class
        );
        String accessToken = auth.get("token").toString();
        Cookie refreshCookie = registerResult.getResponse().getCookie("medalarm_refresh");

        mockMvc.perform(post("/api/auth/logout")
                        .header("Authorization", "Bearer " + accessToken)
                        .cookie(refreshCookie))
                .andExpect(status().isOk())
                .andExpect(cookie().maxAge("medalarm_refresh", 0));

        mockMvc.perform(post("/api/auth/refresh")
                        .cookie(refreshCookie))
                .andExpect(status().isUnauthorized());
    }
}
