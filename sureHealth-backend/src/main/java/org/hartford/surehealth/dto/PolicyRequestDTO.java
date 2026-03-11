package org.hartford.surehealth.dto;

import jakarta.validation.constraints.NotNull;

import java.util.List;

public class PolicyRequestDTO {
    @NotNull(message = "Corporate ID is required")
    public Long corporateId;
    
    @NotNull(message = "Plan ID is required")
    public Long planId;
    
    public List<Long> employeeIds;
}



