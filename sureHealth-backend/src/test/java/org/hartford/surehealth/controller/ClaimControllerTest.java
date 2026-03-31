package org.hartford.surehealth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.hartford.surehealth.dto.ClaimApprovalDTO;
import org.hartford.surehealth.entity.Claim;

import org.hartford.surehealth.repository.ClaimRepository;
import org.hartford.surehealth.repository.UserRepository;
import org.hartford.surehealth.service.ClaimService;
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

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import java.math.BigDecimal;
import java.util.Collections;


import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ClaimController.class)
@AutoConfigureMockMvc(addFilters = false)
class ClaimControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ClaimService claimService;
    @MockitoBean
    private ClaimRepository claimRepository;
    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private JwtUtil jwtUtil;

    @MockitoBean
    private UserDetailsService userDetailsService;

    @Test
    @WithMockUser(roles = "EMPLOYEE")
    void fileClaim_Success() throws Exception {
        Claim claim = new Claim();
        claim.setClaimNumber("CLM-1");
        when(claimService.fileClaim(any(), any())).thenReturn(claim);

        mockMvc.perform(multipart("/api/claims/file")
                        .param("employeeId", "1")
                        .param("policyId", "1")
                        .param("billAmount", "1000")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.claimNumber").value("CLM-1"));
    }

    @Test
    @WithMockUser(username = "officer", roles = "CLAIMS_OFFICER")
    void approveClaim_Success() throws Exception {
        ClaimApprovalDTO dto = new ClaimApprovalDTO();
        dto.setApprovedAmount(BigDecimal.valueOf(500));

        mockMvc.perform(put("/api/claims/1/approve")
                        .principal(new UsernamePasswordAuthenticationToken("officer", null, Collections.emptyList()))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andDo(org.springframework.test.web.servlet.result.MockMvcResultHandlers.print())
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getAllClaims_Success() throws Exception {
        when(claimRepository.findAll()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/claims/all")
                        .with(csrf()))
                .andExpect(status().isOk());
    }
}
