package org.hartford.surehealth.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class QuoteDTO {
    private BigDecimal basePremiumPerEmployee;
    private BigDecimal riskMultiplier;
    private BigDecimal calculatedPremiumPerEmployee;
    private RiskBreakdownDTO riskBreakdown;
}

