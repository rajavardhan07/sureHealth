package org.hartford.surehealth.service;

import lombok.RequiredArgsConstructor;
import java.util.List;
import org.hartford.surehealth.dto.CorporateRegisterDTO;
import org.hartford.surehealth.entity.CorporateClient;
import org.hartford.surehealth.entity.User;
import org.hartford.surehealth.enums.Role;
import org.hartford.surehealth.exceptions.DuplicateResourceException;
import org.hartford.surehealth.exceptions.ResourceNotFoundException;
import org.hartford.surehealth.repository.CorporateRepository;
import org.hartford.surehealth.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CorporateService {

    private final CorporateRepository corporateRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public void registerCorporate(CorporateRegisterDTO dto){

        if (userRepository.findByUsername(dto.username).isPresent()) {
            throw new DuplicateResourceException("Username already exists: " + dto.username);
        }

        if (corporateRepository.findByContactEmail(dto.contactEmail).isPresent()) {
            throw new DuplicateResourceException("Corporate client with this email already exists");
        }

        CorporateClient corp = new CorporateClient();
        corp.setCompanyName(dto.companyName);
        corp.setRegistrationNumber(dto.registrationNumber);
        corp.setContactPerson(dto.contactPerson);
        corp.setContactEmail(dto.contactEmail);
        corp.setContactPhone(dto.contactPhone);
        corp.setNumberOfEmployees(dto.numberOfEmployees);
        corp.setIndustryType(dto.industryType);

        corporateRepository.save(corp);

        User user = new User();
        user.setUsername(dto.username);
        user.setPassword(passwordEncoder.encode(dto.password));
        user.setRole(Role.HR);
        user.setCorporateClient(corp);

        userRepository.save(user);
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }

    public List<CorporateClient> getAllCorporateClients() {
        return corporateRepository.findAll();
    }

    public CorporateClient suspendCorporateClient(Long id) {
        CorporateClient client = corporateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Corporate Client not found with id: " + id));
        
        client.setStatus("SUSPENDED");
        return corporateRepository.save(client);
    }
}


