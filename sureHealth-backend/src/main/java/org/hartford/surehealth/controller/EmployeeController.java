package org.hartford.surehealth.controller;

import lombok.RequiredArgsConstructor;
import org.hartford.surehealth.dto.EmployeeCreateDTO;
import org.hartford.surehealth.entity.Employee;
import org.hartford.surehealth.entity.User;
import org.hartford.surehealth.repository.EmployeeRepository;
import org.hartford.surehealth.repository.UserRepository;
import org.hartford.surehealth.service.EmployeeService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/employee")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    @PostMapping(value = "/add", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('HR')")
    public Map<String, String> add(
            @ModelAttribute EmployeeCreateDTO dto,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        
        try {
            return employeeService.addEmployee(dto, file);
        } catch (Exception e) {
            throw new RuntimeException("Failed to add employee: " + e.getMessage());
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public Employee getEmployeeById(@PathVariable Long id) {
        return employeeRepository.findById(id).orElseThrow();
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public Employee getMyProfile(Authentication auth) {
        User user = userRepository.findByUsername(auth.getName()).orElseThrow();
        return user.getEmployee();
    }
}


