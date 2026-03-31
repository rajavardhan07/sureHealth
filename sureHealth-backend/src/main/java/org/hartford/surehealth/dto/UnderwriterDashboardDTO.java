package org.hartford.surehealth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UnderwriterDashboardDTO {
    private long totalAssigned;
    private long pendingReviews;
    private long approvedPolicies;
    private long issuesRaised;
}
