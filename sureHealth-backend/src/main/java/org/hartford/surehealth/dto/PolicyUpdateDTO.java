package org.hartford.surehealth.dto;

import lombok.Data;
import org.hartford.surehealth.enums.PolicyStatus;
import org.hartford.surehealth.enums.BillingCycle;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class PolicyUpdateDTO {
    private PolicyStatus status;
    private BillingCycle billingCycle;
    private BigDecimal basePremium;
    private BigDecimal customPremiumPerEmployee;
    private Integer waitingPeriodDays;
    private LocalDate startDate;
    private LocalDate endDate;
}
