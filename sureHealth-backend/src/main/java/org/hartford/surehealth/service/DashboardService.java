package org.hartford.surehealth.service;

import lombok.RequiredArgsConstructor;
import org.hartford.surehealth.dto.AdminDashboardDTO;
import org.hartford.surehealth.dto.ClaimsOfficerDashboardDTO;
import org.hartford.surehealth.enums.ClaimStatus;
import org.hartford.surehealth.enums.PolicyStatus;
import org.hartford.surehealth.enums.Role;
import org.hartford.surehealth.repository.*;
import org.hartford.surehealth.entity.Claim;
import org.hartford.surehealth.entity.User;
import org.hartford.surehealth.exceptions.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.Duration;
import java.util.List;

@Service
@RequiredArgsConstructor
// The @RequiredArgsConstructor annotation from Lombok generates a constructor with parameters for all final fields.
public class DashboardService {

    private final ClaimRepository claimRepository;
    private final UserRepository userRepository;
    private final CorporateRepository corporateRepository;
    private final InsurancePlanRepository planRepository;
    private final GroupPolicyRepository policyRepository;
    private final EmployeeRepository employeeRepository;
    private final PremiumInvoiceRepository premiumInvoiceRepository;

    public ClaimsOfficerDashboardDTO getClaimsOfficerDashboard(String username) {
        User officer = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        long totalClaims = claimRepository.countByAssignedOfficerId(officer.getId());
        long pendingClaims = claimRepository.countByAssignedOfficerIdAndStatus(officer.getId(), ClaimStatus.SUBMITTED);
        
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        
        long approvedToday = claimRepository.countByAssignedOfficerIdAndStatusAndReviewDate(
                officer.getId(), ClaimStatus.APPROVED, startOfDay, endOfDay);
        long rejectedToday = claimRepository.countByAssignedOfficerIdAndStatusAndReviewDate(
                officer.getId(), ClaimStatus.REJECTED, startOfDay, endOfDay);

        long issuesRaised = claimRepository.countByAssignedOfficerIdAndStatus(officer.getId(), ClaimStatus.INFO_REQUIRED);
        
        List<Claim> approvedClaims = claimRepository.findByAssignedOfficerIdAndStatus(officer.getId(), ClaimStatus.APPROVED);
        long totalHours = 0;
        int count = 0;
        for (Claim c : approvedClaims) {
            if (c.getSubmissionDate() != null && c.getReviewDate() != null) {
                totalHours += Duration.between(c.getSubmissionDate(), c.getReviewDate()).toHours();
                count++;
            }
        }
        String averageProcessingTime = count > 0 ? (totalHours / count) + "h" : "N/A";

        return new ClaimsOfficerDashboardDTO(totalClaims, pendingClaims, approvedToday, rejectedToday, issuesRaised, averageProcessingTime);
    }

    public AdminDashboardDTO getAdminDashboardStats() {
        long totalClients = corporateRepository.count();
        long totalUnderwriters = userRepository.findByRole(Role.UNDERWRITER).size();
        long totalClaimsOfficers = userRepository.findByRole(Role.CLAIMS_OFFICER).size();
        long totalPlans = planRepository.count();
        long activePolicies = policyRepository.countByStatus(PolicyStatus.APPROVED);
        long totalEmployees = employeeRepository.count();
        long pendingClaims = claimRepository.countByStatus(ClaimStatus.SUBMITTED);

        java.math.BigDecimal totalRevenue = premiumInvoiceRepository.getTotalRevenue(org.hartford.surehealth.enums.InvoiceStatus.PAID);
        long totalClaims = claimRepository.count();

        java.util.Map<String, Long> claimsByStatus = new java.util.HashMap<>();
        for (ClaimStatus status : ClaimStatus.values()) {
            claimsByStatus.put(status.name(), claimRepository.countByStatus(status));
        }

        java.util.Map<String, Long> policiesByStatus = new java.util.HashMap<>();
        for (PolicyStatus status : PolicyStatus.values()) {
            policiesByStatus.put(status.name(), policyRepository.countByStatus(status));
        }

        return new AdminDashboardDTO(
                totalClients,
                totalUnderwriters,
                totalClaimsOfficers,
                totalPlans,
                activePolicies,
                totalEmployees,
                pendingClaims,
                totalRevenue,
                totalClaims,
                claimsByStatus,
                policiesByStatus
        );
    }

    public org.hartford.surehealth.dto.UnderwriterDashboardDTO getUnderwriterDashboard(String username) {
        User underwriter = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        
        long totalAssigned = policyRepository.countByAssignedUnderwriterId(underwriter.getId());
        long pendingReviews = policyRepository.countByAssignedUnderwriterIdAndStatus(underwriter.getId(), PolicyStatus.PENDING_UNDERWRITER_REVIEW);
        long approvedPolicies = policyRepository.countByAssignedUnderwriterIdAndStatus(underwriter.getId(), PolicyStatus.APPROVED);
        long issuesRaised = policyRepository.countByAssignedUnderwriterIdAndStatus(underwriter.getId(), PolicyStatus.INFO_REQUIRED);
        
        return new org.hartford.surehealth.dto.UnderwriterDashboardDTO(totalAssigned, pendingReviews, approvedPolicies, issuesRaised);
    }
}

