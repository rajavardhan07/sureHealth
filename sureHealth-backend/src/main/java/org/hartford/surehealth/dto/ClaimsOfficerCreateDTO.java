package org.hartford.surehealth.dto;

import lombok.Data;

@Data
public class ClaimsOfficerCreateDTO {
    private String username;
    private String password;
    private String fullName;
}
