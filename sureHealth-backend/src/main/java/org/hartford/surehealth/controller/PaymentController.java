package org.hartford.surehealth.controller;

import lombok.RequiredArgsConstructor;
import org.hartford.surehealth.dto.PaymentDTO;
import org.hartford.surehealth.entity.Payment;
import org.hartford.surehealth.entity.PremiumInvoice;
import org.hartford.surehealth.service.PaymentService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/pay")
    @PreAuthorize("hasRole('HR')")
    public Payment payInvoice(@RequestBody PaymentDTO dto) {
        return paymentService.processPayment(dto);
    }

    @GetMapping("/invoice/{invoiceId}")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public List<Payment> getPaymentsByInvoice(@PathVariable Long invoiceId) {
        return paymentService.getPaymentsByInvoice(invoiceId);
    }

    @GetMapping("/invoice/{invoiceId}/details")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public PremiumInvoice getInvoiceDetails(@PathVariable Long invoiceId) {
        return paymentService.getInvoiceById(invoiceId);
    }
}
