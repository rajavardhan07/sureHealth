package org.hartford.surehealth.controller;

import lombok.RequiredArgsConstructor;
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
    @PreAuthorize("permitAll()")
    public ClaimsOfficerDashboardDTO getClaimsOfficerDashboard() {
        return dashboardService.getClaimsOfficerDashboard();
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public AdminDashboardDTO getAdminDashboard() {
        return dashboardService.getAdminDashboardStats();
    }
}

