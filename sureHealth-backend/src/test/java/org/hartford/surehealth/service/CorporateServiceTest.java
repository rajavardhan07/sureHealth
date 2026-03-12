package org.hartford.surehealth.service;

import org.hartford.surehealth.dto.CorporateRegisterDTO;
import org.hartford.surehealth.entity.CorporateClient;
import org.hartford.surehealth.entity.User;
import org.hartford.surehealth.enums.Role;
import org.hartford.surehealth.exceptions.DuplicateResourceException;
import org.hartford.surehealth.exceptions.ResourceNotFoundException;
import org.hartford.surehealth.repository.CorporateRepository;
import org.hartford.surehealth.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CorporateServiceTest {

    @Mock
    private CorporateRepository corporateRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private CorporateService corporateService;

    @Test
    void shouldRegisterCorporateSuccessfully() {
        // ARRANGE
        CorporateRegisterDTO dto = new CorporateRegisterDTO();
        dto.companyName = "TechCorp";
        dto.registrationNumber = "REG123";
        dto.contactPerson = "John Doe";
        dto.contactEmail = "john@techcorp.com";
        dto.contactPhone = "1234567890";
        dto.username = "hr_techcorp";
        dto.password = "password123";

        when(userRepository.findByUsername(dto.username)).thenReturn(Optional.empty());
        when(corporateRepository.findByContactEmail(dto.contactEmail)).thenReturn(Optional.empty());
        when(passwordEncoder.encode(dto.password)).thenReturn("encoded-password");
        when(corporateRepository.save(any(CorporateClient.class))).thenAnswer(i -> i.getArgument(0));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        // ACT
        corporateService.registerCorporate(dto);

        // ASSERT
        verify(corporateRepository, times(1)).save(any(CorporateClient.class));
        verify(userRepository, times(1)).save(any(User.class));
        verify(passwordEncoder, times(1)).encode(dto.password);
    }

    @Test
    void shouldThrowExceptionWhenUsernameAlreadyExists() {
        // ARRANGE
        CorporateRegisterDTO dto = new CorporateRegisterDTO();
        dto.username = "existing_user";
        dto.contactEmail = "new@email.com";

        User existingUser = new User();
        when(userRepository.findByUsername(dto.username)).thenReturn(Optional.of(existingUser));

        // ACT & ASSERT
        DuplicateResourceException exception = assertThrows(DuplicateResourceException.class, () -> {
            corporateService.registerCorporate(dto);
        });

        assertTrue(exception.getMessage().contains("Username already exists"));
        verify(corporateRepository, never()).save(any());
    }

    @Test
    void shouldThrowExceptionWhenEmailAlreadyExists() {
        // ARRANGE
        CorporateRegisterDTO dto = new CorporateRegisterDTO();
        dto.username = "new_user";
        dto.contactEmail = "existing@email.com";

        CorporateClient existingCorp = new CorporateClient();
        when(userRepository.findByUsername(dto.username)).thenReturn(Optional.empty());
        when(corporateRepository.findByContactEmail(dto.contactEmail)).thenReturn(Optional.of(existingCorp));

        // ACT & ASSERT
        DuplicateResourceException exception = assertThrows(DuplicateResourceException.class, () -> {
            corporateService.registerCorporate(dto);
        });

        assertTrue(exception.getMessage().contains("email already exists"));
        verify(corporateRepository, never()).save(any());
    }

    @Test
    void shouldGetUserByUsername() {
        // ARRANGE
        String username = "testuser";
        User user = new User();
        user.setUsername(username);
        user.setRole(Role.HR);

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));

        // ACT
        User result = corporateService.getUserByUsername(username);

        // ASSERT
        assertNotNull(result);
        assertEquals(username, result.getUsername());
        assertEquals(Role.HR, result.getRole());
        verify(userRepository, times(1)).findByUsername(username);
    }

    @Test
    void shouldThrowExceptionWhenUserNotFoundByUsername() {
        // ARRANGE
        String username = "nonexistent";
        when(userRepository.findByUsername(username)).thenReturn(Optional.empty());

        // ACT & ASSERT
        assertThrows(ResourceNotFoundException.class, () -> {
            corporateService.getUserByUsername(username);
        });
    }

}
