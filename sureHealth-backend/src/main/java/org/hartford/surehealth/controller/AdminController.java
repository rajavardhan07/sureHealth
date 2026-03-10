package org.hartford.surehealth.controller;

import lombok.RequiredArgsConstructor;
import org.hartford.surehealth.dto.ClaimsOfficerCreateDTO;
import org.hartford.surehealth.entity.User;
import org.hartford.surehealth.service.AdminService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @PostMapping("/claims-officers")
    @PreAuthorize("hasRole('ADMIN')")
    public User createClaimsOfficer(@RequestBody ClaimsOfficerCreateDTO dto) {
        return adminService.createClaimsOfficer(dto);
    }

    @PostMapping("/underwriters")
    @PreAuthorize("hasRole('ADMIN')")
    public User createUnderwriter(@RequestBody org.hartford.surehealth.dto.UnderwriterCreateDTO dto) {
        return adminService.createUnderwriter(dto);
    }
}
