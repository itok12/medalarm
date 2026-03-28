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

import java.util.UUID;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class MedicineControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String jwtToken;

    @BeforeEach
    void setUp() throws Exception {
        String suffix = UUID.randomUUID().toString();
        Map<String, String> registration = Map.of(
                "username", "medtestuser-" + suffix,
                "password", "password123",
                "email", "medtest-" + suffix + "@example.com"
        );
        String body = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registration)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        @SuppressWarnings("unchecked")
        Map<String, Object> auth = objectMapper.readValue(body, Map.class);
        jwtToken = auth.get("token").toString();
    }

    @Test
    void createMedicine_withValidJwt_returns200() throws Exception {
        Map<String, Object> medicine = Map.of(
                "name", "Ibuprofen",
                "dosage", "200mg",
                "frequency", "Once daily",
                "startDate", "2026-03-28"
        );

        mockMvc.perform(post("/api/medicines")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + jwtToken)
                        .content(objectMapper.writeValueAsString(medicine)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Ibuprofen"))
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    void createMedicine_withoutJwt_returns401() throws Exception {
        Map<String, Object> medicine = Map.of(
                "name", "Aspirin",
                "dosage", "100mg",
                "frequency", "Once daily",
                "startDate", "2026-03-28"
        );

        mockMvc.perform(post("/api/medicines")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(medicine)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getMedicines_withValidJwt_returns200List() throws Exception {
        mockMvc.perform(get("/api/medicines")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void deleteMedicine_fromAnotherUser_returns400() throws Exception {
        Map<String, Object> medicine = Map.of(
                "name", "Metformin",
                "dosage", "500mg",
                "frequency", "Twice daily",
                "startDate", "2026-03-28"
        );
        String createBody = mockMvc.perform(post("/api/medicines")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + jwtToken)
                        .content(objectMapper.writeValueAsString(medicine)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        @SuppressWarnings("unchecked")
        Map<String, Object> created = objectMapper.readValue(createBody, Map.class);
        Number medicineId = (Number) created.get("id");

        Map<String, String> secondRegistration = Map.of(
                "username", "seconduser-" + UUID.randomUUID(),
                "password", "password123",
                "email", "second-" + UUID.randomUUID() + "@example.com"
        );
        String secondBody = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(secondRegistration)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        @SuppressWarnings("unchecked")
        Map<String, Object> secondAuth = objectMapper.readValue(secondBody, Map.class);
        String secondToken = secondAuth.get("token").toString();

        mockMvc.perform(delete("/api/medicines/" + medicineId.longValue())
                        .header("Authorization", "Bearer " + secondToken))
                .andExpect(status().isBadRequest());
    }
}
