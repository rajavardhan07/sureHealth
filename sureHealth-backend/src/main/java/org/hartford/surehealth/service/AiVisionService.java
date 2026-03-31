package org.hartford.surehealth.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.hartford.surehealth.dto.ClaimOcrResultDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AiVisionService {

    @Value("${gemini.api.key:}")
    private String apiKey;

    private final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent?key=";

    private static final int MAX_RETRIES = 3;
    private static final long INITIAL_BACKOFF_MS = 2000;

    public ClaimOcrResultDTO verifyClaimOcr(byte[] fileBytes, String mimeType) throws Exception {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new RuntimeException("Gemini API Key is not configured in application.properties");
        }

        RestTemplate restTemplate = new RestTemplate();
        String url = GEMINI_API_URL + apiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String base64Data = Base64.getEncoder().encodeToString(fileBytes);
        String prompt = "Analyze this medical document and extract the hospitalName, patientName, diagnosis, billAmount (as a pure number), billNumber (invoice or bill number), and treatmentDate. Respond ONLY with a raw JSON object containing these specific keys. Do not include markdown blocks or any other text.";

        // Construct Gemini JSON payload
        Map<String, Object> inlineData = new HashMap<>();
        inlineData.put("mime_type", mimeType != null && !mimeType.isEmpty() ? mimeType : "application/pdf");
        inlineData.put("data", base64Data);

        Map<String, Object> part1 = new HashMap<>();
        part1.put("text", prompt);

        Map<String, Object> part2 = new HashMap<>();
        part2.put("inline_data", inlineData);

        Map<String, Object> content = new HashMap<>();
        content.put("parts", List.of(part1, part2));

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", List.of(content));

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        // Retry loop with exponential backoff for rate limiting
        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                Map<?, ?> response = restTemplate.postForObject(url, request, Map.class);
                if (response != null && response.containsKey("candidates")) {
                    List<?> candidates = (List<?>) response.get("candidates");
                    if (!candidates.isEmpty()) {
                        Map<?, ?> firstCandidate = (Map<?, ?>) candidates.get(0);
                        Map<?, ?> contentMap = (Map<?, ?>) firstCandidate.get("content");
                        List<?> parts = (List<?>) contentMap.get("parts");
                        if (!parts.isEmpty()) {
                            Map<?, ?> firstPart = (Map<?, ?>) parts.get(0);
                            String jsonString = (String) firstPart.get("text");

                            // Clean up markdown block if API returned it despite prompt
                            jsonString = jsonString.replaceAll("```json", "").replaceAll("```", "").trim();

                            ObjectMapper mapper = new ObjectMapper();
                            return mapper.readValue(jsonString, ClaimOcrResultDTO.class);
                        }
                    }
                }
                throw new RuntimeException("Failed to extract data: Invalid response format from Gemini");

            } catch (HttpClientErrorException.TooManyRequests e) {
                System.err.println("Gemini API rate limit hit (attempt " + attempt + "/" + MAX_RETRIES + ")");
                if (attempt == MAX_RETRIES) {
                    throw new RuntimeException(
                        "Gemini API quota exceeded. The free tier rate limit has been reached. " +
                        "Please wait a minute and try again, or upgrade to a paid plan at https://ai.google.dev/gemini-api/docs/rate-limits"
                    );
                }
                // Exponential backoff: 2s, 4s, 8s...
                long waitMs = INITIAL_BACKOFF_MS * (long) Math.pow(2, attempt - 1);
                Thread.sleep(waitMs);

            } catch (HttpClientErrorException e) {
                String body = e.getResponseBodyAsString();
                if (body.contains("RESOURCE_EXHAUSTED") || body.contains("429")) {
                    System.err.println("Gemini API resource exhausted (attempt " + attempt + "/" + MAX_RETRIES + ")");
                    if (attempt == MAX_RETRIES) {
                        throw new RuntimeException(
                            "Gemini API quota exceeded. The free tier rate limit has been reached. " +
                            "Please wait a minute and try again, or upgrade to a paid plan at https://ai.google.dev/gemini-api/docs/rate-limits"
                        );
                    }
                    long waitMs = INITIAL_BACKOFF_MS * (long) Math.pow(2, attempt - 1);
                    Thread.sleep(waitMs);
                } else {
                    throw new RuntimeException("AI analysis failed: " + e.getStatusCode().value() + " - " + e.getStatusText());
                }
            } catch (RuntimeException e) {
                throw e;
            } catch (Exception e) {
                throw new RuntimeException("AI analysis failed: " + e.getMessage());
            }
        }
        throw new RuntimeException("AI analysis failed after " + MAX_RETRIES + " attempts");
    }
}

