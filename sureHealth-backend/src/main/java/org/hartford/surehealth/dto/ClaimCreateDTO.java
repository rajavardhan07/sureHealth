package org.hartford.surehealth.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ClaimCreateDTO {
    public Long employeeId;
    public Long policyId;
    public BigDecimal billAmount;
    public String hospitalName;
    public String diagnosis;
    public LocalDate treatmentDate;
    public String billNumber;
}


