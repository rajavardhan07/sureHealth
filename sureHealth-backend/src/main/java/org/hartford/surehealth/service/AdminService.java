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
}

