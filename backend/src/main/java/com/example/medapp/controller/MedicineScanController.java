package com.example.medapp.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/medicines")
public class MedicineScanController {

    private static final String ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
    private static final String ANTHROPIC_VERSION = "2023-06-01";
    private static final String MODEL = "claude-3-5-haiku-20241022";
    private static final String PROMPT =
        "Look at this medication packaging, label, or pill image. " +
        "Extract the medication name, dosage (e.g. 500mg, 10mg/5ml), " +
        "frequency (must be exactly one of: Once daily, Twice daily, Three times daily, Four times daily, As needed), " +
        "and any special instructions (e.g. take with food, avoid alcohol). " +
        "Respond ONLY with a JSON object — no extra text — in this exact format: " +
        "{\"name\":\"\",\"dosage\":\"\",\"frequency\":\"\",\"instructions\":\"\"}. " +
        "If you cannot identify the medication, respond: {\"error\":\"Could not identify medication\"}.";

    @Value("${anthropic.api-key:}")
    private String anthropicApiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(10))
        .build();

    @PostMapping("/scan")
    public ResponseEntity<?> scanMedication(@RequestParam("image") MultipartFile image) {
        if (anthropicApiKey == null || anthropicApiKey.isBlank()) {
            return ResponseEntity.status(503)
                .body(Map.of("error", "AI scanning is not configured on this server"));
        }

        try {
            String base64Image = Base64.getEncoder().encodeToString(image.getBytes());
            String mediaType = image.getContentType() != null ? image.getContentType() : "image/jpeg";

            Map<String, Object> requestBody = Map.of(
                "model", MODEL,
                "max_tokens", 256,
                "messages", List.of(Map.of(
                    "role", "user",
                    "content", List.of(
                        Map.of(
                            "type", "image",
                            "source", Map.of(
                                "type", "base64",
                                "media_type", mediaType,
                                "data", base64Image
                            )
                        ),
                        Map.of("type", "text", "text", PROMPT)
                    )
                ))
            );

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(ANTHROPIC_API_URL))
                .timeout(Duration.ofSeconds(25))
                .header("Content-Type", "application/json")
                .header("x-api-key", anthropicApiKey)
                .header("anthropic-version", ANTHROPIC_VERSION)
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(requestBody)))
                .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                return ResponseEntity.status(502)
                    .body(Map.of("error", "AI service error — please fill in manually"));
            }

            JsonNode responseJson = objectMapper.readTree(response.body());
            String content = responseJson.path("content").get(0).path("text").asText("{}");

            int start = content.indexOf('{');
            int end = content.lastIndexOf('}') + 1;
            if (start < 0 || end <= start) {
                return ResponseEntity.ok(Map.of("error", "Could not parse medication information"));
            }

            JsonNode result = objectMapper.readTree(content.substring(start, end));
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("error", "Scan failed — please fill in manually"));
        }
    }
}
