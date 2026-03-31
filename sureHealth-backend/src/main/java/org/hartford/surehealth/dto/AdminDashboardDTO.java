package org.hartford.surehealth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardDTO {
    private long totalClients;
    private long totalUnderwriters;
    private long totalClaimsOfficers;
    private long totalPlans;
    private long activePolicies;
    private long totalEmployees;
    private long pendingClaims;
    private java.math.BigDecimal totalRevenue;
    private long totalClaims;
    private java.util.Map<String, Long> claimsByStatus;
    private java.util.Map<String, Long> policiesByStatus;
}

