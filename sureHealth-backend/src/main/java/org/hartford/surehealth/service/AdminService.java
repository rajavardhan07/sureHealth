package org.hartford.surehealth.service;

import lombok.RequiredArgsConstructor;
import org.hartford.surehealth.dto.ClaimsOfficerCreateDTO;
import org.hartford.surehealth.enums.Role;
import org.hartford.surehealth.entity.User;
import org.hartford.surehealth.exceptions.DuplicateResourceException;
import org.hartford.surehealth.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;

    @Transactional
    public User createClaimsOfficer(ClaimsOfficerCreateDTO dto) {
        if (userRepository.findByUsername(dto.getUsername()).isPresent()) {
            throw new DuplicateResourceException("User with username '" + dto.getUsername() + "' already exists");
        }

        User claimsOfficer = new User();
        claimsOfficer.setUsername(dto.getUsername());
        claimsOfficer.setPassword(passwordEncoder.encode(dto.getPassword()));
        claimsOfficer.setFullName(dto.getFullName());
        claimsOfficer.setPhoneNumber(dto.getPhoneNumber());
        claimsOfficer.setLicenseNumber(dto.getLicenseNumber());
        claimsOfficer.setCommissionPercentage(dto.getCommissionPercentage());
        claimsOfficer.setRole(Role.CLAIMS_OFFICER);
        claimsOfficer.setFirstLogin(false);

        return userRepository.save(claimsOfficer);
    }

    @Transactional
    public User createUnderwriter(org.hartford.surehealth.dto.UnderwriterCreateDTO dto) {
        if (userRepository.findByUsername(dto.getUsername()).isPresent()) {
            throw new DuplicateResourceException("User with username '" + dto.getUsername() + "' already exists");
        }

        User underwriter = new User();
        underwriter.setUsername(dto.getUsername());
        underwriter.setPassword(passwordEncoder.encode(dto.getPassword()));
        underwriter.setFullName(dto.getFullName());
        underwriter.setPhoneNumber(dto.getPhoneNumber());
        underwriter.setLicenseNumber(dto.getLicenseNumber());
        underwriter.setCommissionPercentage(dto.getCommissionPercentage());
        underwriter.setRole(Role.UNDERWRITER);
        underwriter.setFirstLogin(false);

        return userRepository.save(underwriter);
    }

    public List<User> getUsersByRole(Role role) {
        return userRepository.findByRole(role);
    }

    @Transactional
    public void changePassword(Long userId, String newPassword) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new org.hartford.surehealth.exceptions.ResourceNotFoundException("User not found"));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        notificationService.createNotification(
            user,
            "Your password has been updated by the Administrator. Please use your new credentials for future logins.",
            org.hartford.surehealth.enums.NotificationType.INFO
        );
    }

    @Transactional
    public User updateOfficer(Long id, org.hartford.surehealth.dto.OfficerUpdateDTO dto) {
        User officer = userRepository.findById(id)
            .orElseThrow(() -> new org.hartford.surehealth.exceptions.ResourceNotFoundException("Officer not found with id: " + id));
        
        officer.setFullName(dto.getFullName());
        officer.setPhoneNumber(dto.getPhoneNumber());
        officer.setDepartment(dto.getDepartment());
        
        if (dto.getLicenseNumber() != null) {
            officer.setLicenseNumber(dto.getLicenseNumber());
        }
        if (dto.getCommissionPercentage() != null) {
            officer.setCommissionPercentage(dto.getCommissionPercentage());
        }
        
        return userRepository.save(officer);
    }

    @Transactional
    public void toggleOfficerStatus(Long id, String action, boolean state) {
        User officer = userRepository.findById(id)
            .orElseThrow(() -> new org.hartford.surehealth.exceptions.ResourceNotFoundException("Officer not found with id: " + id));
        
        if ("ACTIVE".equalsIgnoreCase(action)) {
            officer.setActive(state);
        } else if ("SUSPEND".equalsIgnoreCase(action)) {
            officer.setSuspended(state);
        }
        userRepository.save(officer);
    }
}

