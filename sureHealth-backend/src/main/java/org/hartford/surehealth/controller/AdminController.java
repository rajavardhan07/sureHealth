package org.hartford.surehealth.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.hartford.surehealth.dto.ClaimsOfficerCreateDTO;
import org.hartford.surehealth.entity.User;
import org.hartford.surehealth.service.AdminService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @PostMapping("/claims-officers")
    @PreAuthorize("hasRole('ADMIN')")
    public User createClaimsOfficer(@Valid @RequestBody ClaimsOfficerCreateDTO dto) {
        return adminService.createClaimsOfficer(dto);
    }

    @PostMapping("/underwriters")
    @PreAuthorize("hasRole('ADMIN')")
    public User createUnderwriter(@Valid @RequestBody org.hartford.surehealth.dto.UnderwriterCreateDTO dto) {
        return adminService.createUnderwriter(dto);
    }

    @GetMapping("/claims-officers")
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getClaimsOfficers() {
        return adminService.getUsersByRole(org.hartford.surehealth.enums.Role.CLAIMS_OFFICER);
    }

    @GetMapping("/underwriters")
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getUnderwriters() {
        return adminService.getUsersByRole(org.hartford.surehealth.enums.Role.UNDERWRITER);
    }
}

