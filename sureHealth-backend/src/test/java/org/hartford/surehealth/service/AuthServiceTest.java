package org.hartford.surehealth.service;

import org.hartford.surehealth.dto.LoginResponseDTO;
import org.hartford.surehealth.entity.User;
import org.hartford.surehealth.enums.Role;
import org.hartford.surehealth.exceptions.InvalidCredentialsException;
import org.hartford.surehealth.repository.UserRepository;
import org.hartford.surehealth.util.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
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

    @Test
    void shouldReturnTokenWhenCredentialsAreValid() {
        // ARRANGE
        String username = "admin";
        String password = "admin123";
        User user = new User();
        user.setUsername(username);
        user.setRole(Role.ADMIN);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(null);
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(jwtUtil.generateToken(username, "ADMIN")).thenReturn("mock-jwt-token");

        // ACT
        LoginResponseDTO result = authService.login(username, password);

        // ASSERT
        assertNotNull(result);
        assertEquals("mock-jwt-token", result.getToken());
        assertEquals(username, result.getUsername());
        assertEquals("ADMIN", result.getRole());
        verify(authenticationManager, times(1)).authenticate(any());
        verify(userRepository, times(1)).findByUsername(username);
    }

    @Test
    void shouldThrowExceptionWhenUserNotFound() {
        // ARRANGE
        String username = "nonexistent";
        String password = "password";

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(null);
        when(userRepository.findByUsername(username)).thenReturn(Optional.empty());

        // ACT & ASSERT
        assertThrows(InvalidCredentialsException.class, () -> {
            authService.login(username, password);
        });
    }

    @Test
    void shouldChangePasswordSuccessfully() {
        // ARRANGE
        String username = "admin";
        String oldPassword = "old123";
        String newPassword = "new123";
        User user = new User();
        user.setUsername(username);
        user.setPassword("encoded-old");

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(oldPassword, "encoded-old")).thenReturn(true);
        when(passwordEncoder.encode(newPassword)).thenReturn("encoded-new");

        // ACT
        authService.changePassword(username, oldPassword, newPassword);

        // ASSERT
        verify(userRepository, times(1)).save(user);
        assertEquals("encoded-new", user.getPassword());
    }
}
