package org.hartford.surehealth.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class UnderwriterCreateDTO {
    @NotBlank(message = "Username is required")
    private String username;
    
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
    
    @NotBlank(message = "Full name is required")
    private String fullName;
    
    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be 10 digits")
    private String phoneNumber;
    
    @NotBlank(message = "License number is required")
    private String licenseNumber;
    
    @NotNull(message = "Commission percentage is required")
    @DecimalMin(value = "0.0", message = "Commission percentage must be at least 0")
    @DecimalMax(value = "100.0", message = "Commission percentage must not exceed 100")
    private Double commissionPercentage;
}

