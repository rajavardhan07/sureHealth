package org.hartford.surehealth.controller;

import lombok.RequiredArgsConstructor;
import org.hartford.surehealth.dto.ClaimsOfficerDashboardDTO;
import org.hartford.surehealth.service.DashboardService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/claims-officer")
    @PreAuthorize("hasRole('CLAIMS_OFFICER')")
    public ClaimsOfficerDashboardDTO getClaimsOfficerDashboard() {
        return dashboardService.getClaimsOfficerDashboard();
    }
}
