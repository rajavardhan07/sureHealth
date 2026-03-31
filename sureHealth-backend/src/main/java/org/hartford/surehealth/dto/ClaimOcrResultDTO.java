package org.hartford.surehealth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClaimOcrResultDTO {
    private String hospitalName;
    private String patientName;
    private String diagnosis;
    private Double billAmount;
    private String billNumber;
    private String treatmentDate;
}
