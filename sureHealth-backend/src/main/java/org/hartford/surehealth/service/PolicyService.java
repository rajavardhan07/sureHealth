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
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class PolicyService {

    private final GroupPolicyRepository policyRepository;
    private final CorporateRepository corporateRepository;
    private final InsurancePlanRepository planRepository;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final PremiumCalculationService premiumCalculationService;

    public void requestPolicy(PolicyRequestDTO dto){

        CorporateClient corp = corporateRepository.findById(dto.corporateId)
            .orElseThrow(() -> new ResourceNotFoundException("Corporate client not found with ID: " + dto.corporateId));
        InsurancePlan plan = planRepository.findById(dto.planId)
            .orElseThrow(() -> new ResourceNotFoundException("Insurance plan not found with ID: " + dto.planId));

        // Find all underwriters and pick one randomly
        List<User> underwriters = userRepository.findByRole(Role.UNDERWRITER);
        if (underwriters.isEmpty()) {
            throw new ResourceNotFoundException("No underwriters available in the system");
        }
        User randomUnderwriter = underwriters.get(new Random().nextInt(underwriters.size()));

        GroupPolicy policy = new GroupPolicy();
        policy.setCorporateClient(corp);
        policy.setInsurancePlan(plan);
        policy.setPolicyNumber("POL-" + System.currentTimeMillis());
        policy.setStatus(PolicyStatus.PENDING_UNDERWRITER_REVIEW);
        policy.setAssignedUnderwriter(randomUnderwriter);

        policy = policyRepository.save(policy);
        
        // Link employees to this policy
        if (dto.employeeIds != null && !dto.employeeIds.isEmpty()) {
            List<Employee> selectedEmployees = employeeRepository.findAllById(dto.employeeIds);
            for (Employee emp : selectedEmployees) {
                emp.setGroupPolicy(policy);
            }
            employeeRepository.saveAll(selectedEmployees);
        }
    }

    public void approvePolicy(Long policyId){
        GroupPolicy policy = policyRepository.findById(policyId)
            .orElseThrow(() -> new ResourceNotFoundException("Policy not found with ID: " + policyId));
        policy.setStatus(PolicyStatus.APPROVED);
        policy.setStartDate(LocalDate.now());
        policy.setEndDate(LocalDate.now().plusYears(1));
        policy.setNextBillingDate(LocalDate.now().plusMonths(1));
        policyRepository.save(policy);

        // Compute risk multipliers and store premium
        premiumCalculationService.calculateAndSavePremium(policyId);
    }

    public void rejectPolicy(Long policyId){
        GroupPolicy policy = policyRepository.findById(policyId)
            .orElseThrow(() -> new ResourceNotFoundException("Policy not found with ID: " + policyId));
        policy.setStatus(PolicyStatus.REJECTED);
        policyRepository.save(policy);
    }

    public void approveUnderwriterPolicy(Long policyId) {
        GroupPolicy policy = policyRepository.findById(policyId)
            .orElseThrow(() -> new ResourceNotFoundException("Policy not found with ID: " + policyId));
        policy.setStatus(PolicyStatus.APPROVED);
        policy.setStartDate(LocalDate.now());
        policy.setEndDate(LocalDate.now().plusYears(1));
        policy.setNextBillingDate(LocalDate.now().plusMonths(1));
        policyRepository.save(policy);

        premiumCalculationService.calculateAndSavePremium(policyId);
        
        // Also update all employee's remaining coverage
        List<Employee> employees = employeeRepository.findByGroupPolicyId(policyId);
        for(Employee emp : employees) {
            emp.setCoverageAmount(policy.getInsurancePlan().getCoverageAmount());
            emp.setRemainingCoverage(policy.getInsurancePlan().getCoverageAmount());
        }
        employeeRepository.saveAll(employees);
    }

    public void suspendPolicy(Long policyId) {
        GroupPolicy policy = policyRepository.findById(policyId)
            .orElseThrow(() -> new ResourceNotFoundException("Policy not found with ID: " + policyId));
        policy.setStatus(PolicyStatus.SUSPENDED);
        policyRepository.save(policy);
    }
}


