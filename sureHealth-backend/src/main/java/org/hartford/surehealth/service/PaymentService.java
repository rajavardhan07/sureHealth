package org.hartford.surehealth.service;

import lombok.RequiredArgsConstructor;
import org.hartford.surehealth.dto.PaymentDTO;
import org.hartford.surehealth.entity.*;
import org.hartford.surehealth.enums.InvoiceStatus;
import org.hartford.surehealth.enums.PaymentStatus;
import org.hartford.surehealth.exceptions.InvalidOperationException;
import org.hartford.surehealth.exceptions.ResourceNotFoundException;
import org.hartford.surehealth.repository.PaymentRepository;
import org.hartford.surehealth.repository.PremiumInvoiceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PremiumInvoiceRepository invoiceRepository;
    private final org.hartford.surehealth.repository.GroupPolicyRepository groupPolicyRepository;
    private final org.hartford.surehealth.repository.EmployeeRepository employeeRepository;

    @Transactional
    public Payment processPayment(PaymentDTO dto) {
        PremiumInvoice invoice = invoiceRepository.findById(dto.invoiceId)
            .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with ID: " + dto.invoiceId));

        if (invoice.getStatus() == InvoiceStatus.PAID) {
            throw new InvalidOperationException("Invoice is already paid");
        }

        if (invoice.getStatus() == InvoiceStatus.OVERDUE) {
            throw new InvalidOperationException("Cannot pay overdue invoice without penalty clearance");
        }

        if (dto.amountPaid.compareTo(invoice.getTotalAmount()) < 0) {
            throw new InvalidOperationException("Partial payments not allowed. Full amount required: " + invoice.getTotalAmount());
        }

        Payment payment = new Payment();
        payment.setPaymentReferenceNumber("PAY-" + System.currentTimeMillis());
        payment.setPaymentDate(LocalDate.now());
        payment.setAmountPaid(dto.amountPaid);
        payment.setPaymentMode(dto.paymentMode);
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setInvoice(invoice);

        paymentRepository.save(payment);

        invoice.setStatus(InvoiceStatus.PAID);
        invoice.setPaymentDate(LocalDate.now());
        invoiceRepository.save(invoice);

        // Check if this payment activates the policy
        if (invoice.getGroupPolicy() != null && 
            invoice.getGroupPolicy().getStatus() == org.hartford.surehealth.enums.PolicyStatus.PENDING_HR_APPROVAL) {
            
            GroupPolicy policy = invoice.getGroupPolicy();
            policy.setStatus(org.hartford.surehealth.enums.PolicyStatus.APPROVED);
            policy.setStartDate(LocalDate.now());
            policy.setEndDate(LocalDate.now().plusYears(1));
            policy.setNextBillingDate(LocalDate.now().plusMonths(3));
            
            groupPolicyRepository.save(policy);

            List<Employee> employees = employeeRepository.findByGroupPolicyId(policy.getId());
            for (Employee emp : employees) {
                emp.setCoverageAmount(policy.getInsurancePlan().getCoverageAmount());
                emp.setRemainingCoverage(policy.getInsurancePlan().getCoverageAmount());
            }
            employeeRepository.saveAll(employees);
        }

        return payment;
    }

    public List<Payment> getPaymentsByInvoice(Long invoiceId) {
        return paymentRepository.findByInvoiceId(invoiceId);
    }

    public PremiumInvoice getInvoiceById(Long invoiceId) {
        return invoiceRepository.findById(invoiceId)
            .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with ID: " + invoiceId));
    }
}

