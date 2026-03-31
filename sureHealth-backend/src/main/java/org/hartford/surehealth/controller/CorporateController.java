package org.hartford.surehealth.controller;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.hartford.surehealth.dto.CorporateRegisterDTO;
import org.hartford.surehealth.entity.CorporateClient;
import org.hartford.surehealth.entity.Employee;
import org.hartford.surehealth.entity.GroupPolicy;
import org.hartford.surehealth.entity.User;
import org.hartford.surehealth.entity.Claim;
import org.hartford.surehealth.repository.CorporateRepository;
import org.hartford.surehealth.repository.EmployeeRepository;
import org.hartford.surehealth.repository.GroupPolicyRepository;
import org.hartford.surehealth.repository.ClaimRepository;
import org.hartford.surehealth.service.CorporateService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin("http://localhost:4200")
@RequestMapping("/api/corporate")
@RequiredArgsConstructor
public class CorporateController {

    private final CorporateService corporateService;
    private final CorporateRepository corporateRepository;
    private final GroupPolicyRepository policyRepository;
    private final EmployeeRepository employeeRepository;
    private final ClaimRepository claimRepository;

    @PostMapping("/register")
    public void register(@Valid @RequestBody CorporateRegisterDTO dto){
        corporateService.registerCorporate(dto);
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('HR')")
    public CorporateClient getMyProfile(Authentication auth) {
        User user = corporateService.getUserByUsername(auth.getName());
        return user.getCorporateClient();
    }

    @GetMapping("/me/policies")
    @PreAuthorize("hasRole('HR')")
    public List<GroupPolicy> getMyPolicies(Authentication auth) {
        User user = corporateService.getUserByUsername(auth.getName());
        return policyRepository.findByCorporateClientId(user.getCorporateClient().getId());
    }

    @GetMapping("/me/employees")
    @PreAuthorize("hasRole('HR')")
    public List<Employee> getMyEmployees(Authentication auth) {
        User user = corporateService.getUserByUsername(auth.getName());
        return employeeRepository.findByCorporateClientId(user.getCorporateClient().getId());
    }

    @GetMapping("/me/employees/unassigned")
    @PreAuthorize("hasRole('HR')")
    public List<Employee> getMyUnassignedEmployees(Authentication auth) {
        User user = corporateService.getUserByUsername(auth.getName());
        return employeeRepository.findByGroupPolicyIdIsNullAndCorporateClientId(user.getCorporateClient().getId());
    }

    @GetMapping("/me/employees/for-resubmit/{policyId}")
    @PreAuthorize("hasRole('HR')")
    public List<Employee> getMyEmployeesForResubmit(@PathVariable("policyId") Long policyId, Authentication auth) {
        User user = corporateService.getUserByUsername(auth.getName());
        Long corpId = user.getCorporateClient().getId();
        // Return employees who are either unassigned OR assigned to this specific policy
        return employeeRepository.findUnassignedOrAssignedToPolicy(corpId, policyId);
    }

    @GetMapping("/me/claims")
    @PreAuthorize("hasRole('HR')")
    public List<Claim> getMyCorporateClaims(Authentication auth) {
        User user = corporateService.getUserByUsername(auth.getName());
        return claimRepository.findByEmployeeCorporateClientId(user.getCorporateClient().getId());
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public List<CorporateClient> getAllCorporateClients() {
        return corporateService.getAllCorporateClients();
    }

    @PutMapping("/{id}/suspend")
    @PreAuthorize("hasRole('ADMIN')")
    public CorporateClient suspendCorporateClient(@PathVariable("id") Long id) {
        return corporateService.suspendCorporateClient(id);
    }

    @PutMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public CorporateClient activateCorporateClient(@PathVariable("id") Long id) {
        return corporateService.activateCorporateClient(id);
    }
}



