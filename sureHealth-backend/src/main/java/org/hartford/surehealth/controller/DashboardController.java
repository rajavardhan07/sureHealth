package org.hartford.surehealth.controller;

import lombok.RequiredArgsConstructor;
import java.security.Principal;
import org.hartford.surehealth.dto.AdminDashboardDTO;
import org.hartford.surehealth.dto.ClaimsOfficerDashboardDTO;
import org.hartford.surehealth.service.DashboardService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/claims-officer")
    @PreAuthorize("hasRole('CLAIMS_OFFICER')")
    public ClaimsOfficerDashboardDTO getClaimsOfficerDashboard(Principal principal) {
        System.out.println("Claims Officer Dashboard controller called for user: " + principal.getName());
        return dashboardService.getClaimsOfficerDashboard(principal.getName());
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public AdminDashboardDTO getAdminDashboard() {
        return dashboardService.getAdminDashboardStats();
    }

    @GetMapping("/underwriter")
    @PreAuthorize("hasRole('UNDERWRITER')")
    public org.hartford.surehealth.dto.UnderwriterDashboardDTO getUnderwriterDashboard(Principal principal) {
        return dashboardService.getUnderwriterDashboard(principal.getName());
    }
}

