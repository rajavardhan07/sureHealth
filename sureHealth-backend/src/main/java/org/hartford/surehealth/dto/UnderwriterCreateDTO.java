package org.hartford.surehealth.dto;

import lombok.Data;

@Data
public class UnderwriterCreateDTO {
    private String username;
    private String password;
    private String fullName;
}
