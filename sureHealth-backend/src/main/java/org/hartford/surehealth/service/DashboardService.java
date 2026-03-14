package org.hartford.surehealth.service;

import lombok.RequiredArgsConstructor;
import org.hartford.surehealth.dto.AdminDashboardDTO;
import org.hartford.surehealth.dto.ClaimsOfficerDashboardDTO;
import org.hartford.surehealth.enums.ClaimStatus;
import org.hartford.surehealth.enums.PolicyStatus;
import org.hartford.surehealth.enums.Role;
import org.hartford.surehealth.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

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

    public ClaimsOfficerDashboardDTO getClaimsOfficerDashboard() {
        long totalClaims = claimRepository.count();
        long pendingClaims = claimRepository.countByStatus(ClaimStatus.SUBMITTED);
        long approvedToday = claimRepository.countByStatusAndReviewDate(ClaimStatus.APPROVED, LocalDate.now());
        long rejectedToday = claimRepository.countByStatusAndReviewDate(ClaimStatus.REJECTED, LocalDate.now());

        return new ClaimsOfficerDashboardDTO(totalClaims, pendingClaims, approvedToday, rejectedToday);
    }

    public AdminDashboardDTO getAdminDashboardStats() {
        long totalClients = corporateRepository.count();
        long totalUnderwriters = userRepository.findByRole(Role.UNDERWRITER).size();
        long totalClaimsOfficers = userRepository.findByRole(Role.CLAIMS_OFFICER).size();
        long totalPlans = planRepository.count();
        long activePolicies = policyRepository.countByStatus(PolicyStatus.APPROVED);
        long totalEmployees = employeeRepository.count();
        long pendingClaims = claimRepository.countByStatus(ClaimStatus.SUBMITTED);

        return new AdminDashboardDTO(
                totalClients,
                totalUnderwriters,
                totalClaimsOfficers,
                totalPlans,
                activePolicies,
                totalEmployees,
                pendingClaims
        );
    }
}

