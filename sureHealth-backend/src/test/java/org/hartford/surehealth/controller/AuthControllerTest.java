package org.hartford.surehealth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.hartford.surehealth.dto.ChangePasswordDTO;
import org.hartford.surehealth.dto.LoginRequestDTO;
import org.hartford.surehealth.dto.LoginResponseDTO;
import org.hartford.surehealth.service.AuthService;
import org.hartford.surehealth.util.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private JwtUtil jwtUtil;

    @MockitoBean
    private UserDetailsService userDetailsService;

    @Test
    void login_Success() throws Exception {
        LoginRequestDTO request = new LoginRequestDTO();
        request.setUsername("user");
        request.setPassword("pass");

        LoginResponseDTO response = new LoginResponseDTO("token", "user", "ROLE_USER");
        when(authService.login("user", "pass")).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("token"));
    }

    @Test
    @WithMockUser(username = "user")
    void changePassword_Success() throws Exception {
        ChangePasswordDTO request = new ChangePasswordDTO();
        request.setOldPassword("old");
        request.setNewPassword("newPassword");

        mockMvc.perform(post("/api/auth/change-password")
                        .principal(new UsernamePasswordAuthenticationToken("user", null, Collections.emptyList()))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        verify(authService).changePassword(anyString(), anyString(), anyString());
    }
}
