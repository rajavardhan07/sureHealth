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
    private final org.hartford.surehealth.service.ClaimService claimService;
    private final org.hartford.surehealth.service.PolicyService policyService;

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

    @PutMapping("/users/{id}/password")
    @PreAuthorize("hasRole('ADMIN')")
    public void changePassword(@PathVariable("id") Long id, @RequestBody java.util.Map<String, String> body) {
        adminService.changePassword(id, body.get("password"));
    }

    @PutMapping("/claims/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public void assignClaim(@PathVariable("id") Long id, @RequestParam("officerId") Long officerId) {
        claimService.assignOfficer(id, officerId);
    }

    @PutMapping("/policies/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public void assignPolicy(@PathVariable("id") Long id, @RequestParam("underwriterId") Long underwriterId) {
        policyService.assignUnderwriter(id, underwriterId);
    }

    @PutMapping("/officers/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public User updateOfficer(@PathVariable("id") Long id, @Valid @RequestBody org.hartford.surehealth.dto.OfficerUpdateDTO dto) {
        return adminService.updateOfficer(id, dto);
    }

    @PatchMapping("/officers/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public void toggleOfficerStatus(@PathVariable("id") Long id, @RequestParam("action") String action, @RequestParam("state") boolean state) {
        adminService.toggleOfficerStatus(id, action, state);
    }
}

