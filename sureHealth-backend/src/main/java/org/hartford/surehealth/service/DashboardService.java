package org.hartford.surehealth.service;

import lombok.RequiredArgsConstructor;
import org.hartford.surehealth.dto.ClaimsOfficerDashboardDTO;
import org.hartford.surehealth.entity.ClaimStatus;
import org.hartford.surehealth.repository.ClaimRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ClaimRepository claimRepository;

    public ClaimsOfficerDashboardDTO getClaimsOfficerDashboard() {
        long totalClaims = claimRepository.count();
        long pendingClaims = claimRepository.countByStatus(ClaimStatus.SUBMITTED);
        long approvedToday = claimRepository.countByStatusAndReviewDate(ClaimStatus.APPROVED, LocalDate.now());
        long rejectedToday = claimRepository.countByStatusAndReviewDate(ClaimStatus.REJECTED, LocalDate.now());

        return new ClaimsOfficerDashboardDTO(totalClaims, pendingClaims, approvedToday, rejectedToday);
    }
}
