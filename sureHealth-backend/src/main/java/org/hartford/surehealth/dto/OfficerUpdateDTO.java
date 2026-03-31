package org.hartford.surehealth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OfficerUpdateDTO {
    private String fullName;
    private String phoneNumber;
    private String department;
    private String licenseNumber;
    private Double commissionPercentage;
}
