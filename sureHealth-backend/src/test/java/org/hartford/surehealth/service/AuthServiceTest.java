package org.hartford.surehealth.service;

import org.hartford.surehealth.dto.LoginResponseDTO;
import org.hartford.surehealth.entity.User;
import org.hartford.surehealth.enums.Role;
import org.hartford.surehealth.exceptions.InvalidCredentialsException;
import org.hartford.surehealth.repository.UserRepository;
import org.hartford.surehealth.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setPassword("encodedPassword");
        testUser.setRole(Role.EMPLOYEE);
    }

    @Test
    void login_Success() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(jwtUtil.generateToken("testuser", "EMPLOYEE")).thenReturn("mockToken");

        LoginResponseDTO response = authService.login("testuser", "password");

        assertNotNull(response);
        assertEquals("mockToken", response.getToken());
        assertEquals("testuser", response.getUsername());
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    void login_InvalidCredentials() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Invalid credentials"));

        assertThrows(InvalidCredentialsException.class, () -> authService.login("testuser", "wrong"));
    }

    @Test
    void changePassword_Success() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("old", "encodedPassword")).thenReturn(true);
        when(passwordEncoder.encode("new")).thenReturn("newEncoded");

        authService.changePassword("testuser", "old", "new");

        assertEquals("newEncoded", testUser.getPassword());
        verify(userRepository).save(testUser);
    }

    @Test
    void changePassword_WrongOldPassword() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrong", "encodedPassword")).thenReturn(false);

        assertThrows(InvalidCredentialsException.class, () -> authService.changePassword("testuser", "wrong", "new"));
    }
}
