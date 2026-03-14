package org.hartford.surehealth.service;

import org.hartford.surehealth.dto.PolicyRequestDTO;
import org.hartford.surehealth.entity.CorporateClient;
import org.hartford.surehealth.entity.GroupPolicy;
import org.hartford.surehealth.entity.InsurancePlan;
import org.hartford.surehealth.entity.User;
import org.hartford.surehealth.enums.PolicyStatus;
import org.hartford.surehealth.enums.Role;
import org.hartford.surehealth.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PolicyServiceTest {

    @Mock
    private GroupPolicyRepository policyRepository;
    @Mock
    private CorporateRepository corporateRepository;
    @Mock
    private InsurancePlanRepository planRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private EmployeeRepository employeeRepository;
    @Mock
    private PremiumCalculationService premiumCalculationService;

    @InjectMocks
    private PolicyService policyService;

    private CorporateClient corporateClient;
    private InsurancePlan plan;
    private User underwriter;
    private GroupPolicy policy;

    @BeforeEach
    void setUp() {
        corporateClient = new CorporateClient();
        corporateClient.setId(1L);

        plan = new InsurancePlan();
        plan.setId(1L);

        underwriter = new User();
        underwriter.setId(3L);
        underwriter.setRole(Role.UNDERWRITER);

        policy = new GroupPolicy();
        policy.setId(1L);
        policy.setStatus(PolicyStatus.PENDING_UNDERWRITER_REVIEW);
    }

    @Test
    void requestPolicy_Success() {
        PolicyRequestDTO dto = new PolicyRequestDTO();
        dto.corporateId = 1L;
        dto.planId = 1L;

        when(corporateRepository.findById(1L)).thenReturn(Optional.of(corporateClient));
        when(planRepository.findById(1L)).thenReturn(Optional.of(plan));
        when(userRepository.findByRole(Role.UNDERWRITER)).thenReturn(Collections.singletonList(underwriter));

        policyService.requestPolicy(dto);

        verify(policyRepository).save(any(GroupPolicy.class));
    }

    @Test
    void approvePolicy_Success() {
        when(policyRepository.findById(1L)).thenReturn(Optional.of(policy));

        policyService.approvePolicy(1L);

        assertEquals(PolicyStatus.APPROVED, policy.getStatus());
        verify(policyRepository).save(policy);
        verify(premiumCalculationService).calculateAndSavePremium(1L);
    }
}
