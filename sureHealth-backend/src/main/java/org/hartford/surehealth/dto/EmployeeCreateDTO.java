package org.hartford.surehealth.dto;

import lombok.Data;

@Data
public class EmployeeCreateDTO {
    public Long corporateId;
    public String fullName;
    public String email;
    public String phone;
    public Integer age;
    public String department;
    public String gender;
    public String designation;
    public String joinDate;
}


