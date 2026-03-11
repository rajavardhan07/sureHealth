package org.hartford.surehealth.service;

import lombok.RequiredArgsConstructor;
import org.hartford.surehealth.dto.ClaimApprovalDTO;
import org.hartford.surehealth.dto.ClaimCreateDTO;
import org.hartford.surehealth.dto.ClaimRejectionDTO;
import org.hartford.surehealth.entity.*;
import org.hartford.surehealth.enums.ClaimStatus;
import org.hartford.surehealth.enums.Role;
import org.hartford.surehealth.exceptions.InsufficientCoverageException;
import org.hartford.surehealth.exceptions.InvalidOperationException;
import org.hartford.surehealth.exceptions.ResourceNotFoundException;
import org.hartford.surehealth.repository.ClaimRepository;
import org.hartford.surehealth.repository.EmployeeRepository;
import org.hartford.surehealth.repository.GroupPolicyRepository;
import org.hartford.surehealth.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

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

    public Claim fileClaim(ClaimCreateDTO dto, MultipartFile file) throws Exception {

        Employee emp = employeeRepository.findById(dto.employeeId)
            .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + dto.employeeId));
        GroupPolicy policy = policyRepository.findById(dto.policyId)
            .orElseThrow(() -> new ResourceNotFoundException("Policy not found with ID: " + dto.policyId));

        // Randomly assign a claims officer
        List<User> officers = userRepository.findByRole(Role.CLAIMS_OFFICER);
        if (officers.isEmpty()) {
            throw new ResourceNotFoundException("No claims officers available in the system");
        }
        User assignedOfficer = officers.get(random.nextInt(officers.size()));

        Claim claim = new Claim();
        claim.setClaimNumber("CLM-" + System.currentTimeMillis());
        claim.setBillAmount(dto.billAmount);
        claim.setHospitalName(dto.hospitalName);
        claim.setDiagnosis(dto.diagnosis);
        claim.setTreatmentDate(dto.treatmentDate);
        claim.setBillNumber(dto.billNumber);
        claim.setClaimType(dto.claimType);
        claim.setEmployee(emp);
        claim.setGroupPolicy(policy);
        claim.setAssignedOfficer(assignedOfficer);

        if (file != null && !file.isEmpty()) {
            claim.setClaimReportFile(file.getBytes());
            claim.setClaimReportFileName(file.getOriginalFilename());
        }

        return claimRepository.save(claim);
    }

    @Transactional
    public void startReview(Long claimId, String username) {
        Claim claim = claimRepository.findById(claimId)
            .orElseThrow(() -> new ResourceNotFoundException("Claim not found with ID: " + claimId));
        
        if (claim.getStatus() != ClaimStatus.SUBMITTED) {
            throw new InvalidOperationException("Only SUBMITTED claims can be reviewed. Current status: " + claim.getStatus());
        }
        
        User reviewer = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        
        claim.setStatus(ClaimStatus.UNDER_REVIEW);
        claim.setReviewedBy(reviewer);
        claimRepository.save(claim);
    }

    @Transactional
    public void approveClaim(Long claimId, ClaimApprovalDTO dto, String username) {
        Claim claim = claimRepository.findById(claimId)
            .orElseThrow(() -> new ResourceNotFoundException("Claim not found with ID: " + claimId));
        
        if (claim.getStatus() != ClaimStatus.UNDER_REVIEW) {
            throw new InvalidOperationException("Only claims UNDER_REVIEW can be approved. Current status: " + claim.getStatus());
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
            throw new InvalidOperationException("Approved amount cannot exceed bill amount of " + claim.getBillAmount());
        }
        
        if (approvedAmount.compareTo(emp.getRemainingCoverage()) > 0) {
            throw new InsufficientCoverageException("Approved amount exceeds remaining coverage of " + emp.getRemainingCoverage());
        }
        
        if (approvedAmount.compareTo(maxClaimable) > 0) {
            throw new InsufficientCoverageException("Approved amount exceeds tenure-based limit of " + maxClaimable + " (" + monthsWorked + " months worked)");
        }
        
        // Deduct from remaining coverage
        emp.setRemainingCoverage(emp.getRemainingCoverage().subtract(approvedAmount));
        employeeRepository.save(emp);
        
        User reviewer = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        
        claim.setStatus(ClaimStatus.APPROVED);
        claim.setApprovedAmount(approvedAmount);
        claim.setReviewedBy(reviewer);
        claim.setReviewDate(LocalDateTime.now());
        claimRepository.save(claim);
    }

    @Transactional
    public void rejectClaim(Long claimId, ClaimRejectionDTO dto, String username) {
        Claim claim = claimRepository.findById(claimId)
            .orElseThrow(() -> new ResourceNotFoundException("Claim not found with ID: " + claimId));
        
        if (claim.getStatus() != ClaimStatus.UNDER_REVIEW) {
            throw new InvalidOperationException("Only claims UNDER_REVIEW can be rejected. Current status: " + claim.getStatus());
        }
        
        User reviewer = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        
        claim.setStatus(ClaimStatus.REJECTED);
        claim.setRejectionReason(dto.getRejectionReason());
        claim.setReviewedBy(reviewer);
        claim.setReviewDate(LocalDateTime.now());
        claimRepository.save(claim);
    }

    @Transactional
    public void suspendClaim(Long claimId) {
        Claim claim = claimRepository.findById(claimId)
            .orElseThrow(() -> new ResourceNotFoundException("Claim not found with ID: " + claimId));
        claim.setStatus(ClaimStatus.SUSPENDED);
        claimRepository.save(claim);
    }
}


