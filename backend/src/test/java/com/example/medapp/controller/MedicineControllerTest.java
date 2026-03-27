package com.example.medapp.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class MedicineControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String jwtToken;
    private Long userId;

    @BeforeEach
    void setUp() throws Exception {
        Map<String, String> reg = Map.of(
                "username", "medtestuser",
                "password", "password123",
                "email", "medtest@example.com"
        );
        String body = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reg)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        @SuppressWarnings("unchecked")
        Map<String, Object> auth = objectMapper.readValue(body, Map.class);
        jwtToken = (String) auth.get("token");
        userId = Long.valueOf(auth.get("userId").toString());
    }

    @Test
    void createMedicine_withValidJwt_returns200() throws Exception {
        Map<String, Object> medicine = Map.of(
                "name", "Ibuprofen",
                "dosage", "200mg",
                "frequency", "daily",
                "userId", userId
        );

        mockMvc.perform(post("/api/medicines")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + jwtToken)
                        .content(objectMapper.writeValueAsString(medicine)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Ibuprofen"));
    }

    @Test
    void createMedicine_withoutJwt_returns401() throws Exception {
        Map<String, Object> medicine = Map.of(
                "name", "Aspirin",
                "dosage", "100mg",
                "frequency", "daily",
                "userId", userId
        );

        mockMvc.perform(post("/api/medicines")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(medicine)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getMedicines_withValidJwt_returns200List() throws Exception {
        mockMvc.perform(get("/api/medicines/user/" + userId)
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}
