package org.hartford.surehealth.entity;

import org.hartford.surehealth.enums.PolicyStatus;
import org.hartford.surehealth.enums.BillingCycle;


import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GroupPolicy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String policyNumber;

    private LocalDate startDate;
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    private PolicyStatus status = PolicyStatus.PENDING_ADMIN_APPROVAL;

    @Enumerated(EnumType.STRING)
    private BillingCycle billingCycle = BillingCycle.QUARTERLY;

    private LocalDate nextBillingDate;

    private BigDecimal calculatedPremium;
    private BigDecimal riskMultiplier;
    private BigDecimal basePremium;
    
    private BigDecimal customPremiumPerEmployee;

    @Column(name = "waiting_period_days", nullable = false, columnDefinition = "int default 0")
    private Integer waitingPeriodDays = 0;

    @ManyToOne
    @JoinColumn(name = "corporate_id")
    private CorporateClient corporateClient;

    @ManyToOne
    @JoinColumn(name = "plan_id")
    private InsurancePlan insurancePlan;

    @ManyToOne
    @JoinColumn(name = "underwriter_id")
    private User assignedUnderwriter;

    @OneToMany(mappedBy = "groupPolicy")
    @JsonIgnoreProperties("groupPolicy")
    private List<Employee> employees;

    @OneToMany(mappedBy = "groupPolicy")
    @JsonIgnore
    private List<Claim> claims;

    @OneToMany(mappedBy = "groupPolicy")
    @JsonIgnore
    private List<PremiumInvoice> invoices;

    private String underwriterComment;

    private LocalDateTime createdAt = LocalDateTime.now();
}



