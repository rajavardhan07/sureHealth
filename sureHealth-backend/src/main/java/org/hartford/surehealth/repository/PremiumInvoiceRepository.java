package org.hartford.surehealth.repository;

import org.hartford.surehealth.enums.InvoiceStatus;
import org.hartford.surehealth.entity.PremiumInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface PremiumInvoiceRepository extends JpaRepository<PremiumInvoice, Long> {
    List<PremiumInvoice> findByGroupPolicyId(Long policyId);
    List<PremiumInvoice> findByGroupPolicyCorporateClientId(Long corporateId);
    
    @Query("SELECT i FROM PremiumInvoice i WHERE i.status = 'UNPAID' AND i.dueDate < :date")
    List<PremiumInvoice> findOverdueInvoices(LocalDate date);
    
    @Query("SELECT COALESCE(SUM(i.totalAmount), 0) FROM PremiumInvoice i WHERE i.status = :status")
    java.math.BigDecimal getTotalRevenue(@org.springframework.data.repository.query.Param("status") InvoiceStatus status);
}

