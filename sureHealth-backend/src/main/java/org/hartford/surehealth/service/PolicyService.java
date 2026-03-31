package org.hartford.surehealth.service;

import lombok.RequiredArgsConstructor;
import org.hartford.surehealth.dto.PolicyRequestDTO;
import org.hartford.surehealth.entity.CorporateClient;
import org.hartford.surehealth.entity.GroupPolicy;
import org.hartford.surehealth.entity.InsurancePlan;
import org.hartford.surehealth.enums.PolicyStatus;
import org.hartford.surehealth.exceptions.ResourceNotFoundException;
import org.hartford.surehealth.repository.CorporateRepository;
import org.hartford.surehealth.repository.GroupPolicyRepository;
import org.hartford.surehealth.repository.InsurancePlanRepository;
import org.hartford.surehealth.repository.UserRepository;
import org.hartford.surehealth.repository.EmployeeRepository;
import org.hartford.surehealth.entity.User;
import org.hartford.surehealth.entity.Employee;
import org.hartford.surehealth.enums.Role;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PolicyService {

    private final GroupPolicyRepository policyRepository;
    private final CorporateRepository corporateRepository;
    private final InsurancePlanRepository planRepository;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final PremiumCalculationService premiumCalculationService;
    private final NotificationService notificationService;
    private final org.hartford.surehealth.repository.PremiumInvoiceRepository premiumInvoiceRepository;

    @org.springframework.transaction.annotation.Transactional
    public void assignUnderwriter(Long policyId, Long underwriterId) {
        GroupPolicy policy = policyRepository.findById(policyId)
            .orElseThrow(() -> new ResourceNotFoundException("Policy not found with ID: " + policyId));
        User underwriter = userRepository.findById(underwriterId)
            .orElseThrow(() -> new ResourceNotFoundException("Underwriter not found with ID: " + underwriterId));
        policy.setAssignedUnderwriter(underwriter);
        policyRepository.save(policy);
    }

    public void requestPolicy(PolicyRequestDTO dto){

        CorporateClient corp = corporateRepository.findById(dto.corporateId)
            .orElseThrow(() -> new ResourceNotFoundException("Corporate client not found with ID: " + dto.corporateId));
        InsurancePlan plan = planRepository.findById(dto.planId)
            .orElseThrow(() -> new ResourceNotFoundException("Insurance plan not found with ID: " + dto.planId));

        // Assign to underwriter: reuse existing assigned underwriter or assign new one with least load
        User assignedUnderwriter = corp.getAssignedUnderwriter();
        if (assignedUnderwriter == null) {
            List<User> underwriters = userRepository.findByRole(Role.UNDERWRITER);
            if (underwriters.isEmpty()) {
                throw new ResourceNotFoundException("No underwriters available in the system");
            }
            assignedUnderwriter = underwriters.stream()
                .min(java.util.Comparator.comparingLong(u -> policyRepository.countByAssignedUnderwriterId(u.getId())))
                .orElseThrow(() -> new ResourceNotFoundException("No underwriters available in the system"));
            
            corp.setAssignedUnderwriter(assignedUnderwriter);
            corporateRepository.save(corp);
        }

        GroupPolicy policy = new GroupPolicy();
        policy.setCorporateClient(corp);
        policy.setInsurancePlan(plan);
        policy.setCreatedAt(LocalDateTime.now());
        policy.setWaitingPeriodDays(plan.getWaitingPeriodDays() != null ? plan.getWaitingPeriodDays() : 0);
        policy.setPolicyNumber("POL-" + System.currentTimeMillis());
        policy.setStatus(PolicyStatus.PENDING_UNDERWRITER_REVIEW);
        policy.setAssignedUnderwriter(assignedUnderwriter);

        policy = policyRepository.save(policy);
        
        // Link employees to this policy
        if (dto.employeeIds != null && !dto.employeeIds.isEmpty()) {
            List<Employee> selectedEmployees = employeeRepository.findAllById(dto.employeeIds);
            for (Employee emp : selectedEmployees) {
                emp.setGroupPolicy(policy);
            }
            employeeRepository.saveAll(selectedEmployees);
        }

        // Notify Underwriter
        notificationService.createNotification(
            assignedUnderwriter,
            "New policy request " + policy.getPolicyNumber() + " from " + corp.getCompanyName() + " requires review.",
            org.hartford.surehealth.enums.NotificationType.INFO
        );
    }

    public void approvePolicy(Long policyId){
        GroupPolicy policy = policyRepository.findById(policyId)
            .orElseThrow(() -> new ResourceNotFoundException("Policy not found with ID: " + policyId));
        policy.setStatus(PolicyStatus.APPROVED);
        policy.setStartDate(LocalDate.now());
        policy.setEndDate(LocalDate.now().plusYears(1));
        policy.setNextBillingDate(LocalDate.now().plusMonths(3));
        policyRepository.save(policy);

        // Compute risk multipliers and store premium
        premiumCalculationService.calculateAndSavePremium(policyId);
    }

    public void rejectPolicy(Long policyId){
        GroupPolicy policy = policyRepository.findById(policyId)
            .orElseThrow(() -> new ResourceNotFoundException("Policy not found with ID: " + policyId));
        policy.setStatus(PolicyStatus.REJECTED);
        policyRepository.save(policy);

        // Notify HR (Corporate Client)
        userRepository.findByCorporateClient(policy.getCorporateClient()).forEach(user -> {
            notificationService.createNotification(
                user,
                "Your policy request " + policy.getPolicyNumber() + " has been REJECTED.",
                org.hartford.surehealth.enums.NotificationType.ALERT
            );
        });
    }

    public void approveUnderwriterPolicy(Long policyId) {
        GroupPolicy policy = policyRepository.findById(policyId)
            .orElseThrow(() -> new ResourceNotFoundException("Policy not found with ID: " + policyId));
        policy.setStatus(PolicyStatus.APPROVED);
        policy.setStartDate(LocalDate.now());
        policy.setEndDate(LocalDate.now().plusYears(1));
        policy.setNextBillingDate(LocalDate.now().plusMonths(3));
        policyRepository.save(policy);

        premiumCalculationService.calculateAndSavePremium(policyId);
        
        List<Employee> employees = employeeRepository.findByGroupPolicyId(policyId);
        for(Employee emp : employees) {
            emp.setCoverageAmount(policy.getInsurancePlan().getCoverageAmount());
            emp.setRemainingCoverage(policy.getInsurancePlan().getCoverageAmount());
        }
        employeeRepository.saveAll(employees);

        // Notify HR (Corporate Client)
        userRepository.findByCorporateClient(policy.getCorporateClient()).forEach(user -> {
            notificationService.createNotification(
                user,
                "Your policy request " + policy.getPolicyNumber() + " has been APPROVED.",
                org.hartford.surehealth.enums.NotificationType.SUCCESS
            );
        });
    }

    @org.springframework.transaction.annotation.Transactional
    public void sendQuote(Long policyId, java.math.BigDecimal customPremium) {
        GroupPolicy policy = policyRepository.findById(policyId)
            .orElseThrow(() -> new ResourceNotFoundException("Policy not found with ID: " + policyId));
            
        policy.setCustomPremiumPerEmployee(customPremium);
        
        // Use the policy's existing waiting period (already defaults to 0 if not set)
        
        // Calculate based on employees assigned to this policy
        List<Employee> policyEmployees = employeeRepository.findByGroupPolicyId(policyId);
        long employeeCount = policyEmployees.size();
        java.math.BigDecimal basePremium = customPremium.multiply(java.math.BigDecimal.valueOf(employeeCount));
        
        org.hartford.surehealth.dto.RiskBreakdownDTO breakdown = premiumCalculationService.calculateRiskBreakdown(policyId);
        java.math.BigDecimal finalMultiplier = (breakdown != null && breakdown.getFinalMultiplier() != null) ? breakdown.getFinalMultiplier() : java.math.BigDecimal.ONE;
        java.math.BigDecimal finalPremium = basePremium.multiply(finalMultiplier).setScale(2, java.math.RoundingMode.HALF_UP);
        
        policy.setBasePremium(basePremium);
        policy.setRiskMultiplier(finalMultiplier);
        policy.setCalculatedPremium(finalPremium);
        policy.setStatus(PolicyStatus.PENDING_HR_APPROVAL);
        
        policyRepository.save(policy);
        
        // Generate an Invoice for this HR to pay
        org.hartford.surehealth.entity.PremiumInvoice invoice = new org.hartford.surehealth.entity.PremiumInvoice();
        invoice.setInvoiceNumber("INV-" + System.currentTimeMillis());
        invoice.setIssueDate(LocalDate.now());
        invoice.setDueDate(LocalDate.now().plusDays(15));
        invoice.setTotalAmount(finalPremium);
        invoice.setStatus(org.hartford.surehealth.enums.InvoiceStatus.UNPAID);
        invoice.setGroupPolicy(policy);
        
        premiumInvoiceRepository.save(invoice);
    }

    @org.springframework.transaction.annotation.Transactional
    public void raiseIssue(Long policyId, String reason) {
        GroupPolicy policy = policyRepository.findById(policyId)
            .orElseThrow(() -> new ResourceNotFoundException("Policy not found with ID: " + policyId));
        policy.setStatus(PolicyStatus.INFO_REQUIRED);
        policy.setUnderwriterComment(reason);
        policyRepository.save(policy);

        userRepository.findByCorporateClient(policy.getCorporateClient()).forEach(user -> {
            notificationService.createNotification(
                user,
                "Underwriter has raised issues regarding policy " + policy.getPolicyNumber() + ". Reason: " + reason,
                org.hartford.surehealth.enums.NotificationType.ALERT
            );
        });
    }

    @org.springframework.transaction.annotation.Transactional
    public void resubmitPolicy(Long policyId, PolicyRequestDTO dto) {
        GroupPolicy policy = policyRepository.findById(policyId)
            .orElseThrow(() -> new ResourceNotFoundException("Policy not found with ID: " + policyId));
        
        // Update Plan if changed
        if (!policy.getInsurancePlan().getId().equals(dto.planId)) {
            InsurancePlan newPlan = planRepository.findById(dto.planId)
                .orElseThrow(() -> new ResourceNotFoundException("Insurance plan not found with ID: " + dto.planId));
            policy.setInsurancePlan(newPlan);
            policy.setWaitingPeriodDays(newPlan.getWaitingPeriodDays() != null ? newPlan.getWaitingPeriodDays() : 0);
        }

        // Update Employees
        // 1. Clear current assignments
        List<Employee> currentEmployees = employeeRepository.findByGroupPolicyId(policyId);
        for (Employee emp : currentEmployees) {
            emp.setGroupPolicy(null);
        }
        employeeRepository.saveAll(currentEmployees);

        // 2. Assign new selection
        if (dto.employeeIds != null && !dto.employeeIds.isEmpty()) {
            List<Employee> newEmployees = employeeRepository.findAllById(dto.employeeIds);
            for (Employee emp : newEmployees) {
                emp.setGroupPolicy(policy);
            }
            employeeRepository.saveAll(newEmployees);
        }

        // Reset status and clear comment
        policy.setStatus(PolicyStatus.PENDING_UNDERWRITER_REVIEW);
        policy.setUnderwriterComment(null);
        policyRepository.save(policy);

        // Notify Underwriter
        notificationService.createNotification(
            policy.getAssignedUnderwriter(),
            "Policy request " + policy.getPolicyNumber() + " has been resubmitted by HR.",
            org.hartford.surehealth.enums.NotificationType.INFO
        );
    }

    public void suspendPolicy(Long policyId) {
        GroupPolicy policy = policyRepository.findById(policyId)
            .orElseThrow(() -> new ResourceNotFoundException("Policy not found with ID: " + policyId));
        policy.setStatus(PolicyStatus.SUSPENDED);
        policyRepository.save(policy);
    }
    
    @org.springframework.transaction.annotation.Transactional
    public GroupPolicy updatePolicy(Long policyId, org.hartford.surehealth.dto.PolicyUpdateDTO dto) {
        GroupPolicy policy = policyRepository.findById(policyId)
            .orElseThrow(() -> new ResourceNotFoundException("Policy not found with ID: " + policyId));
            
        if (dto.getStatus() != null) policy.setStatus(dto.getStatus());
        if (dto.getBillingCycle() != null) policy.setBillingCycle(dto.getBillingCycle());
        if (dto.getBasePremium() != null) policy.setBasePremium(dto.getBasePremium());
        if (dto.getCustomPremiumPerEmployee() != null) policy.setCustomPremiumPerEmployee(dto.getCustomPremiumPerEmployee());
        if (dto.getWaitingPeriodDays() != null) policy.setWaitingPeriodDays(dto.getWaitingPeriodDays());
        if (dto.getStartDate() != null) policy.setStartDate(dto.getStartDate());
        if (dto.getEndDate() != null) policy.setEndDate(dto.getEndDate());
        
        return policyRepository.save(policy);
    }
}


