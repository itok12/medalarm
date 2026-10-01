package com.example.medapp.support;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Small helper for integration tests that drive the API as real users. */
public class ApiTestClient {

    public static final List<String> EVERY_DAY =
            List.of("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY");

    private final MockMvc mockMvc;
    private final ObjectMapper objectMapper;

    public ApiTestClient(MockMvc mockMvc, ObjectMapper objectMapper) {
        this.mockMvc = mockMvc;
        this.objectMapper = objectMapper;
    }

    public record TestUser(long id, String username, String token) {
        public String bearer() {
            return "Bearer " + token;
        }
    }

    public TestUser register(String prefix) throws Exception {
        String username = prefix + "-" + UUID.randomUUID().toString().substring(0, 8);
        Map<String, Object> body = readMap(mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of(
                                "username", username,
                                "password", "password123",
                                "email", username + "@example.com",
                                "timezone", "Europe/London"))))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString());
        return new TestUser(((Number) body.get("userId")).longValue(), username, body.get("token").toString());
    }

    public long createMedicine(TestUser user, int pillsRemaining) throws Exception {
        Map<String, Object> body = readMap(mockMvc.perform(post("/api/medicines")
                        .header("Authorization", user.bearer())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of(
                                "name", "Metformin",
                                "dosage", "500mg",
                                "frequency", "Twice daily",
                                "startDate", "2026-09-01",
                                "pillsRemaining", pillsRemaining,
                                "pillsPerDose", 1))))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString());
        return ((Number) body.get("id")).longValue();
    }

    public long createAlarm(TestUser user, long medicineId, String time) throws Exception {
        Map<String, Object> body = readMap(mockMvc.perform(post("/api/alarms")
                        .header("Authorization", user.bearer())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of(
                                "medicineId", medicineId,
                                "alarmTime", time,
                                "active", true,
                                "repeatDays", EVERY_DAY))))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString());
        return ((Number) body.get("id")).longValue();
    }

    public ResultActions log(TestUser user, long alarmId, String status, String scheduledFor) throws Exception {
        Map<String, Object> payload = scheduledFor == null
                ? Map.of("alarmId", alarmId, "status", status)
                : Map.of("alarmId", alarmId, "status", status, "scheduledFor", scheduledFor);
        return mockMvc.perform(post("/api/logs")
                .header("Authorization", user.bearer())
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(payload)));
    }

    public List<Map<String, Object>> getList(TestUser user, String path) throws Exception {
        String body = mockMvc.perform(get(path).header("Authorization", user.bearer()))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readValue(body, objectMapper.getTypeFactory()
                .constructCollectionType(List.class, Map.class));
    }

    public String json(Object value) throws Exception {
        return objectMapper.writeValueAsString(value);
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> readMap(String body) throws Exception {
        return objectMapper.readValue(body, Map.class);
    }
}
