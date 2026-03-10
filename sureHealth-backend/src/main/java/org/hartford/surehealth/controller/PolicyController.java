package org.hartford.surehealth.controller;

import lombok.RequiredArgsConstructor;
import org.hartford.surehealth.dto.PolicyRequestDTO;
import org.hartford.surehealth.dto.RiskBreakdownDTO;
import org.hartford.surehealth.dto.QuoteDTO;
import org.hartford.surehealth.entity.User;
import org.hartford.surehealth.repository.UserRepository;
import org.hartford.surehealth.entity.GroupPolicy;
import org.hartford.surehealth.entity.PolicyStatus;
import org.hartford.surehealth.repository.GroupPolicyRepository;
import org.hartford.surehealth.service.PolicyService;
import org.hartford.surehealth.service.PremiumCalculationService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/policy")
@RequiredArgsConstructor
public class PolicyController {

    private final PolicyService policyService;
    private final GroupPolicyRepository policyRepository;
    private final PremiumCalculationService premiumCalculationService;
    private final UserRepository userRepository;

    @PostMapping("/request")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public void request(@RequestBody PolicyRequestDTO dto){
        policyService.requestPolicy(dto);
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public List<GroupPolicy> getPendingPolicies() {
        return policyRepository.findByStatus(PolicyStatus.PENDING_ADMIN_APPROVAL);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public GroupPolicy getPolicyById(@PathVariable Long id) {
        return policyRepository.findById(id).orElseThrow();
    }

    @PutMapping("/approve/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void approve(@PathVariable Long id){
        policyService.approvePolicy(id);
    }

    @PutMapping("/reject/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void reject(@PathVariable Long id){
        policyService.rejectPolicy(id);
    }

    @GetMapping("/{id}/risk-analysis")
    @PreAuthorize("hasRole('ADMIN')")
    public RiskBreakdownDTO getRiskAnalysis(@PathVariable Long id) {
        return premiumCalculationService.calculateRiskBreakdown(id);
    }

    @GetMapping("/quote")
    @PreAuthorize("hasRole('HR')")
    public QuoteDTO getQuote(
            @RequestParam Long planId,
            @RequestParam(required = false) List<Long> employeeIds,
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        return premiumCalculationService.calculateQuote(user.getCorporateClient().getId(), planId, employeeIds);
    }

    @GetMapping("/underwriter/queue")
    @PreAuthorize("hasRole('UNDERWRITER')")
    public List<GroupPolicy> getUnderwriterQueue(
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        return policyRepository.findByAssignedUnderwriterIdAndStatus(user.getId(), PolicyStatus.PENDING_UNDERWRITER_REVIEW);
    }

    @PutMapping("/{id}/underwrite")
    @PreAuthorize("hasRole('UNDERWRITER')")
    public void underwritePolicy(@PathVariable Long id) {
        policyService.approveUnderwriterPolicy(id);
    }
}


