package org.hartford.surehealth.controller;

import lombok.RequiredArgsConstructor;
import org.hartford.surehealth.dto.ClaimApprovalDTO;
import org.hartford.surehealth.dto.ClaimCreateDTO;
import org.hartford.surehealth.dto.ClaimRejectionDTO;
import org.hartford.surehealth.entity.Claim;
import org.hartford.surehealth.entity.ClaimStatus;
import org.hartford.surehealth.entity.User;
import org.hartford.surehealth.repository.ClaimRepository;
import org.hartford.surehealth.repository.UserRepository;
import org.hartford.surehealth.service.ClaimService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;

import java.util.List;

@RestController
@RequestMapping("/api/claims")
@RequiredArgsConstructor
public class ClaimController {

    private final ClaimService claimService;
    private final ClaimRepository claimRepository;
    private final UserRepository userRepository;

    @PostMapping(value = "/file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('EMPLOYEE')")
    public Claim file(@ModelAttribute ClaimCreateDTO dto, @RequestParam(value = "file", required = false) MultipartFile file) throws Exception {
        System.out.println("ENTRY: ClaimController.file - DTO: " + dto);
        System.out.println("ENTRY: ClaimController.file - File: " + (file != null ? file.getOriginalFilename() : "null"));
        return claimService.fileClaim(dto, file);
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public List<Claim> getMyClaims(Authentication auth) {
        User user = userRepository.findByUsername(auth.getName()).orElseThrow();
        return claimRepository.findByEmployeeId(user.getEmployee().getId());
    }

    @GetMapping("/review-queue")
    @PreAuthorize("hasRole('CLAIMS_OFFICER')")
    public List<Claim> getReviewQueue(Authentication auth) {
        User officer = userRepository.findByUsername(auth.getName()).orElseThrow();
        return claimRepository.findByAssignedOfficerId(officer.getId());
    }

    @PutMapping("/{id}/start-review")
    @PreAuthorize("hasRole('CLAIMS_OFFICER')")
    public void startReview(@PathVariable Long id, Authentication auth) {
        claimService.startReview(id, auth.getName());
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('CLAIMS_OFFICER')")
    public void approve(@PathVariable Long id, @RequestBody ClaimApprovalDTO dto, Authentication auth) {
        claimService.approveClaim(id, dto, auth.getName());
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('CLAIMS_OFFICER')")
    public void reject(@PathVariable Long id, @RequestBody ClaimRejectionDTO dto, Authentication auth) {
        claimService.rejectClaim(id, dto, auth.getName());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'CLAIMS_OFFICER')")
    public Claim getClaimById(@PathVariable Long id) {
        return claimRepository.findById(id).orElseThrow();
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Claim> getAllClaims() {
        return claimRepository.findAll();
    }

    @PutMapping("/{id}/suspend")
    @PreAuthorize("hasRole('ADMIN')")
    public void suspend(@PathVariable Long id) {
        claimService.suspendClaim(id);
    }
}


