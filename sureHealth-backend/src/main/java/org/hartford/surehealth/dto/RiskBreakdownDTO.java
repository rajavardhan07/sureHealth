package org.hartford.surehealth.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class RiskBreakdownDTO {
    private BigDecimal ageFactor;
    private BigDecimal industryFactor;
    private BigDecimal claimHistoryFactor;
    private BigDecimal coverageFactor;
    private BigDecimal groupSizeFactor;
    private BigDecimal finalMultiplier;
}

