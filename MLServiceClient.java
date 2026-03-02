package com.example.medapp.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.web.multipart.MultipartFile;
import java.util.Collections;

@Service
public class MLServiceClient {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.ml-service.url}")
    private String mlServiceUrl;

    public static record MedicineInfo(String name, String dosage, String frequency, Double confidence) {}

    public MedicineInfo extractMedicineInfo(MultipartFile image) {
        try {
            var map = new LinkedMultiValueMap<String, Object>();
            map.add("file", new ByteArrayResource(image.getBytes()) {
                @Override
                public String getFilename() {
                    return image.getOriginalFilename();
                }
            });

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

            HttpEntity<LinkedMultiValueMap<String, Object>> requestEntity = new HttpEntity<>(map, headers);
            
                // Use the injected URL
                ResponseEntity<MedicineInfo> response = restTemplate.postForEntity(
                    mlServiceUrl,
                    requestEntity,
                    MedicineInfo.class
                );
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            } else {
                throw new RuntimeException("ML service returned error: " + response.getStatusCode());
            }
        } catch (Exception e) {
            // Return default values if ML service is unavailable
            return new MedicineInfo("Medicine", "1 tablet", "twice daily", 0.0);
        }
    }
}