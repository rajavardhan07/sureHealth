package org.hartford.surehealth.service;

import lombok.RequiredArgsConstructor;
import org.hartford.surehealth.dto.EmployeeCreateDTO;
import org.hartford.surehealth.entity.CorporateClient;
import org.hartford.surehealth.entity.Employee;
import org.hartford.surehealth.entity.GroupPolicy;
import org.hartford.surehealth.entity.User;
import org.hartford.surehealth.entity.PolicyStatus;
import org.hartford.surehealth.entity.Role;
import org.hartford.surehealth.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.math.BigDecimal;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final CorporateRepository corporateRepository;
    private final GroupPolicyRepository policyRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public Map<String, String> addEmployee(EmployeeCreateDTO dto, MultipartFile file) throws Exception {
        try {
            CorporateClient corp = corporateRepository.findById(dto.corporateId).orElseThrow();

            Employee emp = new Employee();
            emp.setFullName(dto.fullName);
            emp.setEmail(dto.email);
            emp.setPhone(dto.phone);
            emp.setAge(dto.age);
            emp.setDepartment(dto.department);
            emp.setGender(dto.gender);
            emp.setDesignation(dto.designation);
            if (dto.joinDate != null && !dto.joinDate.isEmpty()) {
                emp.setJoinDate(LocalDate.parse(dto.joinDate));
            } else {
                emp.setJoinDate(LocalDate.now());
            }
            emp.setCorporateClient(corp);

            if (file != null && !file.isEmpty()) {
                emp.setHealthReportFile(file.getBytes());
                emp.setHealthReportFileName(file.getOriginalFilename());
            }

            emp.setCoverageAmount(BigDecimal.ZERO);
            emp.setRemainingCoverage(BigDecimal.ZERO);

            employeeRepository.save(emp);

            String username = dto.email;
            String password = "Welcome@123";

            User user = new User();
            user.setUsername(username);
            user.setPassword(passwordEncoder.encode(password));
            user.setRole(Role.EMPLOYEE);
            user.setEmployee(emp);
            user.setCorporateClient(corp); // Associate user with corporate

            userRepository.save(user);
            log.info("Successfully created employee and user for: {}", username);

            Map<String, String> credentials = new HashMap<>();
            credentials.put("username", username);
            credentials.put("password", password);
            credentials.put("message", "Employee added successfully");
            return credentials;
        } catch (Exception e) {
            log.error("Error in addEmployee: {} | DTO: {}", e.getMessage(), dto, e);
            throw e;
        }
    }

    // Add toString to DTO for logging if possible, but I'll skip it for now and just log the error.
    // Wait, I can't add toString to a DTO easily without changing the file.
    // I'll just log the message.
}

