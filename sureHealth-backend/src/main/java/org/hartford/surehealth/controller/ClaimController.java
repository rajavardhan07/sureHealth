package org.hartford.surehealth.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.hartford.surehealth.dto.ClaimApprovalDTO;
import org.hartford.surehealth.dto.ClaimCreateDTO;
import org.hartford.surehealth.dto.ClaimRejectionDTO;
import org.hartford.surehealth.entity.Claim;
// import org.hartford.surehealth.enums.ClaimStatus;
import org.hartford.surehealth.entity.User;
import org.hartford.surehealth.repository.ClaimRepository;
import org.hartford.surehealth.repository.UserRepository;
import org.hartford.surehealth.service.AiVisionService;
import org.hartford.surehealth.service.ClaimService;
import org.hartford.surehealth.dto.ClaimOcrResultDTO;
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
    private final AiVisionService aiVisionService;

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
    public void startReview(@PathVariable("id") Long id, Authentication auth) {
        claimService.startReview(id, auth.getName());
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('CLAIMS_OFFICER')")
    public void approve(@PathVariable("id") Long id, @Valid @RequestBody ClaimApprovalDTO dto, Authentication auth) {
        claimService.approveClaim(id, dto, auth.getName());
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('CLAIMS_OFFICER')")
    public void reject(@PathVariable("id") Long id, @Valid @RequestBody ClaimRejectionDTO dto, Authentication auth) {
        claimService.rejectClaim(id, dto, auth.getName());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'CLAIMS_OFFICER')")
    public Claim getClaimById(@PathVariable("id") Long id) {
        return claimRepository.findById(id).orElseThrow();
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Claim> getAllClaims() {
        return claimRepository.findAll();
    }

    @PutMapping("/{id}/suspend")
    @PreAuthorize("hasRole('ADMIN')")
    public void suspend(@PathVariable("id") Long id) {
        claimService.suspendClaim(id);
    }

    @GetMapping("/{id}/report")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'CLAIMS_OFFICER')")
    public org.springframework.http.ResponseEntity<byte[]> getClaimReport(@PathVariable("id") Long id) {
        Claim claim = claimRepository.findById(id).orElseThrow();
        if (claim.getClaimReportFile() == null) {
            return org.springframework.http.ResponseEntity.notFound().build();
        }
        return org.springframework.http.ResponseEntity.ok()
            .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + claim.getClaimReportFileName() + "\"")
            .body(claim.getClaimReportFile());
    }

    @PutMapping("/{id}/request-more-info")
    @PreAuthorize("hasRole('CLAIMS_OFFICER')")
    public void requestMoreInfo(@PathVariable("id") Long id, @RequestBody java.util.Map<String, String> body) {
        claimService.requestMoreInfo(id, body.get("reason"));
    }

    @GetMapping("/{id}/verify-ocr")
    @PreAuthorize("hasRole('CLAIMS_OFFICER')")
    public ClaimOcrResultDTO verifyOcr(@PathVariable("id") Long id) throws Exception {
        Claim claim = claimRepository.findById(id).orElseThrow();
        if (claim.getClaimReportFile() == null) {
            throw new RuntimeException("No document attached to this claim.");
        }
        
        String mimeType = "application/pdf";
        if (claim.getClaimReportFileName() != null) {
            String lowerName = claim.getClaimReportFileName().toLowerCase();
            if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) mimeType = "image/jpeg";
            else if (lowerName.endsWith(".png")) mimeType = "image/png";
        }

        return aiVisionService.verifyClaimOcr(claim.getClaimReportFile(), mimeType);
    }

    @PutMapping(value = "/{id}/respond-to-issue", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('EMPLOYEE')")
    public void respondToIssue(@PathVariable("id") Long id, @ModelAttribute ClaimCreateDTO dto, @RequestParam(value = "file", required = false) MultipartFile file) throws Exception {
        claimService.respondToIssue(id, dto, file);
    }
}



