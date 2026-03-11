package org.hartford.surehealth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class EmployeeCreateDTO {
    @NotNull(message = "Corporate ID is required")
    public Long corporateId;
    
    @NotBlank(message = "Full name is required")
    public String fullName;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    public String email;
    
    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be 10 digits")
    public String phone;
    
    @NotNull(message = "Age is required")
    @Positive(message = "Age must be positive")
    public Integer age;
    
    public String department;
    public String gender;
    public String designation;
    public String joinDate;
}



