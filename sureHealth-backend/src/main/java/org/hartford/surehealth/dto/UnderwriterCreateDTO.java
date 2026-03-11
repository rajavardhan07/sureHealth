package org.hartford.surehealth.dto;

import lombok.Data;

@Data
public class UnderwriterCreateDTO {
    private String username;
    private String password;
    private String fullName;
    private String phoneNumber;
    private String licenseNumber;
    private Double commissionPercentage;
}
