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

@Service
@RequiredArgsConstructor
public class ClaimService {

    private final ClaimRepository claimRepository;
    private final EmployeeRepository employeeRepository;
    private final GroupPolicyRepository policyRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public void assignOfficer(Long claimId, Long officerId) {
        Claim claim = claimRepository.findById(claimId)
            .orElseThrow(() -> new ResourceNotFoundException("Claim not found"));
        User officer = userRepository.findById(officerId)
            .orElseThrow(() -> new ResourceNotFoundException("Claims officer not found"));
        claim.setAssignedOfficer(officer);
        claimRepository.save(claim);
    }

    public Claim fileClaim(ClaimCreateDTO dto, MultipartFile file) throws Exception {

        Employee emp = employeeRepository.findById(dto.employeeId)
            .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + dto.employeeId));
        GroupPolicy policy = policyRepository.findById(dto.policyId)
            .orElseThrow(() -> new ResourceNotFoundException("Policy not found with ID: " + dto.policyId));

        if (policy.getStartDate() == null) {
            throw new InvalidOperationException("Policy is not yet active.");
        }

        Integer waitingPeriod = policy.getWaitingPeriodDays();
        if (waitingPeriod != null && waitingPeriod > 0) {
            LocalDate eligibleFromStart = policy.getStartDate().plusDays(waitingPeriod);
            if (LocalDate.now().isBefore(eligibleFromStart)) {
                throw new InvalidOperationException("Cannot file claim during the initial " + waitingPeriod + "-day waiting period. Eligible on: " + eligibleFromStart);
            }

            List<Claim> employeeClaims = claimRepository.findByEmployeeId(emp.getId());
            if (employeeClaims != null && !employeeClaims.isEmpty()) {
                Claim lastClaim = employeeClaims.stream()
                    .max(java.util.Comparator.comparing(Claim::getSubmissionDate))
                    .orElse(null);
                
                if (lastClaim != null && lastClaim.getSubmissionDate() != null) {
                    LocalDate eligibleFromLastClaim = lastClaim.getSubmissionDate().toLocalDate().plusDays(waitingPeriod);
                    if (LocalDate.now().isBefore(eligibleFromLastClaim)) {
                        throw new InvalidOperationException("You must wait " + waitingPeriod + " days between claims. Next eligible date: " + eligibleFromLastClaim);
                    }
                }
            }
        }

        // Assign to claims officer with the least number of assigned claims
        List<User> officers = userRepository.findByRole(Role.CLAIMS_OFFICER);
        if (officers.isEmpty()) {
            throw new ResourceNotFoundException("No claims officers available in the system");
        }
        User assignedOfficer = officers.stream()
            .min(java.util.Comparator.comparingLong(u -> claimRepository.countByAssignedOfficerId(u.getId())))
            .orElseThrow(() -> new ResourceNotFoundException("No claims officers available in the system"));

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

        Claim savedClaim = claimRepository.save(claim);

        // Notify all admins if claim amount > 5000
        if (claim.getBillAmount() != null && claim.getBillAmount().compareTo(BigDecimal.valueOf(5000)) > 0) {
            userRepository.findByRole(org.hartford.surehealth.enums.Role.ADMIN).forEach(admin -> {
                notificationService.createNotification(
                    admin,
                    "High-value claim submitted: $" + claim.getBillAmount() + " by " + emp.getFullName(),
                    org.hartford.surehealth.enums.NotificationType.ALERT
                );
            });
        }

        // Notify Claims Officer
        notificationService.createNotification(
            assignedOfficer,
            "New claim " + savedClaim.getClaimNumber() + " submitted by " + emp.getFullName() + " requires review.",
            org.hartford.surehealth.enums.NotificationType.INFO
        );

        return savedClaim;
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

        // Notify Employee
        userRepository.findByEmployee(emp).ifPresent(user -> {
            notificationService.createNotification(
                user,
                "Your claim " + claim.getClaimNumber() + " has been APPROVED for amount: " + approvedAmount,
                org.hartford.surehealth.enums.NotificationType.SUCCESS
            );
        });
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

        // Notify Employee
        userRepository.findByEmployee(claim.getEmployee()).ifPresent(user -> {
            notificationService.createNotification(
                user,
                "Your claim " + claim.getClaimNumber() + " has been REJECTED. Reason: " + dto.getRejectionReason(),
                org.hartford.surehealth.enums.NotificationType.ALERT
            );
        });
    }

    @Transactional
    public void suspendClaim(Long claimId) {
        Claim claim = claimRepository.findById(claimId)
            .orElseThrow(() -> new ResourceNotFoundException("Claim not found with ID: " + claimId));
        claim.setStatus(ClaimStatus.SUSPENDED);
        claimRepository.save(claim);
    }

    @Transactional
    public void requestMoreInfo(Long claimId, String reason) {
        Claim claim = claimRepository.findById(claimId)
            .orElseThrow(() -> new ResourceNotFoundException("Claim not found with ID: " + claimId));
        
        claim.setStatus(ClaimStatus.INFO_REQUIRED);
        claim.setRejectionReason(reason); // Reusing rejection reason field for info request details
        claimRepository.save(claim);

        // Notify Employee
        userRepository.findByEmployee(claim.getEmployee()).ifPresent(user -> {
            notificationService.createNotification(
                user,
                "More information required for your claim " + claim.getClaimNumber() + ". Detail: " + reason,
                org.hartford.surehealth.enums.NotificationType.INFO
            );
        });
    }

    @Transactional
    public void respondToIssue(Long claimId, ClaimCreateDTO dto, MultipartFile file) throws Exception {
        Claim claim = claimRepository.findById(claimId)
            .orElseThrow(() -> new ResourceNotFoundException("Claim not found with ID: " + claimId));

        if (claim.getStatus() != ClaimStatus.INFO_REQUIRED) {
            throw new InvalidOperationException("Can only respond to claims with INFO_REQUIRED status. Current status: " + claim.getStatus());
        }

        // Update claim fields with new data
        if (dto.hospitalName != null) claim.setHospitalName(dto.hospitalName);
        if (dto.diagnosis != null) claim.setDiagnosis(dto.diagnosis);
        if (dto.billAmount != null) claim.setBillAmount(dto.billAmount);
        if (dto.treatmentDate != null) claim.setTreatmentDate(dto.treatmentDate);
        if (dto.billNumber != null) claim.setBillNumber(dto.billNumber);

        if (file != null && !file.isEmpty()) {
            claim.setClaimReportFile(file.getBytes());
            claim.setClaimReportFileName(file.getOriginalFilename());
        }

        claim.setStatus(ClaimStatus.SUBMITTED);
        claim.setRejectionReason(null); // Clear the issue reason
        claimRepository.save(claim);

        // Notify the assigned officer
        if (claim.getAssignedOfficer() != null) {
            notificationService.createNotification(
                claim.getAssignedOfficer(),
                "Claim " + claim.getClaimNumber() + " has been resubmitted by " + claim.getEmployee().getFullName() + " with updated information.",
                org.hartford.surehealth.enums.NotificationType.INFO
            );
        }
    }
}


