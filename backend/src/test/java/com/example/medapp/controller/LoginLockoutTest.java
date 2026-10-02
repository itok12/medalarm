package com.example.medapp.controller;

import com.example.medapp.support.ApiTestClient;
import com.example.medapp.support.ApiTestClient.TestUser;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class LoginLockoutTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private ApiTestClient api;
    private TestUser user;

    @BeforeEach
    void setUp() throws Exception {
        api = new ApiTestClient(mockMvc, objectMapper);
        user = api.register("lockout");
    }

    private ResultActions login(String username, String password, String clientIp) throws Exception {
        return mockMvc.perform(post("/api/auth/login")
                .with(request -> {
                    request.setRemoteAddr(clientIp);
                    return request;
                })
                .contentType(MediaType.APPLICATION_JSON)
                .content(api.json(Map.of("username", username, "password", password))));
    }

    @Test
    void fiveWrongPasswords_lockTheAccountEvenFromNewAddresses() throws Exception {
        for (int i = 0; i < 5; i++) {
            login(user.username(), "wrong-password", "203.0.113." + i).andExpect(status().isUnauthorized());
        }

        // Correct password from a fresh address is still refused while locked.
        login(user.username(), "password123", "198.51.100.99").andExpect(status().isTooManyRequests());
    }

    @Test
    void aLockOnOneAccountDoesNotAffectOthers() throws Exception {
        TestUser other = api.register("other");
        for (int i = 0; i < 5; i++) {
            login(user.username(), "wrong-password", "203.0.113.1").andExpect(status().isUnauthorized());
        }

        login(other.username(), "password123", "203.0.113.1").andExpect(status().isOk());
    }

    @Test
    void aSuccessfulLoginResetsTheCount() throws Exception {
        for (int i = 0; i < 4; i++) {
            login(user.username(), "wrong-password", "203.0.113.1").andExpect(status().isUnauthorized());
        }
        login(user.username(), "password123", "203.0.113.1").andExpect(status().isOk());

        login(user.username(), "wrong-password", "203.0.113.1").andExpect(status().isUnauthorized());
        login(user.username(), "password123", "203.0.113.1").andExpect(status().isOk());
    }
}
