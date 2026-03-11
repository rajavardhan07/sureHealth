package org.hartford.surehealth.dto;

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
    public Long employeeId;
    public Long policyId;
    public BigDecimal billAmount;
    public String hospitalName;
    public String diagnosis;
    
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    public LocalDate treatmentDate;
    public String billNumber;
    public String claimType;
}


