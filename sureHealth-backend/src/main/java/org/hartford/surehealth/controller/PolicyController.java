package org.hartford.surehealth.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.hartford.surehealth.dto.PolicyRequestDTO;
import org.hartford.surehealth.dto.RiskBreakdownDTO;
import org.hartford.surehealth.dto.QuoteDTO;
import org.hartford.surehealth.entity.User;
import org.hartford.surehealth.repository.UserRepository;
import org.hartford.surehealth.entity.GroupPolicy;
import org.hartford.surehealth.enums.PolicyStatus;
import org.hartford.surehealth.repository.GroupPolicyRepository;
import org.hartford.surehealth.service.PolicyService;
import org.hartford.surehealth.service.PremiumCalculationService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
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
    public void request(@Valid @RequestBody PolicyRequestDTO dto){
        policyService.requestPolicy(dto);
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public List<GroupPolicy> getPendingPolicies() {
        return policyRepository.findByStatus(PolicyStatus.PENDING_ADMIN_APPROVAL);
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public List<GroupPolicy> getAllPolicies() {
        return policyRepository.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public GroupPolicy getPolicyById(@PathVariable("id") Long id) {
        return policyRepository.findById(id).orElseThrow();
    }

    @PutMapping("/approve/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void approve(@PathVariable("id") Long id){
        policyService.approvePolicy(id);
    }

    @PutMapping("/reject/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void reject(@PathVariable("id") Long id){
        policyService.rejectPolicy(id);
    }

    @GetMapping("/{id}/risk-analysis")
    @PreAuthorize("hasRole('ADMIN')")
    public RiskBreakdownDTO getRiskAnalysis(@PathVariable("id") Long id) {
        return premiumCalculationService.calculateRiskBreakdown(id);
    }

    @GetMapping("/quote")
    @PreAuthorize("hasRole('HR')")
    public QuoteDTO getQuote(
            @RequestParam("planId") Long planId,
            @RequestParam(value = "employeeIds", required = false) List<Long> employeeIds,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        return premiumCalculationService.calculateQuote(user.getCorporateClient().getId(), planId, employeeIds);
    }

    @GetMapping("/underwriter/queue")
    @PreAuthorize("hasRole('UNDERWRITER')")
    public List<GroupPolicy> getUnderwriterQueue(
            @AuthenticationPrincipal UserDetails userDetails
            ) {
        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        return policyRepository.findByAssignedUnderwriterIdAndStatus(user.getId(), PolicyStatus.PENDING_UNDERWRITER_REVIEW);
    }

    @PutMapping("/{id}/underwrite")
    @PreAuthorize("hasRole('UNDERWRITER')")
    public void underwritePolicy(@PathVariable("id") Long id) {
        policyService.approveUnderwriterPolicy(id);
    }

    @PutMapping("/{id}/send-quote")
    @PreAuthorize("hasRole('UNDERWRITER')")
    public void sendQuote(@PathVariable("id") Long id, @RequestBody java.util.Map<String, Object> body) {
        try {
            java.math.BigDecimal customPremium = new java.math.BigDecimal(body.get("customPremiumPerEmployee").toString());
            policyService.sendQuote(id, customPremium);
        } catch (Exception e) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR, 
                "Error sending quote: " + e.getMessage(), e);
        }
    }

    @PutMapping("/{id}/raise-issue")
    @PreAuthorize("hasRole('UNDERWRITER')")
    public void raiseIssue(@PathVariable("id") Long id, @RequestBody java.util.Map<String, String> body) {
        policyService.raiseIssue(id, body.get("reason"));
    }

    @PutMapping("/{id}/resubmit")
    @PreAuthorize("hasRole('HR')")
    public void resubmit(@PathVariable("id") Long id, @Valid @RequestBody PolicyRequestDTO dto) {
        policyService.resubmitPolicy(id, dto);
    }

    @PutMapping("/{id}/suspend")
    @PreAuthorize("hasRole('ADMIN')")
    public void suspend(@PathVariable("id") Long id) {
        policyService.suspendPolicy(id);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public GroupPolicy updatePolicy(@PathVariable("id") Long id, @RequestBody org.hartford.surehealth.dto.PolicyUpdateDTO dto) {
        return policyService.updatePolicy(id, dto);
    }
}



