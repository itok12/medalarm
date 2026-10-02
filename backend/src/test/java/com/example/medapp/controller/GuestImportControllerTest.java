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

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class GuestImportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private ApiTestClient api;
    private TestUser user;

    @BeforeEach
    void setUp() throws Exception {
        api = new ApiTestClient(mockMvc, objectMapper);
        user = api.register("importer");
    }

    private ResultActions importGuest(String bearer, Object payload) throws Exception {
        var request = post("/api/import/guest")
                .contentType(MediaType.APPLICATION_JSON)
                .content(api.json(payload));
        if (bearer != null) {
            request.header("Authorization", bearer);
        }
        return mockMvc.perform(request);
    }

    private static Map<String, Object> guestStore(Object alarmMedicineId) {
        return Map.of(
                "medicines", List.of(Map.of(
                        "id", 1, "name", "Metformin", "dosage", "500mg", "frequency", "Twice daily",
                        "startDate", "2026-09-20", "pillsRemaining", 27, "pillsPerDose", 1)),
                "alarms", List.of(
                        Map.of("id", 1, "medicineId", alarmMedicineId, "alarmTime", "08:00", "active", true,
                                "repeatDays", ApiTestClient.EVERY_DAY),
                        Map.of("id", 2, "medicineId", 1, "alarmTime", "20:00", "active", true,
                                "repeatDays", List.of("MONDAY", "FRIDAY"))),
                "logs", List.of(
                        Map.of("alarmId", 1, "status", "TAKEN", "takenAt", "2026-09-30T07:02:00Z",
                                "scheduledFor", "2026-09-30T08:00:00"),
                        Map.of("alarmId", 2, "status", "SKIPPED", "takenAt", "2026-09-30T19:10:00Z"),
                        Map.of("alarmId", 99, "status", "TAKEN", "takenAt", "2026-09-30T19:10:00Z")));
    }

    @Test
    void importsTheGuestScheduleAndHistoryIntoTheAccount() throws Exception {
        importGuest(user.bearer(), guestStore(1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.medicines").value(1))
                .andExpect(jsonPath("$.alarms").value(2))
                // The log for alarm 99 (deleted on the device) has nothing to attach to.
                .andExpect(jsonPath("$.logs").value(2));

        List<Map<String, Object>> medicines = api.getList(user, "/api/medicines");
        assertThat(medicines).singleElement().satisfies(medicine -> {
            assertThat(medicine.get("name")).isEqualTo("Metformin");
            // Pill counts arrive as they stand; replayed logs don't use pills again.
            assertThat(((Number) medicine.get("pillsRemaining")).intValue()).isEqualTo(27);
        });

        List<Map<String, Object>> alarms = api.getList(user, "/api/alarms");
        assertThat(alarms).extracting(alarm -> alarm.get("alarmTime")).containsExactlyInAnyOrder("08:00:00", "20:00:00");

        List<Map<String, Object>> logs = api.getList(user, "/api/logs");
        assertThat(logs).extracting(log -> log.get("status")).containsExactlyInAnyOrder("TAKEN", "SKIPPED");
        assertThat(logs).anySatisfy(log -> {
            assertThat(log.get("scheduledFor")).isEqualTo("2026-09-30T08:00:00");
            assertThat(log.get("takenAt")).isEqualTo("2026-09-30T07:02:00Z");
        });
    }

    @Test
    void aBadItemImportsNothing() throws Exception {
        importGuest(user.bearer(), guestStore(42)).andExpect(status().isBadRequest());

        assertThat(api.getList(user, "/api/medicines")).isEmpty();
        assertThat(api.getList(user, "/api/alarms")).isEmpty();
    }

    @Test
    void requiresAnAccount() throws Exception {
        importGuest(null, guestStore(1)).andExpect(status().isUnauthorized());
    }
}
