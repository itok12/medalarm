package com.example.medapp.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Native apps can't keep the refresh cookie (the WebView blocks it as a
 * cross-site cookie), so they get the refresh token in the body instead.
 */
@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class NativeSessionTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private Map<String, String> registration() {
        String username = "native-" + UUID.randomUUID().toString().substring(0, 8);
        return Map.of("username", username, "password", "password123", "email", username + "@example.com",
                "healthDataConsent", "true");
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> register(boolean nativeClient) throws Exception {
        var request = post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registration()));
        if (nativeClient) {
            request.header(AuthController.CLIENT_HEADER, "native");
        }
        String body = mockMvc.perform(request).andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        return objectMapper.readValue(body, Map.class);
    }

    private org.springframework.test.web.servlet.ResultActions refresh(Object refreshToken) throws Exception {
        return mockMvc.perform(post("/api/auth/refresh")
                .header(AuthController.CLIENT_HEADER, "native")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("refreshToken", refreshToken))));
    }

    @Test
    void webClientsNeverSeeTheRefreshTokenInTheBody() throws Exception {
        assertThat(register(false)).doesNotContainKey("refreshToken");
    }

    @Test
    void nativeClientsCanRefreshWithTheTokenFromTheBody() throws Exception {
        Object firstToken = register(true).get("refreshToken");
        assertThat(firstToken).isNotNull();

        String body = refresh(firstToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andReturn().getResponse().getContentAsString();
        Object rotated = objectMapper.readValue(body, Map.class).get("refreshToken");

        assertThat(rotated).isNotNull().isNotEqualTo(firstToken);
        // Rotation: the old token can't be replayed.
        refresh(firstToken).andExpect(status().isUnauthorized());
    }

    @Test
    void logoutWithTheBodyTokenEndsTheSession() throws Exception {
        Object refreshToken = register(true).get("refreshToken");

        mockMvc.perform(post("/api/auth/logout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("refreshToken", refreshToken))))
                .andExpect(status().isOk());

        refresh(refreshToken).andExpect(status().isUnauthorized());
    }
}
