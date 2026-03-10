package org.hartford.surehealth.entity;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Employee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;
    private String email;
    private String phone;
    private LocalDate dateOfBirth;
    private Integer age;
    private LocalDate joinDate;
    private String department;
    private String gender;
    private String designation;
    
    @Lob
    private byte[] healthReportFile;
    private String healthReportFileName;

    private BigDecimal coverageAmount;
    private BigDecimal remainingCoverage;

    private String employmentStatus = "ACTIVE";

    @ManyToOne
    @JoinColumn(name = "corporate_id")
    private CorporateClient corporateClient;

    @ManyToOne
    @JoinColumn(name = "policy_id")
    private GroupPolicy groupPolicy;

    @OneToMany(mappedBy = "employee")
    @JsonIgnore
    private List<Claim> claims;

}


