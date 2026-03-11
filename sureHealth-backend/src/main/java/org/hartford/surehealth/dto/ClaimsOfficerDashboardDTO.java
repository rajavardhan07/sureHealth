package org.hartford.surehealth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ClaimsOfficerDashboardDTO {
    private long totalClaims;
    private long pendingClaims;
    private long approvedToday;
    private long rejectedToday;
}

