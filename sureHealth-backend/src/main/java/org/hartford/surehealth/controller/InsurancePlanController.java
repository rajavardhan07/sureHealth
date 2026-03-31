package org.hartford.surehealth.controller;

import lombok.RequiredArgsConstructor;
import org.hartford.surehealth.entity.InsurancePlan;
import org.hartford.surehealth.repository.InsurancePlanRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api/plans")
@RequiredArgsConstructor
public class InsurancePlanController {

    private final InsurancePlanRepository planRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'UNDERWRITER')")
    public List<InsurancePlan> getActivePlans() {
        return planRepository.findByActiveTrue();
    }

    @GetMapping("/public")
    public List<InsurancePlan> getPublicActivePlans() {
        return planRepository.findByActiveTrue();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'UNDERWRITER')")
    public InsurancePlan getPlanById(@PathVariable("id") Long id) {
        return planRepository.findById(id).orElseThrow();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public InsurancePlan createPlan(@RequestBody InsurancePlan plan) {
        plan.setActive(true);
        return planRepository.save(plan);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public InsurancePlan updatePlan(@PathVariable("id") Long id, @RequestBody InsurancePlan planDetails) {
        InsurancePlan plan = planRepository.findById(id).orElseThrow();
        plan.setPlanName(planDetails.getPlanName());
        plan.setCoverageAmount(planDetails.getCoverageAmount());
        plan.setPremiumPerEmployee(planDetails.getPremiumPerEmployee());
        plan.setDescription(planDetails.getDescription());
        plan.setDurationMonths(planDetails.getDurationMonths());
        plan.setWaitingPeriodDays(planDetails.getWaitingPeriodDays());
        return planRepository.save(plan);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deletePlan(@PathVariable("id") Long id) {
        planRepository.deleteById(id);
    }

    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public void deactivatePlan(@PathVariable("id") Long id) {
        InsurancePlan plan = planRepository.findById(id).orElseThrow();
        plan.setActive(false);
        planRepository.save(plan);
    }

    @PutMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public void activatePlan(@PathVariable("id") Long id) {
        InsurancePlan plan = planRepository.findById(id).orElseThrow();
        plan.setActive(true);
        planRepository.save(plan);
    }
}



