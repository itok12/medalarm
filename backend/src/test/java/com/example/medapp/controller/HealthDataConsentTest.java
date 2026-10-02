package com.example.medapp.controller;

import com.example.medapp.entity.HealthDataConsent;
import com.example.medapp.entity.User;
import com.example.medapp.repository.UserRepository;
import com.example.medapp.support.ApiTestClient;
import com.example.medapp.support.ApiTestClient.TestUser;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import java.lang.reflect.Field;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** UK GDPR: storing health data on the server needs the user's explicit consent. */
@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class HealthDataConsentTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Test
    void anAccountCannotBeCreatedWithoutConsent() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "username", "noconsent",
                                "password", "password123",
                                "email", "noconsent@example.com"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.healthDataConsent").exists());

        assertThat(userRepository.findByUsername("noconsent")).isEmpty();
    }

    @Test
    void registeringRecordsWhenAndWhichWordingWasAgreedTo() throws Exception {
        TestUser user = new ApiTestClient(mockMvc, objectMapper).register("consenting");

        mockMvc.perform(get("/api/users/me").header("Authorization", user.bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.healthDataConsentAt").isNotEmpty());
        assertThat(userRepository.findByUsername(user.username()).orElseThrow().getHealthDataConsentVersion())
                .isEqualTo(HealthDataConsent.CURRENT_VERSION);
    }

    @Test
    void anOlderAccountCanGiveConsentLater() throws Exception {
        TestUser user = new ApiTestClient(mockMvc, objectMapper).register("legacy");
        User stored = userRepository.findByUsername(user.username()).orElseThrow();
        clearConsent(stored);
        userRepository.save(stored);

        mockMvc.perform(get("/api/users/me").header("Authorization", user.bearer()))
                .andExpect(jsonPath("$.healthDataConsentAt").doesNotExist());

        mockMvc.perform(post("/api/users/me/health-data-consent").header("Authorization", user.bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.healthDataConsentAt").isNotEmpty());
    }

    // Accounts created before V6 have no consent; there is no API to remove it, so set that state directly.
    private static void clearConsent(User user) throws Exception {
        for (String name : new String[] {"healthDataConsentAt", "healthDataConsentVersion"}) {
            Field field = User.class.getDeclaredField(name);
            field.setAccessible(true);
            field.set(user, null);
        }
    }
}
