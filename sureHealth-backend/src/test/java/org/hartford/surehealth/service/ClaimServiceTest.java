package org.hartford.surehealth.service;

import org.hartford.surehealth.dto.ClaimApprovalDTO;
import org.hartford.surehealth.dto.ClaimCreateDTO;
import org.hartford.surehealth.entity.Claim;
import org.hartford.surehealth.entity.Employee;
import org.hartford.surehealth.entity.GroupPolicy;
import org.hartford.surehealth.entity.User;
import org.hartford.surehealth.enums.ClaimStatus;
import org.hartford.surehealth.enums.Role;
import org.hartford.surehealth.repository.ClaimRepository;
import org.hartford.surehealth.repository.EmployeeRepository;
import org.hartford.surehealth.repository.GroupPolicyRepository;
import org.hartford.surehealth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClaimServiceTest {

    @Mock
    private ClaimRepository claimRepository;
    @Mock
    private EmployeeRepository employeeRepository;
    @Mock
    private GroupPolicyRepository policyRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ClaimService claimService;

    private Employee employee;
    private GroupPolicy policy;
    private User officer;
    private Claim claim;

    @BeforeEach
    void setUp() {
        employee = new Employee();
        employee.setId(1L);
        employee.setJoinDate(LocalDate.now().minusYears(1));
        employee.setCoverageAmount(BigDecimal.valueOf(100000));
        employee.setRemainingCoverage(BigDecimal.valueOf(100000));

        policy = new GroupPolicy();
        policy.setId(1L);

        officer = new User();
        officer.setId(2L);
        officer.setRole(Role.CLAIMS_OFFICER);

        claim = new Claim();
        claim.setId(1L);
        claim.setStatus(ClaimStatus.SUBMITTED);
        claim.setEmployee(employee);
        claim.setBillAmount(BigDecimal.valueOf(5000));
    }

    @Test
    void fileClaim_Success() throws Exception {
        ClaimCreateDTO dto = new ClaimCreateDTO();
        dto.employeeId = 1L;
        dto.policyId = 1L;
        dto.billAmount = BigDecimal.valueOf(5000);

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(policyRepository.findById(1L)).thenReturn(Optional.of(policy));
        when(userRepository.findByRole(Role.CLAIMS_OFFICER)).thenReturn(Collections.singletonList(officer));
        when(claimRepository.save(any(Claim.class))).thenAnswer(i -> i.getArguments()[0]);

        Claim result = claimService.fileClaim(dto, null);

        assertNotNull(result);
        assertEquals(BigDecimal.valueOf(5000), result.getBillAmount());
        assertEquals(officer, result.getAssignedOfficer());
        verify(claimRepository).save(any(Claim.class));
    }

    @Test
    void approveClaim_Success() {
        claim.setStatus(ClaimStatus.UNDER_REVIEW);
        ClaimApprovalDTO dto = new ClaimApprovalDTO();
        dto.setApprovedAmount(BigDecimal.valueOf(2000));

        when(claimRepository.findById(1L)).thenReturn(Optional.of(claim));
        when(userRepository.findByUsername("officer")).thenReturn(Optional.of(officer));

        claimService.approveClaim(1L, dto, "officer");

        assertEquals(ClaimStatus.APPROVED, claim.getStatus());
        assertEquals(BigDecimal.valueOf(2000), claim.getApprovedAmount());
        assertEquals(BigDecimal.valueOf(98000), employee.getRemainingCoverage());
        verify(employeeRepository).save(employee);
        verify(claimRepository).save(claim);
    }
}
