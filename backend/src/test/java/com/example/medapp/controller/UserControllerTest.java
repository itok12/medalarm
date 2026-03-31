package com.example.medapp.controller;

import com.example.medapp.repository.CaregiverRepository;
import com.example.medapp.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CaregiverRepository caregiverRepository;

    @Test
    void deleteCurrentUser_removesUserAndCaregiverRelations() throws Exception {
        String suffix = UUID.randomUUID().toString();

        Map<String, String> victimRegistration = Map.of(
                "username", "deleteuser-" + suffix,
                "password", "password123",
                "email", "delete-" + suffix + "@example.com"
        );
        String victimBody = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(victimRegistration)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        @SuppressWarnings("unchecked")
        Map<String, Object> victimAuth = objectMapper.readValue(victimBody, Map.class);
        String victimToken = victimAuth.get("token").toString();
        Number victimId = (Number) victimAuth.get("userId");

        mockMvc.perform(post("/api/medicines")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + victimToken)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "name", "Vitamin D",
                                "dosage", "1000 IU",
                                "frequency", "Once daily",
                                "startDate", "2026-03-31"
                        ))))
                .andExpect(status().isOk());

        Map<String, String> caregiverRegistration = Map.of(
                "username", "caregiver-" + suffix,
                "password", "password123",
                "email", "caregiver-" + suffix + "@example.com"
        );
        String caregiverBody = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(caregiverRegistration)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        @SuppressWarnings("unchecked")
        Map<String, Object> caregiverAuth = objectMapper.readValue(caregiverBody, Map.class);
        String caregiverToken = caregiverAuth.get("token").toString();

        mockMvc.perform(post("/api/caregivers/patients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + caregiverToken)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "patientUsername", victimRegistration.get("username")
                        ))))
                .andExpect(status().isCreated());

        mockMvc.perform(delete("/api/users/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + victimToken)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "currentPassword", "password123"
                        ))))
                .andExpect(status().isOk());

        assertThat(userRepository.findById(victimId.longValue())).isEmpty();
        assertThat(userRepository.findByUsername(victimRegistration.get("username"))).isEmpty();
        assertThat(caregiverRepository.findByCaregiver_IdOrPatient_Id(victimId.longValue(), victimId.longValue())).isEmpty();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "username", victimRegistration.get("username"),
                                "password", "password123"
                        ))))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/caregivers/patients")
                        .header("Authorization", "Bearer " + caregiverToken))
                .andExpect(status().isOk());
    }
}
