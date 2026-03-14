package org.hartford.surehealth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.hartford.surehealth.dto.PolicyRequestDTO;
import org.hartford.surehealth.entity.GroupPolicy;
import org.hartford.surehealth.enums.PolicyStatus;
import org.hartford.surehealth.repository.GroupPolicyRepository;
import org.hartford.surehealth.repository.UserRepository;
import org.hartford.surehealth.service.PolicyService;
import org.hartford.surehealth.service.PremiumCalculationService;
import org.hartford.surehealth.util.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PolicyController.class)
@AutoConfigureMockMvc(addFilters = false)
class PolicyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private PolicyService policyService;
    @MockitoBean
    private GroupPolicyRepository policyRepository;
    @MockitoBean
    private PremiumCalculationService premiumCalculationService;
    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private JwtUtil jwtUtil;

    @MockitoBean
    private UserDetailsService userDetailsService;

    @Test
    @WithMockUser(roles = "HR")
    void requestPolicy_Success() throws Exception {
        PolicyRequestDTO dto = new PolicyRequestDTO();
        dto.corporateId = 1L;
        dto.planId = 1L;

        doNothing().when(policyService).requestPolicy(any());

        mockMvc.perform(post("/api/policy/request")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getPendingPolicies_Success() throws Exception {
        when(policyRepository.findByStatus(PolicyStatus.PENDING_ADMIN_APPROVAL)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/policy/pending")
                        .with(csrf()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void approvePolicy_Success() throws Exception {
        mockMvc.perform(put("/api/policy/approve/1")
                        .with(csrf()))
                .andExpect(status().isOk());
    }
}
