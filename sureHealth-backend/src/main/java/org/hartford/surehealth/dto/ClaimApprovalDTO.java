package org.hartford.surehealth.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ClaimApprovalDTO {
    private BigDecimal approvedAmount;
}
