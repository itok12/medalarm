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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class CaregiverControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private ApiTestClient api;
    private TestUser caregiver;
    private TestUser patient;

    @BeforeEach
    void setUp() throws Exception {
        api = new ApiTestClient(mockMvc, objectMapper);
        caregiver = api.register("caregiver");
        patient = api.register("patient");

        long medicineId = api.createMedicine(patient, 30);
        long alarmId = api.createAlarm(patient, medicineId, "08:00");
        api.log(patient, alarmId, "TAKEN", null).andExpect(status().isOk());
    }

    private ResultActions request(TestUser from, String patientUsername) throws Exception {
        return mockMvc.perform(post("/api/caregivers/patients")
                .header("Authorization", from.bearer())
                .contentType(MediaType.APPLICATION_JSON)
                .content(api.json(Map.of("patientUsername", patientUsername))));
    }

    private ResultActions readLogs(TestUser as, TestUser of) throws Exception {
        return mockMvc.perform(get("/api/caregivers/patients/" + of.id() + "/logs")
                .header("Authorization", as.bearer()));
    }

    private ResultActions accept(TestUser as, TestUser caregiverUser) throws Exception {
        return mockMvc.perform(post("/api/caregivers/caregivers/" + caregiverUser.id() + "/accept")
                .header("Authorization", as.bearer()));
    }

    @Test
    void aRequestSharesNothingUntilThePatientAccepts() throws Exception {
        request(caregiver, patient.username())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.email").doesNotExist());

        readLogs(caregiver, patient).andExpect(status().isForbidden());

        List<Map<String, Object>> incoming = api.getList(patient, "/api/caregivers/caregivers");
        assertThat(incoming).singleElement().satisfies(link -> {
            assertThat(link.get("username")).isEqualTo(caregiver.username());
            assertThat(link.get("status")).isEqualTo("PENDING");
        });

        accept(patient, caregiver)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACCEPTED"));

        readLogs(caregiver, patient)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void thePatientCanRevokeAccess() throws Exception {
        request(caregiver, patient.username()).andExpect(status().isCreated());
        accept(patient, caregiver).andExpect(status().isOk());

        mockMvc.perform(delete("/api/caregivers/caregivers/" + caregiver.id())
                        .header("Authorization", patient.bearer()))
                .andExpect(status().isNoContent());

        readLogs(caregiver, patient).andExpect(status().isForbidden());
        assertThat(api.getList(caregiver, "/api/caregivers/patients")).isEmpty();
    }

    @Test
    void onlyThePatientCanAccept() throws Exception {
        TestUser outsider = api.register("outsider");
        request(caregiver, patient.username()).andExpect(status().isCreated());

        // The caregiver cannot approve their own request...
        mockMvc.perform(post("/api/caregivers/caregivers/" + caregiver.id() + "/accept")
                        .header("Authorization", caregiver.bearer()))
                .andExpect(status().isNotFound());
        // ...and neither can anyone else.
        accept(outsider, caregiver).andExpect(status().isNotFound());

        readLogs(caregiver, patient).andExpect(status().isForbidden());
    }

    @Test
    void theCaregiverListShowsStatusWithoutEmails() throws Exception {
        request(caregiver, patient.username()).andExpect(status().isCreated());

        List<Map<String, Object>> patients = api.getList(caregiver, "/api/caregivers/patients");
        assertThat(patients).singleElement().satisfies(link -> {
            assertThat(link).containsEntry("status", "PENDING");
            assertThat(link).doesNotContainKey("email");
        });
    }

    @Test
    void duplicateAndSelfRequestsAreRejected() throws Exception {
        request(caregiver, patient.username()).andExpect(status().isCreated());
        request(caregiver, patient.username()).andExpect(status().isConflict());
        request(caregiver, caregiver.username()).andExpect(status().isBadRequest());
        request(caregiver, "no-such-user").andExpect(status().isBadRequest());
    }

    @Test
    void aStrangerCannotReadLogsWithoutAnyLink() throws Exception {
        TestUser stranger = api.register("stranger");
        readLogs(stranger, patient).andExpect(status().isForbidden());
    }
}
