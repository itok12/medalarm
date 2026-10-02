package com.example.medapp.controller;

import com.example.medapp.support.ApiTestClient;
import com.example.medapp.support.ApiTestClient.TestUser;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class MedicationLogControllerTest {

    // 08:05 in London (BST) on 2026-10-01.
    private static final Instant NOW = Instant.parse("2026-10-01T07:05:00Z");

    @TestConfiguration
    static class FixedClock {
        @Bean
        @Primary
        Clock fixedClock() {
            return Clock.fixed(NOW, ZoneOffset.UTC);
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private ApiTestClient api;
    private TestUser user;
    private long medicineId;
    private long morningAlarmId;

    @BeforeEach
    void setUp() throws Exception {
        api = new ApiTestClient(mockMvc, objectMapper);
        user = api.register("logger");
        medicineId = api.createMedicine(user, 30);
        morningAlarmId = api.createAlarm(user, medicineId, "08:00");
    }

    // Counts only this user's logs; the test profile also seeds demo data.
    private int logCount() throws Exception {
        return api.getList(user, "/api/logs").size();
    }

    private Number pillsRemaining() throws Exception {
        return (Number) api.getList(user, "/api/medicines").get(0).get("pillsRemaining");
    }

    @Test
    void takenTwiceForTheSameDose_isStoredOnceAndUsesOnePill() throws Exception {
        String first = api.log(user, morningAlarmId, "TAKEN", "2026-10-01T08:00:00")
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        String second = api.log(user, morningAlarmId, "TAKEN", "2026-10-01T08:00:00")
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        assertThat(api.readMap(second).get("id")).isEqualTo(api.readMap(first).get("id"));
        assertThat(logCount()).isEqualTo(1);
        assertThat(pillsRemaining().intValue()).isEqualTo(29);
    }

    @Test
    void changingAnAnswer_updatesTheDoseAndReturnsThePill() throws Exception {
        api.log(user, morningAlarmId, "TAKEN", "2026-10-01T08:00:00").andExpect(status().isOk());
        api.log(user, morningAlarmId, "SKIPPED", "2026-10-01T08:00:00")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SKIPPED"));

        assertThat(logCount()).isEqualTo(1);
        assertThat(pillsRemaining().intValue()).isEqualTo(30);
    }

    @Test
    void differentDoses_areSeparateAnswers() throws Exception {
        api.log(user, morningAlarmId, "TAKEN", "2026-09-30T08:00:00").andExpect(status().isOk());
        api.log(user, morningAlarmId, "TAKEN", "2026-10-01T08:00:00").andExpect(status().isOk());

        assertThat(logCount()).isEqualTo(2);
        assertThat(pillsRemaining().intValue()).isEqualTo(28);
    }

    @Test
    void withoutScheduledFor_theNearestDoseInTheUsersTimezoneIsUsed() throws Exception {
        api.log(user, morningAlarmId, "TAKEN", null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.scheduledFor").value("2026-10-01T08:00:00"))
                // takenAt carries an explicit UTC offset so clients don't misread it.
                .andExpect(jsonPath("$.takenAt").value("2026-10-01T07:05:00Z"));
    }

    @Test
    void scheduledForMustMatchTheAlarmAndBeRecent() throws Exception {
        api.log(user, morningAlarmId, "TAKEN", "2026-10-01T09:00:00").andExpect(status().isBadRequest());
        api.log(user, morningAlarmId, "TAKEN", "2026-08-01T08:00:00").andExpect(status().isBadRequest());
        api.log(user, morningAlarmId, "TAKEN", "2026-10-05T08:00:00").andExpect(status().isBadRequest());

        assertThat(logCount()).isZero();
    }

    @Test
    void snoozingTheSameDoseAgain_keepsOneSnoozeRow() throws Exception {
        api.log(user, morningAlarmId, "SNOOZED", "2026-10-01T08:00:00").andExpect(status().isOk());
        api.log(user, morningAlarmId, "SNOOZED", "2026-10-01T08:00:00").andExpect(status().isOk());
        api.log(user, morningAlarmId, "TAKEN", "2026-10-01T08:00:00").andExpect(status().isOk());

        List<Map<String, Object>> logs = api.getList(user, "/api/logs");
        assertThat(logs).extracting(log -> log.get("status")).containsExactlyInAnyOrder("SNOOZED", "TAKEN");
    }

    @Test
    void anotherUserCannotLogAgainstMyAlarm() throws Exception {
        TestUser intruder = api.register("intruder");
        api.log(intruder, morningAlarmId, "TAKEN", "2026-10-01T08:00:00").andExpect(status().isBadRequest());

        assertThat(logCount()).isZero();
        assertThat(pillsRemaining().intValue()).isEqualTo(30);
    }
}
