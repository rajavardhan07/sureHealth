package org.hartford.surehealth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hartford.surehealth.dto.RiskBreakdownDTO;
import org.hartford.surehealth.entity.CorporateClient;
import org.hartford.surehealth.entity.Employee;
import org.hartford.surehealth.entity.GroupPolicy;
import org.hartford.surehealth.entity.PremiumInvoice;
import org.hartford.surehealth.repository.ClaimRepository;
import org.hartford.surehealth.repository.EmployeeRepository;
import org.hartford.surehealth.repository.GroupPolicyRepository;
import org.hartford.surehealth.repository.PremiumInvoiceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import org.hartford.surehealth.entity.InsurancePlan;
import org.hartford.surehealth.repository.InsurancePlanRepository;
import org.hartford.surehealth.repository.CorporateRepository;
import org.hartford.surehealth.dto.QuoteDTO;

@Slf4j
@Service
@RequiredArgsConstructor
public class PremiumCalculationService {

    private final GroupPolicyRepository policyRepository;
    private final EmployeeRepository employeeRepository;
    private final ClaimRepository claimRepository;
    private final PremiumInvoiceRepository invoiceRepository;
    private final InsurancePlanRepository planRepository;
    private final CorporateRepository corporateRepository;

    public RiskBreakdownDTO calculateRiskBreakdown(Long policyId) {
        GroupPolicy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new RuntimeException("Policy not found"));

        CorporateClient corporate = policy.getCorporateClient();
        List<Employee> employees = employeeRepository.findByCorporateClientId(corporate.getId());

        BigDecimal ageFactor = calculateAgeFactor(employees);
        BigDecimal industryFactor = calculateIndustryFactor(corporate.getIndustryType());
        BigDecimal claimHistoryFactor = calculateClaimHistoryFactor(corporate.getId());
        BigDecimal coverageFactor = calculateCoverageFactor(policy.getInsurancePlan().getCoverageAmount());
        
        int employeeCount = employees.isEmpty() && corporate.getNumberOfEmployees() != null 
                            ? corporate.getNumberOfEmployees() : employees.size();
        BigDecimal groupSizeFactor = calculateGroupSizeFactor(employeeCount);

        BigDecimal finalMultiplier = BigDecimal.ONE
                .multiply(ageFactor)
                .multiply(industryFactor)
                .multiply(claimHistoryFactor)
                .multiply(coverageFactor)
                .multiply(groupSizeFactor)
                .setScale(2, RoundingMode.HALF_UP);

        return RiskBreakdownDTO.builder()
                .ageFactor(ageFactor)
                .industryFactor(industryFactor)
                .claimHistoryFactor(claimHistoryFactor)
                .coverageFactor(coverageFactor)
                .groupSizeFactor(groupSizeFactor)
                .finalMultiplier(finalMultiplier)
                .build();
    }

    @Transactional
    public void calculateAndSavePremium(Long policyId) {
        GroupPolicy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new RuntimeException("Policy not found"));

        long activeEmployeeCount = employeeRepository.countByCorporateClientId(policy.getCorporateClient().getId());
        BigDecimal premiumPerEmployee = policy.getInsurancePlan().getPremiumPerEmployee();
        BigDecimal basePremium = premiumPerEmployee.multiply(BigDecimal.valueOf(activeEmployeeCount));

        RiskBreakdownDTO breakdown = calculateRiskBreakdown(policyId);
        BigDecimal finalMultiplier = breakdown.getFinalMultiplier();
        BigDecimal finalPremium = basePremium.multiply(finalMultiplier).setScale(2, RoundingMode.HALF_UP);

        policy.setBasePremium(basePremium);
        policy.setRiskMultiplier(finalMultiplier);
        policy.setCalculatedPremium(finalPremium);

        policyRepository.save(policy);
        log.info("Calculated premium for policyId: {} | Base: {} | Multiplier: {} | Final: {}",
                policyId, basePremium, finalMultiplier, finalPremium);
    }

    public QuoteDTO calculateQuote(Long corporateId, Long planId, List<Long> employeeIds) {
        CorporateClient corporate = corporateRepository.findById(corporateId)
                .orElseThrow(() -> new RuntimeException("Could not fetch corporate info for quote"));
        
        InsurancePlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found"));

        List<Employee> employees;
        if (employeeIds != null && !employeeIds.isEmpty()) {
            employees = employeeRepository.findAllById(employeeIds);
            // Optionally verify they belong to the corporate
        } else {
            employees = employeeRepository.findByCorporateClientId(corporate.getId());
        }

        BigDecimal ageFactor = calculateAgeFactor(employees);
        BigDecimal industryFactor = calculateIndustryFactor(corporate.getIndustryType());
        BigDecimal claimHistoryFactor = calculateClaimHistoryFactor(corporate.getId());
        BigDecimal coverageFactor = calculateCoverageFactor(plan.getCoverageAmount());
        
        int employeeCount = employees.isEmpty() && corporate.getNumberOfEmployees() != null 
                            ? corporate.getNumberOfEmployees() : employees.size();
        BigDecimal groupSizeFactor = calculateGroupSizeFactor(employeeCount);

        BigDecimal finalMultiplier = BigDecimal.ONE
                .multiply(ageFactor)
                .multiply(industryFactor)
                .multiply(claimHistoryFactor)
                .multiply(coverageFactor)
                .multiply(groupSizeFactor)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal basePremiumPerEmployee = plan.getPremiumPerEmployee();
        BigDecimal finalPremiumPerEmployee = basePremiumPerEmployee.multiply(finalMultiplier).setScale(2, RoundingMode.HALF_UP);

        RiskBreakdownDTO breakdown = RiskBreakdownDTO.builder()
                .ageFactor(ageFactor)
                .industryFactor(industryFactor)
                .claimHistoryFactor(claimHistoryFactor)
                .coverageFactor(coverageFactor)
                .groupSizeFactor(groupSizeFactor)
                .finalMultiplier(finalMultiplier)
                .build();

        return QuoteDTO.builder()
                .basePremiumPerEmployee(basePremiumPerEmployee)
                .riskMultiplier(finalMultiplier)
                .calculatedPremiumPerEmployee(finalPremiumPerEmployee)
                .riskBreakdown(breakdown)
                .build();
    }

    private BigDecimal calculateAgeFactor(List<Employee> employees) {
        if (employees == null || employees.isEmpty()) {
            return BigDecimal.valueOf(1.0); // Default if no employees
        }

        LocalDate now = LocalDate.now();
        int totalAge = 0;
        int count = 0;

        for (Employee emp : employees) {
            if (emp.getDateOfBirth() != null) {
                totalAge += Period.between(emp.getDateOfBirth(), now).getYears();
                count++;
            }
        }

        if (count == 0) return BigDecimal.valueOf(1.0);

        double averageAge = (double) totalAge / count;

        if (averageAge == 0) return BigDecimal.valueOf(1.0); // Default if unknown

        if (averageAge < 25) return BigDecimal.valueOf(1.0);
        if (averageAge >= 25 && averageAge < 30) return BigDecimal.valueOf(1.05);
        if (averageAge >= 30 && averageAge < 35) return BigDecimal.valueOf(1.10);
        if (averageAge >= 35 && averageAge < 40) return BigDecimal.valueOf(1.20);
        if (averageAge >= 40 && averageAge < 45) return BigDecimal.valueOf(1.35);
        return BigDecimal.valueOf(1.50); // >= 45
    }

    private BigDecimal calculateIndustryFactor(String industryType) {
        if (industryType == null) return BigDecimal.valueOf(1.0);

        return switch (industryType.toUpperCase()) {
            case "IT" -> BigDecimal.valueOf(1.0);
            case "BANKING" -> BigDecimal.valueOf(1.1);
            case "MANUFACTURING" -> BigDecimal.valueOf(1.3);
            case "CONSTRUCTION" -> BigDecimal.valueOf(1.6);
            case "MINING" -> BigDecimal.valueOf(2.0);
            default -> BigDecimal.valueOf(1.0); // Default if unknown
        };
    }

    private BigDecimal calculateClaimHistoryFactor(Long corporateId) {
        // Find sum of approved claim amounts for the corporate
        List<GroupPolicy> corpPolicies = policyRepository.findByCorporateClientId(corporateId);
        if (corpPolicies.isEmpty()) {
            return BigDecimal.valueOf(1.0);
        }

        // To calculate total claims paid: we can sum by looking up Claims or iterating policies
        BigDecimal totalClaimsPaid = BigDecimal.ZERO;
        
        // Summing all approved claims from employees of this corporate? 
        // According to requirements: Loss Ratio = Total Claims Paid / Total Premium Collected
        // For simplicity, we can fetch all claims linked to policies of this corporate
        // Wait, Claim entity has groupPolicy property
        // Let's iterate all invoice for total collected premium, and all claims for total paid
        BigDecimal totalPremiumCollected = BigDecimal.ZERO;

        for (GroupPolicy pol : corpPolicies) {
            List<PremiumInvoice> invoices = invoiceRepository.findByGroupPolicyId(pol.getId());
            for (PremiumInvoice inv : invoices) {
                if ("PAID".equals(inv.getStatus().name())) {
                    totalPremiumCollected = totalPremiumCollected.add(inv.getTotalAmount());
                }
            }

            // Since ClaimRepository doesn't have findByGroupPolicyId directly exposed in our view, 
            // but we can look it up. Alternatively, since Claim has `approvedAmount`
            // Let's assume pol.getClaims() works if mapped correctly. Since it's @OneToMany with LAZY, it might need @Transactional but we are inside service.
            // Better to use repository query. I'll iterate policies.claims since this is standard JPA.
            if (pol.getClaims() != null) {
                for (var claim : pol.getClaims()) {
                    if ("APPROVED".equals(claim.getStatus().name()) && claim.getApprovedAmount() != null) {
                        totalClaimsPaid = totalClaimsPaid.add(claim.getApprovedAmount());
                    }
                }
            }
        }

        if (totalPremiumCollected.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.valueOf(1.0); // No premiums collected yet, neutral risk
        }

        BigDecimal lossRatio = totalClaimsPaid.divide(totalPremiumCollected, 4, RoundingMode.HALF_UP);
        double ratio = lossRatio.doubleValue();

        if (ratio < 0.50) return BigDecimal.valueOf(0.9);
        if (ratio >= 0.50 && ratio <= 0.80) return BigDecimal.valueOf(1.0);
        if (ratio > 0.80 && ratio <= 1.00) return BigDecimal.valueOf(1.3);
        return BigDecimal.valueOf(1.6);
    }

    private BigDecimal calculateCoverageFactor(BigDecimal coverageAmount) {
        if (coverageAmount == null) return BigDecimal.valueOf(1.0);

        long amount = coverageAmount.longValue();

        if (amount <= 300_000) return BigDecimal.valueOf(1.0); // <= 3L
        if (amount <= 500_000) return BigDecimal.valueOf(1.3); // 5L
        if (amount <= 1_000_000) return BigDecimal.valueOf(1.7); // 10L
        return BigDecimal.valueOf(2.2); // > 10L
    }

    private BigDecimal calculateGroupSizeFactor(int employeeCount) {
        if (employeeCount < 50) return BigDecimal.valueOf(1.2);
        if (employeeCount >= 50 && employeeCount < 100) return BigDecimal.valueOf(1.0);
        if (employeeCount >= 100 && employeeCount < 500) return BigDecimal.valueOf(0.9);
        return BigDecimal.valueOf(0.85); // >= 500
    }
}
