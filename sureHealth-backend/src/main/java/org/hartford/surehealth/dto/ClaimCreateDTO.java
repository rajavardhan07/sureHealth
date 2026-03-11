package org.hartford.surehealth.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClaimCreateDTO {
    @NotNull(message = "Employee ID is required")
    public Long employeeId;
    
    @NotNull(message = "Policy ID is required")
    public Long policyId;
    
    @NotNull(message = "Bill amount is required")
    @DecimalMin(value = "0.01", message = "Bill amount must be greater than 0")
    public BigDecimal billAmount;
    
    @NotBlank(message = "Hospital name is required")
    public String hospitalName;
    
    @NotBlank(message = "Diagnosis is required")
    public String diagnosis;
    
    @NotNull(message = "Treatment date is required")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    public LocalDate treatmentDate;
    
    @NotBlank(message = "Bill number is required")
    public String billNumber;
    
    public String claimType;
}



