package org.hartford.surehealth.controller;

import lombok.RequiredArgsConstructor;
import org.hartford.surehealth.entity.PremiumInvoice;
import org.hartford.surehealth.entity.User;
import org.hartford.surehealth.repository.UserRepository;
import org.hartford.surehealth.service.BillingService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final BillingService billingService;
    private final UserRepository userRepository;

    @GetMapping("/my")
    @PreAuthorize("hasRole('HR')")
    public List<PremiumInvoice> getMyInvoices(Authentication auth) {
        User user = userRepository.findByUsername(auth.getName()).orElseThrow();
        return billingService.getInvoicesByCorporate(user.getCorporateClient().getId());
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public List<PremiumInvoice> getAllInvoices() {
        return billingService.getAllInvoices();
    }

    @GetMapping("/policy/{policyId}")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public List<PremiumInvoice> getInvoicesByPolicy(@PathVariable("policyId") Long policyId) {
        return billingService.getInvoicesByPolicy(policyId);
    }

    @PostMapping("/generate/{policyId}")
    @PreAuthorize("hasRole('ADMIN')")
    public void generateInvoiceForPolicy(@PathVariable("policyId") Long policyId) {
        billingService.generateInvoiceForPolicy(policyId);
    }
}

