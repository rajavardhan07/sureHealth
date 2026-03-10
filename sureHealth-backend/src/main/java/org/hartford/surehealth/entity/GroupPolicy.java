package org.hartford.surehealth.entity;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
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
    private BillingCycle billingCycle = BillingCycle.MONTHLY;

    private LocalDate nextBillingDate;

    private BigDecimal calculatedPremium;
    private BigDecimal riskMultiplier;
    private BigDecimal basePremium;

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
    @JsonIgnore
    private List<Employee> employees;

    @OneToMany(mappedBy = "groupPolicy")
    @JsonIgnore
    private List<Claim> claims;

    @OneToMany(mappedBy = "groupPolicy")
    @JsonIgnore
    private List<PremiumInvoice> invoices;
}


