package org.hartford.surehealth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class CorporateRegisterDTO {
    @NotBlank(message = "Company name is required")
    @Size(min = 2, max = 100, message = "Company name must be between 2 and 100 characters")
    public String companyName;
    
    @NotBlank(message = "Registration number is required")
    public String registrationNumber;
    
    @NotBlank(message = "Contact person is required")
    public String contactPerson;
    
    @NotBlank(message = "Contact email is required")
    @Email(message = "Invalid email format")
    public String contactEmail;
    
    @NotBlank(message = "Contact phone is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be 10 digits")
    public String contactPhone;
    
    public Integer numberOfEmployees;
    public String industryType;
    
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    public String username;
    
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    public String password;
}



