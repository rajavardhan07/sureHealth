package org.hartford.surehealth.service;

import lombok.RequiredArgsConstructor;
import org.hartford.surehealth.entity.*;
import org.hartford.surehealth.enums.BillingCycle;
import org.hartford.surehealth.enums.InvoiceStatus;
import org.hartford.surehealth.enums.PolicyStatus;
import org.hartford.surehealth.repository.EmployeeRepository;
import org.hartford.surehealth.repository.GroupPolicyRepository;
import org.hartford.surehealth.repository.PremiumInvoiceRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BillingService {

    private final GroupPolicyRepository policyRepository;
    private final PremiumInvoiceRepository invoiceRepository;
    private final EmployeeRepository employeeRepository;

    @Scheduled(cron = "0 0 2 * * ?") // Runs daily at 2 AM
    @Transactional
    public void generateScheduledInvoices() {
        LocalDate today = LocalDate.now();
        
        List<GroupPolicy> policies = policyRepository.findByStatus(PolicyStatus.APPROVED);
        
        for (GroupPolicy policy : policies) {
            if (policy.getNextBillingDate() != null && 
                !policy.getNextBillingDate().isAfter(today)) {
                generateInvoice(policy);
            }
        }
        
        markOverdueInvoices();
    }

    @Transactional
    public void generateInvoice(GroupPolicy policy) {
        BigDecimal totalAmount;
        if (policy.getCalculatedPremium() != null) {
            totalAmount = policy.getCalculatedPremium();
        } else {
            long activeEmployeeCount = employeeRepository.countByCorporateClientId(
                policy.getCorporateClient().getId()
            );
            
            BigDecimal premiumPerEmployee = policy.getInsurancePlan().getPremiumPerEmployee();
            totalAmount = premiumPerEmployee.multiply(BigDecimal.valueOf(activeEmployeeCount));
        }
        
        PremiumInvoice invoice = new PremiumInvoice();
        invoice.setInvoiceNumber("INV-" + System.currentTimeMillis());
        invoice.setIssueDate(LocalDate.now());
        invoice.setDueDate(LocalDate.now().plusDays(30));
        invoice.setTotalAmount(totalAmount);
        invoice.setStatus(InvoiceStatus.UNPAID);
        invoice.setGroupPolicy(policy);
        
        invoiceRepository.save(invoice);
        
        updateNextBillingDate(policy);
    }

    private void updateNextBillingDate(GroupPolicy policy) {
        LocalDate nextDate;
        if (policy.getBillingCycle() == BillingCycle.MONTHLY) {
            nextDate = policy.getNextBillingDate().plusMonths(1);
        } else {
            nextDate = policy.getNextBillingDate().plusMonths(3);
        }
        policy.setNextBillingDate(nextDate);
        policyRepository.save(policy);
    }

    @Transactional
    public void markOverdueInvoices() {
        List<PremiumInvoice> overdueInvoices = invoiceRepository.findOverdueInvoices(LocalDate.now());
        for (PremiumInvoice invoice : overdueInvoices) {
            invoice.setStatus(InvoiceStatus.OVERDUE);
            invoiceRepository.save(invoice);
        }
    }

    public List<PremiumInvoice> getInvoicesByPolicy(Long policyId) {
        return invoiceRepository.findByGroupPolicyId(policyId);
    }

    public List<PremiumInvoice> getInvoicesByCorporate(Long corporateId) {
        return invoiceRepository.findByGroupPolicyCorporateClientId(corporateId);
    }

    public List<PremiumInvoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }

    @Transactional
    public void generateInvoiceForPolicy(Long policyId) {
        GroupPolicy policy = policyRepository.findById(policyId)
            .orElseThrow(() -> new RuntimeException("Policy not found"));
        generateInvoice(policy);
    }
}

