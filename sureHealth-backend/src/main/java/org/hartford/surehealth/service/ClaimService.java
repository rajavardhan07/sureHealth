package org.hartford.surehealth.service;

import lombok.RequiredArgsConstructor;
import org.hartford.surehealth.dto.ClaimApprovalDTO;
import org.hartford.surehealth.dto.ClaimCreateDTO;
import org.hartford.surehealth.dto.ClaimRejectionDTO;
import org.hartford.surehealth.entity.*;
import org.hartford.surehealth.repository.ClaimRepository;
import org.hartford.surehealth.repository.EmployeeRepository;
import org.hartford.surehealth.repository.GroupPolicyRepository;
import org.hartford.surehealth.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class ClaimService {

    private final ClaimRepository claimRepository;
    private final EmployeeRepository employeeRepository;
    private final GroupPolicyRepository policyRepository;
    private final UserRepository userRepository;
    private final Random random = new Random();

    public Claim fileClaim(ClaimCreateDTO dto){

        Employee emp = employeeRepository.findById(dto.employeeId).orElseThrow();
        GroupPolicy policy = policyRepository.findById(dto.policyId).orElseThrow();

        // Randomly assign a claims officer
        List<User> officers = userRepository.findByRole(Role.CLAIMS_OFFICER);
        if (officers.isEmpty()) {
            throw new RuntimeException("No claims officers available");
        }
        User assignedOfficer = officers.get(random.nextInt(officers.size()));

        Claim claim = new Claim();
        claim.setClaimNumber("CLM-" + System.currentTimeMillis());
        claim.setBillAmount(dto.billAmount);
        claim.setHospitalName(dto.hospitalName);
        claim.setDiagnosis(dto.diagnosis);
        claim.setTreatmentDate(dto.treatmentDate);
        claim.setBillNumber(dto.billNumber);
        claim.setEmployee(emp);
        claim.setGroupPolicy(policy);
        claim.setAssignedOfficer(assignedOfficer);

        return claimRepository.save(claim);
    }

    @Transactional
    public void startReview(Long claimId, String username) {
        Claim claim = claimRepository.findById(claimId)
            .orElseThrow(() -> new RuntimeException("Claim not found"));
        
        if (claim.getStatus() != ClaimStatus.SUBMITTED) {
            throw new RuntimeException("Only SUBMITTED claims can be reviewed");
        }
        
        User reviewer = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        claim.setStatus(ClaimStatus.UNDER_REVIEW);
        claim.setReviewedBy(reviewer);
        claimRepository.save(claim);
    }

    @Transactional
    public void approveClaim(Long claimId, ClaimApprovalDTO dto, String username) {
        Claim claim = claimRepository.findById(claimId)
            .orElseThrow(() -> new RuntimeException("Claim not found"));
        
        if (claim.getStatus() != ClaimStatus.UNDER_REVIEW) {
            throw new RuntimeException("Only claims UNDER_REVIEW can be approved");
        }
        
        Employee emp = claim.getEmployee();
        BigDecimal approvedAmount = dto.getApprovedAmount();
        
        // Calculate max claimable based on tenure
        long monthsWorked = ChronoUnit.MONTHS.between(emp.getJoinDate(), LocalDate.now());
        BigDecimal maxClaimable;
        
        if (monthsWorked < 3) {
            maxClaimable = emp.getCoverageAmount().multiply(BigDecimal.valueOf(0.25));
        } else if (monthsWorked < 6) {
            maxClaimable = emp.getCoverageAmount().multiply(BigDecimal.valueOf(0.50));
        } else if (monthsWorked < 12) {
            maxClaimable = emp.getCoverageAmount().multiply(BigDecimal.valueOf(0.75));
        } else {
            maxClaimable = emp.getCoverageAmount();
        }
        
        // Validate approved amount
        if (approvedAmount.compareTo(claim.getBillAmount()) > 0) {
            throw new RuntimeException("Approved amount cannot exceed bill amount");
        }
        
        if (approvedAmount.compareTo(emp.getRemainingCoverage()) > 0) {
            throw new RuntimeException("Approved amount exceeds remaining coverage");
        }
        
        if (approvedAmount.compareTo(maxClaimable) > 0) {
            throw new RuntimeException("Approved amount exceeds tenure-based limit: " + maxClaimable);
        }
        
        // Deduct from remaining coverage
        emp.setRemainingCoverage(emp.getRemainingCoverage().subtract(approvedAmount));
        employeeRepository.save(emp);
        
        User reviewer = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        claim.setStatus(ClaimStatus.APPROVED);
        claim.setApprovedAmount(approvedAmount);
        claim.setReviewedBy(reviewer);
        claim.setReviewDate(LocalDateTime.now());
        claimRepository.save(claim);
    }

    @Transactional
    public void rejectClaim(Long claimId, ClaimRejectionDTO dto, String username) {
        Claim claim = claimRepository.findById(claimId)
            .orElseThrow(() -> new RuntimeException("Claim not found"));
        
        if (claim.getStatus() != ClaimStatus.UNDER_REVIEW) {
            throw new RuntimeException("Only claims UNDER_REVIEW can be rejected");
        }
        
        User reviewer = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        claim.setStatus(ClaimStatus.REJECTED);
        claim.setRejectionReason(dto.getRejectionReason());
        claim.setReviewedBy(reviewer);
        claim.setReviewDate(LocalDateTime.now());
        claimRepository.save(claim);
    }
}

